import prisma from "../../config/prisma";
import { HttpError } from "../../utils/httpError";
import { APPLICATION_STATUS } from "../../constants";
import { RecordViewInput } from "./interaction.validation";

const assertJobExists = async (jobId: string) => {
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!job) throw new HttpError(404, "Lowongan tidak ditemukan");
};

// ============================================================
// FAVORIT (basket)
// ============================================================
export const addFavorite = async (studentId: string, jobId: string) => {
  await assertJobExists(jobId);
  return prisma.jobFavorite.upsert({
    where: { studentId_jobId: { studentId, jobId } },
    update: {}, // sudah difavoritkan -> biarkan (idempoten)
    create: { studentId, jobId },
  });
};

export const removeFavorite = async (studentId: string, jobId: string) => {
  await prisma.jobFavorite.deleteMany({ where: { studentId, jobId } });
};

export const listFavorites = (studentId: string) =>
  prisma.jobFavorite.findMany({
    where: { studentId },
    include: {
      job: {
        select: {
          id: true, title: true, department: true, location: true, type: true, status: true,
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

// ============================================================
// VIEW & DURASI
// ============================================================
export const recordView = async (studentId: string, data: RecordViewInput) => {
  await assertJobExists(data.jobId);
  return prisma.jobView.create({
    data: {
      studentId,
      jobId: data.jobId,
      source: data.source,
      durationMs: data.durationMs ?? null,
    },
    select: { id: true, jobId: true, source: true, created_at: true },
  });
};

// Update durasi saat mahasiswa meninggalkan halaman.
// Ownership dicek: hanya pemilik log yang boleh mengubah.
export const updateViewDuration = async (
  studentId: string,
  viewId: string,
  durationMs: number,
) => {
  const view = await prisma.jobView.findFirst({ where: { id: viewId, studentId } });
  if (!view) return null;
  return prisma.jobView.update({
    where: { id: viewId },
    data: { durationMs },
    select: { id: true, jobId: true, durationMs: true },
  });
};

// ============================================================
// SINYAL AGREGAT (bahan fitur untuk model pemeringkatan)
// ============================================================
export const getStudentSignals = async (studentId: string) => {
  const [favorites, viewAgg, applications, applicantAgg] = await Promise.all([
    prisma.jobFavorite.findMany({ where: { studentId }, select: { jobId: true } }),
    prisma.jobView.groupBy({
      by: ["jobId"],
      where: { studentId },
      _count: true,
      _sum: { durationMs: true },
    }),
    prisma.application.findMany({
      where: { studentId },
      select: { jobId: true, status: true, hiddenFromRecommendation: true, created_at: true },
    }),
    // jumlah pelamar per lowongan (global, bukan per mahasiswa)
    prisma.application.groupBy({ by: ["jobId"], _count: true }),
  ]);

  const favSet = new Set(favorites.map((f: any) => f.jobId));
  const viewMap = new Map(
    viewAgg.map((v: any) => [v.jobId, { count: v._count, durationMs: v._sum.durationMs ?? 0 }]),
  );
  const appMap = new Map(applications.map((a: any) => [a.jobId, a]));
  const applicantMap = new Map(applicantAgg.map((a: any) => [a.jobId, a._count]));

  // gabungkan semua jobId yang punya sinyal apa pun
  const jobIds = new Set<string>([
    ...favSet,
    ...viewMap.keys(),
    ...appMap.keys(),
  ]);

  const perJob = Array.from(jobIds).map((jobId) => {
    const view = viewMap.get(jobId);
    const app = appMap.get(jobId);
    const decided =
      !!app &&
      (app.status === APPLICATION_STATUS.ACCEPTED || app.status === APPLICATION_STATUS.REJECTED);
    return {
      jobId,
      favorited: favSet.has(jobId),
      viewCount: view?.count ?? 0,
      totalDurationMs: view?.durationMs ?? 0,
      applied: !!app,
      applicationStatus: app?.status ?? null,
      appliedAt: app?.created_at ?? null,
      deprioritized: !!(app?.hiddenFromRecommendation || decided),
      applicantCount: applicantMap.get(jobId) ?? 0, // jumlah apply per job
    };
  });

  const totalViews = viewAgg.reduce((acc: number, v: any) => acc + v._count, 0);

  return {
    totalFavorites: favorites.length,
    totalViews,
    totalApplications: applications.length, // jumlah apply per mahasiswa
    perJob,
  };
};

// Statistik satu lowongan (untuk HRD / bahan fitur job-level).
export const getJobSignals = async (jobId: string) => {
  const [applicantCount, favoriteCount, viewAgg] = await Promise.all([
    prisma.application.count({ where: { jobId } }),
    prisma.jobFavorite.count({ where: { jobId } }),
    prisma.jobView.aggregate({
      where: { jobId },
      _count: true,
      _sum: { durationMs: true },
      _avg: { durationMs: true },
    }),
  ]);
  return {
    jobId,
    applicantCount,
    favoriteCount,
    viewCount: viewAgg._count,
    totalDurationMs: viewAgg._sum.durationMs ?? 0,
    avgDurationMs: Math.round(viewAgg._avg.durationMs ?? 0),
  };
};