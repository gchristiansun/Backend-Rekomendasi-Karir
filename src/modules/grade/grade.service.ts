import prisma from "../../config/prisma";
import { InputGradeInput } from "./grade.validation";
import { SKILL_SOURCE, PASSING_SCORE, USER_STATUS } from "../../constants";
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

// Data lengkap untuk halaman kelola nilai satu mata kuliah.
export const listSubjectGrades = async (subjectId: string, universityId?: string) => {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) return null;

  const clos = await prisma.cLO.findMany({
    where: { subjectId },
    orderBy: { created_at: "asc" },
  });

  const students = await prisma.student.findMany({
    where: {
      ...(universityId ? { universityId } : {}),
      user: { status: { not: USER_STATUS.DELETED } },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { nim: "asc" },
  });

  const cloIds = clos.map((c: any) => c.id);
  const grades = cloIds.length
    ? await prisma.cLOGrade.findMany({ where: { cloId: { in: cloIds } } })
    : [];

  const byStudent = new Map<string, Record<string, number>>();
  for (const g of grades as any[]) {
    const rec = byStudent.get(g.studentId) ?? {};
    rec[g.cloId] = g.score;
    byStudent.set(g.studentId, rec);
  }

  return {
    subject: {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      sks: subject.sks,
      semester: (subject as any).semester ?? null,
    },
    clos: clos.map((c: any, i: number) => ({
      id: c.id,
      code: c.code ?? c.kode ?? `CLO${i + 1}`,
      description:
        c.paraphrase ?? c.parafrase ?? c.description ?? c.deskripsi ?? c.text ?? "",
      weight: c.weight ?? 0,
    })),
    students: students.map((s: any) => ({
      id: s.id,
      nim: s.nim,
      name: s.user?.name ?? "Tanpa Nama",
      email: s.user?.email ?? null,
      grades: byStudent.get(s.id) ?? {},
    })),
  };
};

// Atur bobot penilaian tiap CLO dalam satu mata kuliah.
export const setCloWeights = async (
  subjectId: string,
  weights: { cloId: string; weight: number }[],
) => {
  const total = weights.reduce((a, w) => a + (Number(w.weight) || 0), 0);
  if (total !== 100) {
    throw new HttpError(400, `Total bobot CLO harus tepat 100%, saat ini ${total}%`);
  }

  const clos = await prisma.cLO.findMany({ where: { subjectId }, select: { id: true } });
  const milikMatkul = new Set(clos.map((c: any) => c.id));
  for (const w of weights) {
    if (!milikMatkul.has(w.cloId)) {
      throw new HttpError(400, "Ada CLO yang bukan milik mata kuliah ini");
    }
  }

  await prisma.$transaction(
    weights.map((w) =>
      prisma.cLO.update({ where: { id: w.cloId }, data: { weight: Number(w.weight) } }),
    ),
  );
  return { subjectId, weights };
};

// Simpan nilai per CLO seorang mahasiswa, lalu hitung nilai akhir mata kuliah.
export const saveCloGrades = async (
  studentId: string,
  subjectId: string,
  scores: { cloId: string; score: number }[],
) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new HttpError(404, "Mahasiswa tidak ditemukan");

  const clos = await prisma.cLO.findMany({ where: { subjectId } });
  if (clos.length === 0) throw new HttpError(400, "Mata kuliah ini belum memiliki CLO");

  const milikMatkul = new Set(clos.map((c: any) => c.id));
  for (const s of scores) {
    if (!milikMatkul.has(s.cloId)) {
      throw new HttpError(400, "Ada CLO yang bukan milik mata kuliah ini");
    }
  }

  await prisma.$transaction(
    scores.map((s) =>
      prisma.cLOGrade.upsert({
        where: { studentId_cloId: { studentId, cloId: s.cloId } },
        update: { score: s.score },
        create: { studentId, cloId: s.cloId, score: s.score },
      }),
    ),
  );

  // Nilai akhir = jumlah (nilai CLO x bobotnya). Bila bobot belum diatur,
  // dipakai rata-rata sederhana agar nilai tetap terhitung.
  const semua = await prisma.cLOGrade.findMany({
    where: { studentId, cloId: { in: clos.map((c: any) => c.id) } },
  });
  const nilaiPerClo = new Map(semua.map((g: any) => [g.cloId, g.score]));

  let akhir = 0;
  let totalBobot = 0;
  for (const c of clos as any[]) {
    const w = c.weight ?? 0;
    if (w <= 0) continue;
    totalBobot += w;
    akhir += ((nilaiPerClo.get(c.id) ?? 0) * w) / 100;
  }
  if (totalBobot === 0) {
    akhir =
      clos.reduce((acc: number, c: any) => acc + (nilaiPerClo.get(c.id) ?? 0), 0) / clos.length;
  }

  const finalScore = Math.round(akhir * 10) / 10;

  // Diteruskan ke jalur nilai matkul yang lama, sehingga skill matkul tetap
  // mengalir ke kompetensi mahasiswa saat dinyatakan lulus.
  const hasil = await inputGrade({ studentId, subjectId, score: finalScore } as any);
  return { ...hasil, finalScore };
};