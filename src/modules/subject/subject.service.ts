import prisma from "../../config/prisma";
import { CreateSubjectInput, UpdateSubjectInput } from "./subject.validation";
import { findOrCreateByNames } from "../skill/skill.service";
import { HttpError } from "../../utils/httpError";
import { embedTexts } from "../../config/aiService";
import { resetCloCache } from "../../utils/semanticMatching";

const shape = (s: any) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  sks: s.sks,
  semester: s.semester,
  rps: s.rps,
  university: s.university,
  skills: s.skills.map((ss: any) => ss.skill),
  cloCount: s._count?.clos ?? undefined,
});

export const listSubjects = async (opts: {
  search?: string;
  universityId?: string;
}) => {
  const where: any = {};
  if (opts.universityId) where.universityId = opts.universityId;
  if (opts.search) {
    where.OR = [
      { code: { contains: opts.search, mode: "insensitive" } },
      { name: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  const subjects = await prisma.subject.findMany({
    where,
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
    orderBy: { code: "asc" },
  });

  // Jumlah CLO dihitung terpisah agar tidak bergantung pada nama relasi
  // di model Subject.
  const ids = subjects.map((s: any) => s.id);
  const cloGroups = ids.length
    ? await prisma.cLO.groupBy({ by: ["subjectId"], where: { subjectId: { in: ids } }, _count: true })
    : [];
  const cloCountBySubject = new Map<string, number>();
  for (const g of cloGroups as any[]) cloCountBySubject.set(g.subjectId, g._count);

  return subjects.map((s: any) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    sks: s.sks,
    semester: s.semester ?? null,
    skills: (s.skills ?? []).map((ss: any) => ss.skill),
    cloCount: cloCountBySubject.get(s.id) ?? 0,
  }));
};

export const getSubjectById = async (id: string) => {
  const s = await prisma.subject.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
      _count: { select: { clos: true } },
    },
  });
  return s ? shape(s) : null;
};

export const getSubjectCLOs = async (subjectId: string) => {
  return prisma.cLO.findMany({
    where: { subjectId },
    select: { id: true, code: true, text: true, paraphrase: true },
    orderBy: { code: "asc" },
  });
};

export const createSubject = async (universityId: string | null, data: CreateSubjectInput) => {
  const skills = await findOrCreateByNames(data.skills ?? []);
  const s = await prisma.subject.create({
    data: {
      code: data.code,
      name: data.name,
      sks: data.sks,
      semester: data.semester,
      rps: data.rps,
      universityId: universityId ?? data.universityId ?? null,
      skills: { create: skills.map((sk) => ({ skillId: sk.id })) },
    },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
    },
  });
  return shape(s);
};

export const updateSubject = async (id: string, data: UpdateSubjectInput) => {
  let skillOps: any = undefined;
  if (data.skills) {
    const skills = await findOrCreateByNames(data.skills);
    skillOps = { deleteMany: {}, create: skills.map((sk) => ({ skillId: sk.id })) };
  }
  const s = await prisma.subject.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      sks: data.sks,
      semester: data.semester,
      rps: data.rps,
      ...(skillOps ? { skills: skillOps } : {}),
    },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
    },
  });
  return shape(s);
};

export const deleteSubject = async (id: string) => {
  const dipakai = await prisma.subjectTaken.count({ where: { subjectId: id } });
  if (dipakai > 0) {
    throw new HttpError(
      400,
      `Mata kuliah ini sudah memiliki ${dipakai} data nilai mahasiswa dan tidak dapat dihapus. Hapus nilainya terlebih dahulu bila memang perlu.`,
    );
  }
  return prisma.subject.delete({ where: { id } });
};


const splitCsv = (csv?: string | null): string[] =>
  String(csv ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export const listClosBySubject = async (subjectId: string) => {
  const clos = await prisma.cLO.findMany({
    where: { subjectId },
    orderBy: { created_at: "asc" },
  });
  // Jumlah nilai per CLO, agar UI bisa memperingatkan sebelum menghapus.
  const ids = clos.map((c: any) => c.id);
  const gradeGroups = ids.length
    ? await prisma.cLOGrade.groupBy({ by: ["cloId"], where: { cloId: { in: ids } }, _count: true })
    : [];
  const gradeCountByClo = new Map<string, number>();
  for (const g of gradeGroups as any[]) gradeCountByClo.set(g.cloId, g._count);
  return clos.map((c: any, i: number) => ({
    id: c.id,
    subjectId: c.subjectId,
    code: c.code ?? c.kode ?? `CLO${i + 1}`,
    gradeCount: gradeCountByClo.get(c.id) ?? 0,
    // paraphrase adalah teks acuan; bila kosong, dipakai description
    description: c.paraphrase ?? c.description ?? c.text ?? "",
    skills: splitCsv(c.skills),
    hasEmbedding: !!c.embedding,
  }));
};

// Keahlian CLO ditambahkan ke keahlian mata kuliah agar tetap mengalir ke
// mahasiswa lewat mesin OBE. Sengaja hanya menambah, tidak menghapus, supaya
// keahlian yang sudah diatur manual di level mata kuliah tidak hilang.
const syncSubjectSkills = async (subjectId: string) => {
  const clos = await prisma.cLO.findMany({ where: { subjectId }, select: { skills: true } });
  const names = Array.from(new Set(clos.flatMap((c: any) => splitCsv(c.skills))));
  if (names.length === 0) return;

  const skills = await findOrCreateByNames(names);
  const sudahAda = await prisma.subjectSkill.findMany({
    where: { subjectId },
    select: { skillId: true },
  });
  const punya = new Set(sudahAda.map((s: any) => s.skillId));
  const baru = skills.filter((s) => !punya.has(s.id));
  if (baru.length === 0) return;

  await prisma.subjectSkill.createMany({
    data: baru.map((s) => ({ subjectId, skillId: s.id })),
  });
};

// Embedding harus dibuat ulang setiap teks CLO berubah; bila tidak, vektor lama
// tidak lagi mewakili isinya dan skor semantik jadi menyesatkan tanpa gejala.
const embedCloText = async (text: string): Promise<string | null> => {
  const vectors = await embedTexts([text]);
  return vectors && vectors[0] ? JSON.stringify(vectors[0]) : null;
};

export const createClo = async (
  subjectId: string,
  data: { code: string; description: string; skills?: string[] },
) => {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw new HttpError(404, "Mata kuliah tidak ditemukan");

  const embedding = await embedCloText(data.description);

  const clo = await prisma.cLO.create({
    data: {
      subjectId,
      code: data.code,
      description: data.description,
      skills: (data.skills ?? []).join(","),
      embedding,
    } as any,
  });

  await syncSubjectSkills(subjectId);
  resetCloCache(); // cache vektor CLO di memori ikut disegarkan
  return clo;
};

export const updateClo = async (
  cloId: string,
  data: { code?: string; description?: string; skills?: string[] },
) => {
  const clo = await prisma.cLO.findUnique({ where: { id: cloId } });
  if (!clo) throw new HttpError(404, "CLO tidak ditemukan");

  const payload: any = {};
  if (data.code !== undefined) payload.code = data.code;
  if (data.skills !== undefined) payload.skills = data.skills.join(",");

  if (data.description !== undefined) {
    payload.description = data.description;
    // paraphrase dikosongkan agar teks yang tampil dan yang di-embed sama.
    payload.paraphrase = null;
    payload.embedding = await embedCloText(data.description);
  }

  const updated = await prisma.cLO.update({ where: { id: cloId }, data: payload });
  await syncSubjectSkills(clo.subjectId);
  resetCloCache();
  return updated;
};

export const deleteClo = async (cloId: string, force = false) => {
  const clo = await prisma.cLO.findUnique({ where: { id: cloId } });
  if (!clo) throw new HttpError(404, "CLO tidak ditemukan");

  const dipakai = await prisma.cLOGrade.count({ where: { cloId } });
  if (dipakai > 0 && !force) {
    throw new HttpError(
      400,
      `CLO ini memiliki ${dipakai} nilai mahasiswa. Konfirmasi penghapusan untuk melanjutkan.`,
    );
  }

  // Nilai per CLO ikut terhapus lewat cascade.
  await prisma.cLO.delete({ where: { id: cloId } });
  resetCloCache();
  return { deletedGrades: dipakai };
};