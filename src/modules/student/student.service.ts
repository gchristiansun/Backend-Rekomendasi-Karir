import prisma from "../../config/prisma";
import { UpdateStudentInput } from "./student.validation";
import { findOrCreateByNames } from "../skill/skill.service";
import { SKILL_SOURCE } from "../../constants";
import { USER_STATUS } from "../../constants";
import { HttpError } from "../../utils/httpError";
import { isPassedGrade } from "../../utils/semanticMatching";

// Profil lengkap mahasiswa (untuk GET /students/me dan lihat detail kandidat).
export const getStudentProfile = async (studentId: string) => {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      university: { select: { id: true, name: true } },
      skills: { include: { skill: { select: { id: true, name: true, category: true } } } },
      subjectsTaken: {
        include: { subject: { select: { id: true, code: true, name: true, sks: true } } },
        orderBy: { semester: "asc" },
      },
      certificates: {
        select: { id: true, title: true, issuer: true, status: true, fileUrl: true },
      },
    },
  });
};

// Profil kompetensi (untuk halaman Competency Profile).
// Mengelompokkan skill berdasarkan sumbernya: subject / certificate / manual.
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

  const bySource = { subject: 0, certificate: 0, manual: 0 } as Record<string, number>;
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
  
  // Akun yang sudah dinonaktifkan (soft-delete) tidak ikut ditampilkan.
  where.user = { ...(where.user ?? {}), status: { not: USER_STATUS.DELETED } };

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

// ============================================================
// Transkrip akademik mahasiswa, dikelompokkan per mata kuliah.
// Dipakai halaman "Profile Mahasiswa": tiap matkul berisi daftar CLO
// beserta nilai dan keahlian yang divalidasi CLO tersebut.
// ============================================================
const splitCsv = (value?: string | null): string[] =>
  String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const getMyAcademicTranscript = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      university: { select: { id: true, name: true } },
      subjectsTaken: {
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              sks: true,
              clos: {
                select: { id: true, code: true, text: true, paraphrase: true, skills: true },
                orderBy: { code: "asc" },
              },
              // cadangan bila CLO belum punya daftar keahliannya sendiri
              skills: { include: { skill: { select: { id: true, name: true } } } },
            },
          },
        },
      },
    },
  });
  if (!student) return null;

  // Nilai CLO mahasiswa -> peta cloId agar mudah ditempel ke tiap CLO matkul.
  const cloGrades = await prisma.cLOGrade.findMany({
    where: { studentId },
    select: { cloId: true, score: true },
  });
  const scoreByCloId = new Map(cloGrades.map((g: any) => [g.cloId, g.score]));

  const courses = student.subjectsTaken.map((taken: any) => {
    const subjectSkills = (taken.subject?.skills ?? []).map((ss: any) => ss.skill.name);

    const clos = (taken.subject?.clos ?? []).map((clo: any, i: number) => {
      const cloSkills = splitCsv(clo.skills);
      return {
        id: clo.id,
        code: clo.code ?? `CLO ${i + 1}`,
        description: clo.paraphrase ?? clo.text ?? "-",
        skills: cloSkills.length > 0 ? cloSkills : subjectSkills,
        score: scoreByCloId.get(clo.id) ?? null,
      };
    });

    // Nilai matkul: pakai nilai transkrip bila ada, jika tidak
    // rata-rata nilai CLO yang sudah terisi.
    const scoredClos = clos.filter((c: any) => c.score != null);
    const avgClo = scoredClos.length
      ? Math.round(scoredClos.reduce((a: number, c: any) => a + Number(c.score), 0) / scoredClos.length)
      : null;

    return {
      id: taken.subjectId,
      code: taken.subject?.code ?? null,
      name: taken.subject?.name ?? "-",
      sks: taken.subject?.sks ?? null,
      semester: taken.semester ?? null,
      grade: taken.grade ?? null,
      score: taken.score ?? avgClo,
      clos,
    };
  });

  // Semester terbaru lebih dulu, sesuai urutan default di halaman.
  courses.sort((a: any, b: any) => (b.semester ?? 0) - (a.semester ?? 0));

  const passed = student.subjectsTaken.filter((st: any) => isPassedGrade(st.score, st.grade));
  const totalSks = passed.reduce((a: number, st: any) => a + (st.subject?.sks ?? 0), 0);
  const totalClo = courses.reduce((a: number, c: any) => a + c.clos.length, 0);

  return {
    student: {
      id: student.id,
      nim: student.nim,
      major: student.major,
      faculty: (student as any).faculty ?? null,
      semester: student.semester,
      gpa: (student as any).gpa ?? null,
      entryYear: (student as any).entryYear ?? null,
      university: student.university,
      user: student.user,
    },
    stats: {
      gpa: (student as any).gpa ?? null,
      totalSks,
      totalClo,
      totalCourses: courses.length,
    },
    courses,
  };
};

// Detail akademik mahasiswa untuk halaman kampus:
// profil + ringkasan + nilai per CLO + sertifikat.
export const getStudentAcademicDetail = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, status: true } },
      university: { select: { id: true, name: true } },
      certificates: {
        select: { id: true, title: true, issuer: true, status: true, fileUrl: true, created_at: true },
        orderBy: { created_at: "desc" },
      },
      subjectsTaken: {
        include: { subject: { select: { id: true, code: true, name: true, sks: true } } },
      },
    },
  });
  if (!student) return null;

  const cloGrades = await prisma.cLOGrade.findMany({
    where: { studentId },
    include: { clo: true },
    orderBy: { created_at: "desc" },
  });

  // Mata kuliah diambil terpisah agar tidak bergantung pada nama relasi di model CLO.
  const subjectIds = Array.from(new Set(cloGrades.map((g: any) => g.clo.subjectId)));
  const subjects = subjectIds.length
    ? await prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
      })
    : [];
  const subjectById = new Map(subjects.map((s: any) => [s.id, s]));

  const cloDetails = cloGrades.map((g: any, i: number) => {
    const subject = subjectById.get(g.clo.subjectId);
    return {
      id: g.id,
      code: g.clo.code ?? g.clo.kode ?? `CLO${i + 1}`,
      course: subject?.name ?? "-",
      description:
        g.clo.paraphrase ?? g.clo.parafrase ?? g.clo.description ?? g.clo.deskripsi ?? g.clo.text ?? "-",
      // Keahlian melekat pada mata kuliah, bukan pada tiap CLO.
      skills: (subject?.skills ?? []).map((ss: any) => ss.skill.name),
      score: g.score,
    };
  });

  const passed = student.subjectsTaken.filter((st: any) => isPassedGrade(st.score, st.grade));
  const totalSks = passed.reduce((a: number, st: any) => a + (st.subject?.sks ?? 0), 0);

  const verifiedCerts = student.certificates.filter((c: any) =>
    ["approved", "verified"].includes(String(c.status).toLowerCase()),
  );

  return {
    student: {
      id: student.id,
      nim: student.nim,
      major: student.major,
      semester: student.semester,
      gpa: (student as any).gpa ?? null,
      faculty: (student as any).faculty ?? null,
      entryYear: (student as any).entryYear ?? null,
      graduatedAt: (student as any).graduatedAt ?? null,
      university: student.university,
      user: student.user,
    },
    stats: {
      totalSks,
      totalClo: cloGrades.length,
      certificationsCount: verifiedCerts.length,
    },
    cloDetails,
    certificates: student.certificates,
  };
};

// Perbarui data mahasiswa oleh Admin Kampus (menyentuh tabel Student & User).
export const updateStudentByAdmin = async (
  studentId: string,
  data: any,
) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, userId: true, graduatedAt: true } as any,
  });
  if (!student) throw new HttpError(404, "Mahasiswa tidak ditemukan");

  if (data.email) {
    const taken = await prisma.user.findFirst({
      where: { email: data.email, id: { not: (student as any).userId } },
    });
    if (taken) throw new HttpError(409, "Email sudah digunakan akun lain");
  }
  if (data.nim) {
    const taken = await prisma.student.findFirst({
      where: { nim: data.nim, id: { not: studentId } },
    });
    if (taken) throw new HttpError(409, "NIM sudah digunakan mahasiswa lain");
  }

  const studentData: any = {};
  if (data.nim !== undefined) studentData.nim = data.nim;
  if (data.major !== undefined) studentData.major = data.major;
  if (data.faculty !== undefined) studentData.faculty = data.faculty;
  if (data.entryYear !== undefined) studentData.entryYear = data.entryYear;
  if (data.gpa !== undefined) studentData.gpa = data.gpa;

  const userData: any = {};
  if (data.name !== undefined) userData.name = data.name;
  if (data.email !== undefined) userData.email = data.email;

  if (data.status !== undefined) {
    // Kelulusan dicatat lewat graduatedAt; akun alumni TETAP dapat masuk,
    // sesuai alur pemulihan akun saat email kampus sudah dinonaktifkan.
    if (data.status === "Graduated") {
      if (!(student as any).graduatedAt) studentData.graduatedAt = new Date();
    } else {
      studentData.graduatedAt = null;
    }
    userData.status = data.status === "Inactive" ? USER_STATUS.SUSPENDED : USER_STATUS.ACTIVE;
  }

  await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: studentData }),
    ...(Object.keys(userData).length
      ? [prisma.user.update({ where: { id: (student as any).userId }, data: userData })]
      : []),
  ]);

  return getStudentProfile(studentId);
};

// Pilihan Fakultas -> Program Studi, diturunkan dari data mahasiswa yang ada.
export const getFacultyMajorMap = async (universityId?: string) => {
  const rows = await prisma.student.findMany({
    where: universityId ? { universityId } : {},
    select: { faculty: true, major: true } as any,
  });
  const map: Record<string, string[]> = {};
  for (const r of rows as any[]) {
    if (!r.faculty) continue;
    const list = map[r.faculty] ?? [];
    if (r.major && !list.includes(r.major)) list.push(r.major);
    map[r.faculty] = list.sort();
  }
  return map;
};