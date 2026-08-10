import prisma from "../../config/prisma";
import { aggregateSkillFrequency } from "../../utils/matching";
import { JOB_STATUS } from "../../constants";

// ============================================================
// Tren skill: frekuensi skill dari SEMUA lowongan aktif.
// Untuk dashboard Kaprodi (bahan evaluasi kurikulum).
// ============================================================
export const getSkillTrends = async (limit?: number) => {
  // ambil semua lowongan aktif + skill-nya
  const jobs = await prisma.job.findMany({
    where: { status: JOB_STATUS.ACTIVE },
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
  });

  // ubah ke format yang dimengerti aggregateSkillFrequency:
  // array of [ {skillId, name}, ... ] per lowongan
  const skillLists = jobs.map((job: any) =>
    job.skills.map((js: any) => ({ skillId: js.skillId, name: js.skill.name })),
  );

  // hitung frekuensi (sudah terurut desc dari fungsinya)
  let trends = aggregateSkillFrequency(skillLists);
  if (limit && limit > 0) trends = trends.slice(0, limit);

  return {
    totalActiveJobs: jobs.length,
    totalUniqueSkills: trends.length,
    trends, // [{ skillId, name, count }] siap dibuat grafik
  };
};

// ============================================================
// Overview sistem (untuk Admin Utama). Angka ringkas.
// ============================================================
export const getSystemOverview = async () => {
  const [
    totalStudents,
    totalCompanies,
    verifiedCompanies,
    pendingCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    totalSubjects,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
    prisma.company.count({ where: { status: "verified" } }),
    prisma.company.count({ where: { status: "pending" } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: JOB_STATUS.ACTIVE } }),
    prisma.application.count(),
    prisma.subject.count(),
  ]);

  return {
    students: totalStudents,
    companies: { total: totalCompanies, verified: verifiedCompanies, pending: pendingCompanies },
    jobs: { total: totalJobs, active: activeJobs },
    applications: totalApplications,
    subjects: totalSubjects,
  };
};

// ============================================================
// Distribusi status lamaran (untuk dashboard, opsional).
// ============================================================
export const getApplicationStats = async () => {
  const grouped = await prisma.application.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  return grouped.map((g: any) => ({ status: g.status, count: g._count.status }));
};

// ============================================================
// Ringkasan dashboard Admin Kampus / Kaprodi.
// Dihitung di database supaya frontend cukup satu permintaan.
// ============================================================
export const getUniversityDashboard = async (universityId: string) => {
  const [totalStudents, subjects, clos, takenGroups, totalTaken] = await Promise.all([
    prisma.student.count({ where: { universityId } }),
    prisma.subject.findMany({
      where: { universityId },
      select: { id: true, code: true, name: true, sks: true, semester: true },
      orderBy: { code: "asc" },
    }),
    prisma.cLO.findMany({
      where: { subject: { universityId } },
      select: { id: true, subjectId: true, code: true },
    }),
    // berapa mahasiswa yang sudah punya nilai per mata kuliah
    prisma.subjectTaken.groupBy({
      by: ["subjectId"],
      where: { student: { universityId } },
      _count: true,
    }),
    prisma.subjectTaken.count({ where: { student: { universityId } } }),
  ]);

  const closBySubject = new Map<string, any[]>();
  for (const c of clos as any[]) {
    const list = closBySubject.get(c.subjectId) ?? [];
    list.push(c);
    closBySubject.set(c.subjectId, list);
  }

  const gradedBySubject = new Map<string, number>();
  for (const g of takenGroups as any[]) gradedBySubject.set(g.subjectId, g._count);

  const statusOf = (graded: number, total: number): "Selesai" | "Sebagian" | "Belum" => {
    if (total === 0 || graded === 0) return "Belum";
    return graded >= total ? "Selesai" : "Sebagian";
  };

  const courses = subjects.map((s: any) => {
    const subjectClos = closBySubject.get(s.id) ?? [];
    const graded = gradedBySubject.get(s.id) ?? 0;
    const status = statusOf(graded, totalStudents);

    return {
      id: s.id,
      code: s.code,
      name: s.name,
      sks: s.sks,
      semester: s.semester ?? null,
      cloCount: subjectClos.length,
      gradedStudents: graded,
      totalStudents,
      status,
      // Nilai dicatat per mata kuliah, bukan per CLO, sehingga seluruh CLO
      // dalam satu matkul memiliki progres yang sama.
      clos: subjectClos.map((c: any, i: number) => ({
        id: c.id,
        name: c.code ?? c.kode ?? `CLO${i + 1}`,
        graded,
        total: totalStudents,
        status,
      })),
    };
  });

  return {
    stats: {
      students: totalStudents,
      courses: subjects.length,
      totalCLO: clos.length,
      gradesInputted: totalTaken,
    },
    courses,
  };
};