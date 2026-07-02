import prisma from "../../config/prisma";
import { InputGradeInput } from "./grade.validation";
import { SKILL_SOURCE, PASSING_SCORE } from "../../constants";
import { HttpError } from "../../utils/httpError";

// Cek lulus: berdasarkan score >= PASSING_SCORE, atau grade bukan E/F.
const isPassing = (score?: number, grade?: string): boolean => {
  if (typeof score === "number") return score >= PASSING_SCORE;
  if (grade) {
    const g = grade.trim().toUpperCase();
    return g !== "E" && g !== "F";
  }
  return false; // tidak ada nilai -> anggap belum lulus
};

// ============================================================
// Input/update nilai mahasiswa untuk sebuah matkul.
// Jika LULUS -> skill matkul otomatis masuk ke kompetensi mahasiswa (source: course).
// Pakai transaksi: catat nilai + tambah skill harus atomik.
// ============================================================
export const inputGrade = async (data: InputGradeInput) => {
  // pastikan mahasiswa & matkul ada
  const student = await prisma.student.findUnique({ where: { id: data.studentId } });
  if (!student) throw new HttpError(404, "Mahasiswa tidak ditemukan");

  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId },
    include: { skills: { select: { skillId: true } } },
  });
  if (!subject) throw new HttpError(404, "Mata kuliah tidak ditemukan");

  const passing = isPassing(data.score, data.grade);

  await prisma.$transaction(async (tx: any) => {
    // (a) catat/update nilai (upsert: kalau sudah ada, update)
    await tx.subjectTaken.upsert({
      where: {
        studentId_subjectId: { studentId: data.studentId, subjectId: data.subjectId },
      },
      update: { score: data.score, grade: data.grade, semester: data.semester },
      create: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        score: data.score,
        grade: data.grade,
        semester: data.semester,
      },
    });

    // (b) jika lulus -> berikan skill matkul ke mahasiswa (source: course)
    if (passing) {
      for (const s of subject.skills) {
        await tx.studentSkill.upsert({
          where: {
            studentId_skillId: { studentId: data.studentId, skillId: s.skillId },
          },
          update: {}, // kalau sudah punya (mis. dari manual), biarkan
          create: {
            studentId: data.studentId,
            skillId: s.skillId,
            source: SKILL_SOURCE.COURSE,
          },
        });
      }
    }
  });

  return {
    studentId: data.studentId,
    subjectId: data.subjectId,
    score: data.score,
    grade: data.grade,
    passing,
    skillsGranted: passing ? subject.skills.length : 0,
    message: passing
      ? `Lulus. ${subject.skills.length} skill dari matkul ditambahkan ke kompetensi mahasiswa.`
      : "Nilai dicatat. Belum lulus, skill matkul belum diberikan.",
  };
};

// Daftar nilai seorang mahasiswa.
export const listStudentGrades = (studentId: string) =>
  prisma.subjectTaken.findMany({
    where: { studentId },
    include: {
      subject: { select: { id: true, code: true, name: true, sks: true } },
    },
    orderBy: { semester: "asc" },
  });

// Hapus nilai (opsional).
export const deleteGrade = async (studentId: string, subjectId: string) => {
  await prisma.subjectTaken.deleteMany({ where: { studentId, subjectId } });
};