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
  issuedAt?: string;
  credentialId?: string;
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
      issuedAt: input.issuedAt ? new Date(input.issuedAt) : null,
      credentialId: input.credentialId,
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

// Daftar sertifikat untuk halaman verifikasi kampus.
// Tanpa filter status = seluruh status, agar tab dan hitungannya bisa dihitung sekali muat.
export const listCertificates = async (opts: { status?: string; universityId?: string }) => {
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.universityId) where.student = { universityId: opts.universityId };

  return prisma.certificate.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          nim: true,
          major: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getCertificateById = (id: string) =>
  prisma.certificate.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true, nim: true, major: true, universityId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      skills: { include: { skill: { select: { id: true, name: true } } } },
    },
  });

// Ganti seluruh keahlian sertifikat. Berlaku untuk pemberian skill saat disetujui.
export const updateCertificateSkills = async (id: string, skillNames: string[]) => {
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) throw new HttpError(404, "Sertifikat tidak ditemukan");

  const skills = await findOrCreateByNames(skillNames);
  await prisma.certificate.update({
    where: { id },
    data: { skills: { deleteMany: {}, create: skills.map((s) => ({ skillId: s.id })) } },
  });
  return getCertificateById(id);
};

// Cabut keahlian yang tadinya diberikan sertifikat ini, kecuali masih
// dijustifikasi sertifikat lain yang sudah disetujui.
const revokeCertificateSkills = async (
  tx: any,
  studentId: string,
  skillIds: string[],
  exceptCertId: string,
) => {
  if (skillIds.length === 0) return;

  const lain = await tx.certificate.findMany({
    where: { studentId, status: CERTIFICATE_STATUS.APPROVED, id: { not: exceptCertId } },
    include: { skills: { select: { skillId: true } } },
  });
  const masihDijustifikasi = new Set<string>();
  for (const c of lain as any[]) for (const s of c.skills) masihDijustifikasi.add(s.skillId);

  const dicabut = skillIds.filter((id) => !masihDijustifikasi.has(id));
  if (dicabut.length === 0) return;

  // Hanya yang bersumber sertifikat; keahlian dari mata kuliah tidak tersentuh.
  await tx.studentSkill.deleteMany({
    where: { studentId, skillId: { in: dicabut }, source: SKILL_SOURCE.CERTIFICATE },
  });
};

// Kembalikan ke status menunggu, sekaligus mencabut keahlian bila sebelumnya disetujui.
export const setCertificatePending = async (id: string) => {
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { skills: { select: { skillId: true } } },
  });
  if (!cert) throw new HttpError(404, "Sertifikat tidak ditemukan");

  const sebelumnyaDisetujui =
    String(cert.status).toLowerCase() === String(CERTIFICATE_STATUS.APPROVED).toLowerCase();

  await prisma.$transaction(async (tx: any) => {
    await tx.certificate.update({ where: { id }, data: { status: CERTIFICATE_STATUS.PENDING } });
    if (sebelumnyaDisetujui) {
      await revokeCertificateSkills(
        tx,
        cert.studentId,
        (cert as any).skills.map((s: any) => s.skillId),
        id,
      );
    }
  });

  return getCertificateById(id);
};