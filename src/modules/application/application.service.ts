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
  const app = await prisma.application.update({
    where: { id },
    data: { status },
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