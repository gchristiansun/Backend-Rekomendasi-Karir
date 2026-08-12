import prisma from "../../config/prisma";
import { computeMatch } from "../../utils/matching";
import { getSemanticScores, pairKey } from "../../utils/semanticMatching";
import { HttpError } from "../../utils/httpError";
import {
  INVITATION_STATUS,
  APPLICATION_STATUS,
  JOB_STATUS,
  USER_STATUS,
} from "../../constants";

const invitationInclude = {
  job: {
    select: {
      id: true,
      title: true,
      department: true,
      type: true,
      status: true,
      companyId: true,
      company: { select: { id: true, name: true, logoUrl: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
    },
  },
  student: {
    select: {
      id: true,
      nim: true,
      major: true,
      semester: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      university: { select: { id: true, name: true } },
      skills: { select: { skillId: true } },
    },
  },
};

// Bentuk keluaran disamakan dengan daftar pelamar supaya mudah ditampilkan.
// semanticScore diisi pemanggil dari getSemanticScores; bila kosong (embedding
// persyaratan belum ada / mahasiswa belum punya nilai) dipakai skor keahlian.
const shapeInvitation = (inv: any, semanticScore?: number) => {
  const owned = (inv.student?.skills ?? []).map((s: any) => s.skillId);
  const required = (inv.job?.skills ?? []).map((js: any) => ({
    skillId: js.skillId,
    name: js.skill.name,
    weight: js.weight,
  }));
  const match = computeMatch(owned, required);

  return {
    id: inv.id,
    status: inv.status,
    message: inv.message,
    created_at: inv.created_at,
    respondedAt: inv.respondedAt,
    matchScore: semanticScore ?? match.score,
    matchScoreRule: match.score,
    matchMethod: semanticScore != null ? "semantic" : "skill",
    job: {
      id: inv.job.id,
      title: inv.job.title,
      department: inv.job.department,
      type: inv.job.type,
    },
    company: inv.job.company ?? null,
    student: {
      id: inv.student.id,
      nim: inv.student.nim,
      major: inv.student.major,
      semester: inv.student.semester,
      user: inv.student.user,
      university: inv.student.university,
    },
  };
};

// Skor semantik satu undangan terhadap lowongan tujuannya.
const skorSatu = async (inv: any): Promise<number | undefined> => {
  const skor = await getSemanticScores([{ studentId: inv.studentId, jobId: inv.jobId }]);
  return skor.get(pairKey(inv.studentId, inv.jobId));
};

// Bungkus sekumpulan undangan sekaligus: seluruh skor dihitung dalam satu
// putaran supaya tidak ada kueri per baris.
const shapeMany = async (rows: any[]) => {
  const skor = await getSemanticScores(
    rows.map((inv) => ({ studentId: inv.studentId, jobId: inv.jobId })),
  );
  return rows.map((inv) => shapeInvitation(inv, skor.get(pairKey(inv.studentId, inv.jobId))));
};

// ============================================================
// PERUSAHAAN
// ============================================================
export const createInvitation = async (
  companyId: string,
  invitedById: string,
  data: { jobId: string; studentId: string; message?: string },
) => {
  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
    select: { id: true, title: true, companyId: true, status: true },
  });
  if (!job) throw new HttpError(404, "Lowongan tidak ditemukan");
  if (job.companyId !== companyId)
    throw new HttpError(403, "Lowongan ini bukan milik perusahaan Anda");
  if (job.status !== JOB_STATUS.ACTIVE)
    throw new HttpError(400, "Hanya lowongan aktif yang dapat mengundang kandidat");

  const student = await prisma.student.findUnique({
    where: { id: data.studentId },
    select: { id: true, userId: true, user: { select: { status: true, name: true } } },
  });
  if (!student) throw new HttpError(404, "Mahasiswa tidak ditemukan");
  if (student.user?.status !== USER_STATUS.ACTIVE)
    throw new HttpError(400, "Akun mahasiswa tidak aktif");

  // Sudah melamar sendiri -> tidak perlu diundang.
  const applied = await prisma.application.findFirst({
    where: { studentId: data.studentId, jobId: data.jobId },
    select: { id: true },
  });
  if (applied)
    throw new HttpError(409, "Mahasiswa ini sudah melamar lowongan tersebut");

  const existing = await prisma.jobInvitation.findUnique({
    where: { jobId_studentId: { jobId: data.jobId, studentId: data.studentId } },
  });
  if (existing && existing.status === INVITATION_STATUS.PENDING)
    throw new HttpError(409, "Kandidat ini sudah diundang dan menunggu jawaban");
  if (existing && existing.status === INVITATION_STATUS.ACCEPTED)
    throw new HttpError(409, "Kandidat ini sudah menerima undangan sebelumnya");

  // Undangan yang pernah ditolak/dibatalkan boleh dikirim ulang.
  const invitation = existing
    ? await prisma.jobInvitation.update({
        where: { id: existing.id },
        data: {
          status: INVITATION_STATUS.PENDING,
          message: data.message,
          invitedById,
          respondedAt: null,
        },
        include: invitationInclude,
      })
    : await prisma.jobInvitation.create({
        data: {
          jobId: data.jobId,
          studentId: data.studentId,
          invitedById,
          message: data.message,
          status: INVITATION_STATUS.PENDING,
        },
        include: invitationInclude,
      });

  // Notifikasi ke mahasiswa.
  // CATATAN: sesuaikan nama field bila model Notification Anda berbeda.
  await prisma.notification.create({
    data: {
      userId: student.userId,
      title: "Undangan Melamar",
      message: `Anda diundang untuk melamar posisi ${job.title}.`,
      type: "invitation",
    },
  });

  return shapeInvitation(invitation, await skorSatu(invitation));
};

export const listCompanyInvitations = async (
  companyId: string,
  opts: { jobId?: string; status?: string },
) => {
  const rows = await prisma.jobInvitation.findMany({
    where: {
      job: { companyId },
      ...(opts.jobId ? { jobId: opts.jobId } : {}),
      ...(opts.status ? { status: opts.status } : {}),
    },
    include: invitationInclude,
    orderBy: { created_at: "desc" },
  });

  const invitations = await shapeMany(rows);
  const summary = {
    total: invitations.length,
    pending: invitations.filter((i) => i.status === INVITATION_STATUS.PENDING).length,
    accepted: invitations.filter((i) => i.status === INVITATION_STATUS.ACCEPTED).length,
    declined: invitations.filter((i) => i.status === INVITATION_STATUS.DECLINED).length,
  };
  return { invitations, summary };
};

export const cancelInvitation = async (companyId: string, invitationId: string) => {
  const inv = await prisma.jobInvitation.findUnique({
    where: { id: invitationId },
    include: { job: { select: { companyId: true } } },
  });
  if (!inv) throw new HttpError(404, "Undangan tidak ditemukan");
  if (inv.job.companyId !== companyId)
    throw new HttpError(403, "Undangan ini bukan milik perusahaan Anda");
  if (inv.status !== INVITATION_STATUS.PENDING)
    throw new HttpError(400, "Hanya undangan yang masih menunggu jawaban dapat dibatalkan");

  const updated = await prisma.jobInvitation.update({
    where: { id: invitationId },
    data: { status: INVITATION_STATUS.CANCELLED, respondedAt: new Date() },
    include: invitationInclude,
  });
  return shapeInvitation(updated, await skorSatu(updated));
};

// ============================================================
// MAHASISWA
// ============================================================
export const listStudentInvitations = async (studentId: string) => {
  const rows = await prisma.jobInvitation.findMany({
    where: { studentId },
    include: invitationInclude,
    orderBy: { created_at: "desc" },
  });
  return shapeMany(rows);
};

export const respondInvitation = async (
  studentId: string,
  invitationId: string,
  action: "accept" | "decline",
) => {
  const inv = await prisma.jobInvitation.findFirst({
    where: { id: invitationId, studentId },
  });
  if (!inv) throw new HttpError(404, "Undangan tidak ditemukan");
  if (inv.status !== INVITATION_STATUS.PENDING)
    throw new HttpError(400, "Undangan ini sudah dijawab sebelumnya");

  if (action === "decline") {
    const updated = await prisma.jobInvitation.update({
      where: { id: invitationId },
      data: { status: INVITATION_STATUS.DECLINED, respondedAt: new Date() },
      include: invitationInclude,
    });
    return shapeInvitation(updated, await skorSatu(updated));
  }

  // Terima undangan -> jadi lamaran sungguhan.
  const updated = await prisma.$transaction(async (tx: any) => {
    const existingApp = await tx.application.findFirst({
      where: { studentId, jobId: inv.jobId },
      select: { id: true },
    });

    if (!existingApp) {
      await tx.application.create({
        data: {
          studentId,
          jobId: inv.jobId,
          status: APPLICATION_STATUS.SUBMITTED,
          coverLetter: "Melamar melalui undangan perusahaan.",
        },
      });
    }

    return tx.jobInvitation.update({
      where: { id: invitationId },
      data: { status: INVITATION_STATUS.ACCEPTED, respondedAt: new Date() },
      include: invitationInclude,
    });
  });

  return shapeInvitation(updated, await skorSatu(updated));
};