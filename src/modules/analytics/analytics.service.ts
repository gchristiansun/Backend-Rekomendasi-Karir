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