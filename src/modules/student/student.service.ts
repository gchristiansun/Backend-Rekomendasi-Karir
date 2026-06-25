import prisma from "../../config/prisma";
import { UpdateStudentInput } from "./student.validation";
import { findOrCreateByNames } from "../skill/skill.service";
import { SKILL_SOURCE } from "../../constants";

// Profil lengkap mahasiswa (untuk GET /students/me dan lihat detail kandidat).
export const getStudentProfile = async (studentId: string) => {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      university: { select: { id: true, name: true } },
      skills: { include: { skill: { select: { id: true, name: true, category: true } } } },
      coursesTaken: {
        include: { course: { select: { id: true, code: true, name: true, sks: true } } },
        orderBy: { semester: "asc" },
      },
      certificates: {
        select: { id: true, title: true, issuer: true, status: true, fileUrl: true },
      },
    },
  });
};

// Profil kompetensi (untuk halaman Competency Profile).
// Mengelompokkan skill berdasarkan sumbernya: course / certificate / manual.
export const getCompetency = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { gpa: true, semester: true, major: true },
  });
  const skills = await prisma.studentSkill.findMany({
    where: { studentId },
    include: { skill: { select: { id: true, name: true, category: true } } },
    orderBy: { skill: { name: "asc" } },
  });

  const bySource = { course: 0, certificate: 0, manual: 0 } as Record<string, number>;
  for (const s of skills) bySource[s.source] = (bySource[s.source] ?? 0) + 1;

  return {
    gpa: student?.gpa ?? null,
    semester: student?.semester ?? null,
    major: student?.major ?? null,
    totalSkills: skills.length,
    bySource,
    skills: skills.map((s: any) => ({
      id: s.skill.id,
      name: s.skill.name,
      category: s.skill.category,
      source: s.source,
    })),
  };
};

export const updateStudent = (studentId: string, data: UpdateStudentInput) =>
  prisma.student.update({ where: { id: studentId }, data });

export const listSkills = (studentId: string) =>
  prisma.studentSkill.findMany({
    where: { studentId },
    include: { skill: { select: { id: true, name: true, category: true } } },
    orderBy: { created_at: "desc" },
  });

// Tambah skill manual. Pakai upsert per skill supaya tidak dobel
// (unique gabungan [studentId, skillId] di schema -> namanya studentId_skillId).
export const addManualSkills = async (studentId: string, names: string[]) => {
  const skills = await findOrCreateByNames(names);
  for (const s of skills) {
    await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId, skillId: s.id } },
      update: {},
      create: { studentId, skillId: s.id, source: SKILL_SOURCE.MANUAL },
    });
  }
  return listSkills(studentId);
};

export const removeSkill = async (studentId: string, skillId: string) => {
  await prisma.studentSkill.deleteMany({ where: { studentId, skillId } });
};

// Ambil daftar skillId yang dimiliki mahasiswa -> dipakai modul matching nanti.
export const getOwnedSkillIds = async (studentId: string): Promise<string[]> => {
  const rows = await prisma.studentSkill.findMany({
    where: { studentId },
    select: { skillId: true },
  });
  return rows.map((r: any) => r.skillId);
};

// Daftar mahasiswa (untuk admin/kampus). Pakai pagination.
export const listStudents = async (opts: {
  search?: string;
  universityId?: string;
  skip: number;
  take: number;
}) => {
  const where: any = {};
  if (opts.universityId) where.universityId = opts.universityId;
  if (opts.search) {
    where.OR = [
      { nim: { contains: opts.search, mode: "insensitive" } },
      { major: { contains: opts.search, mode: "insensitive" } },
      { user: { name: { contains: opts.search, mode: "insensitive" } } },
    ];
  }
  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { skills: true } },
      },
      orderBy: { created_at: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
  ]);
  return { total, students };
};