import prisma from "../../config/prisma";
import { findOrCreateByNames } from "../skill/skill.service";
import {
  CERTIFICATE_STATUS,
  SKILL_SOURCE,
  NOTIFICATION_TYPE,
} from "../../constants";
import { HttpError } from "../../utils/httpError";

export const createCertificate = async (input: {
  studentId: string;
  title: string;
  issuer?: string;
  fileUrl?: string;
  fileType?: string;
  skillNames: string[];
}) => {
  const skills = await findOrCreateByNames(input.skillNames);
  return prisma.certificate.create({
    data: {
      studentId: input.studentId,
      title: input.title,
      issuer: input.issuer,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      status: CERTIFICATE_STATUS.PENDING,
      skills: { create: skills.map((s) => ({ skillId: s.id })) },
    },
    include: { skills: { include: { skill: true } } },
  });
};

export const listMyCertificates = (studentId: string) =>
  prisma.certificate.findMany({
    where: { studentId },
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
    orderBy: { created_at: "desc" },
  });

// Daftar ajuan pending. Jika universityId diberikan -> hanya mahasiswa kampus itu.
export const listPending = (universityId?: string) =>
  prisma.certificate.findMany({
    where: {
      status: CERTIFICATE_STATUS.PENDING,
      ...(universityId ? { student: { universityId } } : {}),
    },
    include: {
      student: { include: { user: { select: { id: true, name: true, email: true } } } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
    },
    orderBy: { created_at: "asc" },
  });

export const getCertById = (id: string) =>
  prisma.certificate.findUnique({
    where: { id },
    include: { student: true, skills: { include: { skill: true } } },
  });

// Approve: ubah status + tambahkan skill sertifikat ke kompetensi mahasiswa.
// Pakai TRANSAKSI: dua aksi harus berhasil bersama atau batal bersama.
export const approveCertificate = async (id: string, reviewerId: string) => {
  const cert = await getCertById(id);
  if (!cert) throw new HttpError(404, "Sertifikat tidak ditemukan");
  if (cert.status !== CERTIFICATE_STATUS.PENDING) {
    throw new HttpError(400, "Sertifikat sudah diproses sebelumnya");
  }

  await prisma.$transaction(async (tx: any) => {
    // (a) ubah status sertifikat
    await tx.certificate.update({
      where: { id },
      data: {
        status: CERTIFICATE_STATUS.APPROVED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });
    // (b) skill sertifikat -> StudentSkill (source: certificate)
    for (const cs of cert.skills) {
      await tx.studentSkill.upsert({
        where: { studentId_skillId: { studentId: cert.studentId, skillId: cs.skillId } },
        update: {},
        create: {
          studentId: cert.studentId,
          skillId: cs.skillId,
          source: SKILL_SOURCE.CERTIFICATE,
        },
      });
    }
    // (c) notifikasi ke mahasiswa
    await tx.notification.create({
      data: {
        userId: cert.student.userId,
        title: "Sertifikat disetujui",
        message: `Sertifikat "${cert.title}" Anda disetujui. Skill terkait ditambahkan ke profil kompetensi.`,
        type: NOTIFICATION_TYPE.CERTIFICATE,
      },
    });
  });

  return getCertById(id);
};

export const rejectCertificate = async (id: string, reviewerId: string, note?: string) => {
  const cert = await getCertById(id);
  if (!cert) throw new HttpError(404, "Sertifikat tidak ditemukan");
  if (cert.status !== CERTIFICATE_STATUS.PENDING) {
    throw new HttpError(400, "Sertifikat sudah diproses sebelumnya");
  }
  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      status: CERTIFICATE_STATUS.REJECTED,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      note,
    },
  });
  await prisma.notification.create({
    data: {
      userId: cert.student.userId,
      title: "Sertifikat ditolak",
      message: `Sertifikat "${cert.title}" ditolak.${note ? " Alasan: " + note : ""}`,
      type: NOTIFICATION_TYPE.CERTIFICATE,
    },
  });
  return updated;
};