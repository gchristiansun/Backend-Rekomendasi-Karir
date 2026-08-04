import prisma from "../../config/prisma";
import { computeMatch } from "../../utils/matching";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABEL,
  JOB_STATUS,
  NOTIFICATION_TYPE,
  ApplicationStatus,
} from "../../constants";
import { HttpError } from "../../utils/httpError";

// Mahasiswa melamar
export const apply = async (studentId: string, jobId: string, coverLetter?: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { skills: { include: { skill: true } } },
  });
  if (!job) throw new HttpError(404, "Lowongan tidak ditemukan");
  if (job.status !== JOB_STATUS.ACTIVE) {
    throw new HttpError(400, "Lowongan ini sudah tidak aktif");
  }

  // cegah lamaran ganda
  const existing = await prisma.application.findUnique({
    where: { jobId_studentId: { jobId, studentId } },
  });
  if (existing) throw new HttpError(409, "Anda sudah melamar lowongan ini");

  // hitung & simpan snapshot match score saat melamar
  const owned = (
    await prisma.studentSkill.findMany({ where: { studentId }, select: { skillId: true } })
  ).map((r) => r.skillId);
  const match = computeMatch(
    owned,
    job.skills.map((s) => ({ skillId: s.skillId, name: s.skill.name, weight: s.weight })),
  );

  const application = await prisma.application.create({
    data: {
      jobId,
      studentId,
      coverLetter,
      matchSnapshot: match.score,
      status: APPLICATION_STATUS.SUBMITTED,
    },
  });

  // notifikasi ke mahasiswa
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (student) {
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: "Lamaran terkirim",
        message: `Lamaran Anda untuk "${job.title}" berhasil dikirim.`,
        type: NOTIFICATION_TYPE.APPLICATION,
      },
    });
  }

  return application;
};

// Lamaran milik mahasiswa
export const listMyApplications = async (studentId: string) => {
  const apps = await prisma.application.findMany({
    where: { studentId },
    include: {
      job: {
        select: {
          id: true, title: true, location: true, type: true,
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
  return apps.map((a) => ({
    id: a.id,
    status: a.status,
    statusLabel: APPLICATION_STATUS_LABEL[a.status as ApplicationStatus] ?? a.status,
    matchScore: a.matchSnapshot,
    appliedAt: a.created_at,
    job: a.job,
  }));
};

// Pelamar sebuah lowongan (untuk HRD), urut match score
export const listApplicationsForJob = async (jobId: string) => {
  const apps = await prisma.application.findMany({
    where: { jobId },
    include: {
      student: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: [{ matchSnapshot: "desc" }, { created_at: "asc" }],
  });
  return apps.map((a) => ({
    id: a.id,
    status: a.status,
    statusLabel: APPLICATION_STATUS_LABEL[a.status as ApplicationStatus] ?? a.status,
    matchScore: a.matchSnapshot,
    coverLetter: a.coverLetter,
    appliedAt: a.created_at,
    student: {
      id: a.student.id,
      name: a.student.user.name,
      email: a.student.user.email,
      nim: a.student.nim,
      major: a.student.major,
      gpa: a.student.gpa,
    },
  }));
};

// Untuk ownership check
export const getApplicationWithJob = (id: string) =>
  prisma.application.findUnique({
    where: { id },
    include: { job: { select: { id: true, title: true, companyId: true } }, student: true },
  });

// HRD ubah status + notif ke mahasiswa
export const updateStatus = async (id: string, status: ApplicationStatus) => {
  // lamaran yang sudah diterima/ditolak -> disembunyikan dari rekomendasi
  const decided =
    status === APPLICATION_STATUS.ACCEPTED || status === APPLICATION_STATUS.REJECTED;

  const app = await prisma.application.update({
    where: { id },
    data: { status, hiddenFromRecommendation: decided },
    include: { job: { select: { title: true } }, student: true },
  });

  await prisma.notification.create({
    data: {
      userId: app.student.userId,
      title: "Status lamaran diperbarui",
      message: `Lamaran "${app.job.title}" kini berstatus: ${APPLICATION_STATUS_LABEL[status] ?? status}.`,
      type: NOTIFICATION_TYPE.APPLICATION,
    },
  });

  return app;
};

// Mahasiswa batalkan lamaran
export const withdraw = async (id: string) => {
  await prisma.application.delete({ where: { id } });
};

// Tambahkan di bagian import atas file:
// import { computeMatch } from "../../utils/matching";

export const listCompanyApplications = async (
  companyId: string,
  opts: {
    jobId?: string;
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
  },
) => {
  const where: any = { job: { companyId } };
  if (opts.jobId) where.jobId = opts.jobId;
  if (opts.status) where.status = opts.status;
  if (opts.search) {
    where.student = {
      OR: [
        { user: { name: { contains: opts.search, mode: "insensitive" } } },
        { nim: { contains: opts.search, mode: "insensitive" } },
        { major: { contains: opts.search, mode: "insensitive" } },
      ],
    };
  }

  const [total, rows, statusGroups] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      include: {
        // skill lowongan dibutuhkan untuk menghitung skor kecocokan
        job: {
          include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
        },
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            university: { select: { id: true, name: true } },
            skills: { select: { skillId: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
      ...(opts.skip !== undefined ? { skip: opts.skip } : {}),
      ...(opts.take !== undefined ? { take: opts.take } : {}),
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { job: { companyId } },
      _count: true,
    }),
  ]);

  // Skor kecocokan tidak disimpan sebagai kolom -> dihitung di sini,
  // pakai mesin yang sama dengan halaman rekomendasi kandidat.
  const applications = rows
    .map((app: any) => {
      const owned = (app.student?.skills ?? []).map((s: any) => s.skillId);
      const required = (app.job?.skills ?? []).map((js: any) => ({
        skillId: js.skillId,
        name: js.skill.name,
        weight: js.weight,
      }));
      const match = computeMatch(owned, required);

      return {
        id: app.id,
        status: app.status,
        coverLetter: app.coverLetter,
        created_at: app.created_at,
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        gapSkills: match.missingSkills,
        job: {
          id: app.job.id,
          title: app.job.title,
          department: app.job.department,
          type: app.job.type,
          status: app.job.status,
        },
        student: {
          id: app.student.id,
          nim: app.student.nim,
          major: app.student.major,
          semester: app.student.semester,
          user: app.student.user,
          university: app.student.university,
        },
      };
    })
    // urut skor tertinggi (tidak bisa lewat orderBy karena bukan kolom DB)
    .sort((a, b) => b.matchScore - a.matchScore);

  const byStatus: Record<string, number> = {};
  for (const g of statusGroups as any[]) byStatus[g.status] = g._count;

  return {
    total,
    applications,
    summary: {
      total: Object.values(byStatus).reduce((a, b) => a + b, 0),
      submitted: byStatus.submitted ?? 0,
      processing: byStatus.processing ?? 0,
      accepted: byStatus.accepted ?? 0,
      rejected: byStatus.rejected ?? 0,
    },
  };
};

