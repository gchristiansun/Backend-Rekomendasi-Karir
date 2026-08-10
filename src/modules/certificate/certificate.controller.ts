import { Request, Response } from "express";
import * as certService from "./certificate.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getStudentByUserId, getUniversityMembership,  } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../constants";
import { supabase, SUPABASE_BUCKET } from "../../config/supabase";
import { randomUUID } from "crypto";
import prisma from "../../config/prisma";
import * as certificateService from "./certificate.service";
import path from "path";

// Parse field "skills" dari multipart (bisa JSON array ATAU dipisah koma).
const parseSkills = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  const str = String(raw).trim();
  if (str.startsWith("[")) {
    try {
      const arr = JSON.parse(str);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }
  return str.split(",").map((s) => s.trim()).filter(Boolean);
};

// POST /certificates (mahasiswa upload, multipart/form-data, field file: "file")
export const uploadCertificateHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const { title, issuer } = req.body;
  if (!title) throw new HttpError(400, "Judul sertifikat wajib diisi");

  const file = req.file;
  let fileUrl: string | undefined;
  let fileType: string | undefined;

  if (file) {
    // nama file unik di bucket: certificates/<studentId>/<uuid>.<ext>
    const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "bin";
    const objectPath = `${student.id}/${randomUUID()}.${ext}`;

    // unggah buffer ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new HttpError(500, `Gagal mengunggah file: ${uploadError.message}`);
    }

    // ambil URL publik (bucket harus Public)
    const { data: publicData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(objectPath);

    fileUrl = publicData.publicUrl;
    fileType = ext;
  }

  const cert = await certService.createCertificate({
    studentId: student.id,
    title,
    issuer,
    fileUrl,
    fileType,
    skillNames: parseSkills(req.body.skills),
  });
  return sendCreated(res, cert, "Sertifikat diunggah, menunggu verifikasi Admin Kampus");
});

export const myCertificatesHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const certs = await certService.listMyCertificates(student.id);
  return sendSuccess(res, certs, "Sertifikat saya");
});

// GET /certificates/pending (Admin Kampus) -> scope kampusnya
export const pendingCertificatesHandler = asyncHandler(async (req: Request, res: Response) => {
  let universityId: string | undefined;
  if (req.user!.role !== ROLES.ADMIN) {
    const member = await getUniversityMembership(req.user!.id);
    universityId = member.universityId;
  }
  const certs = await certService.listPending(universityId);
  return sendSuccess(res, certs, "Ajuan sertifikat menunggu verifikasi");
});

export const approveCertificateHandler = asyncHandler(async (req: Request, res: Response) => {
  const cert = await certService.approveCertificate(String(req.params.id), req.user!.id);
  return sendSuccess(res, cert, "Sertifikat disetujui");
});

export const rejectCertificateHandler = asyncHandler(async (req: Request, res: Response) => {
  const cert = await certService.rejectCertificate(String(req.params.id), req.user!.id, req.body?.note);
  return sendSuccess(res, cert, "Sertifikat ditolak");
});

// GET /certificates - seluruh sertifikat (Admin Kampus / Kaprodi / Superadmin)
export const listCertificatesHandler = asyncHandler(async (req: Request, res: Response) => {
  // Admin Kampus & Kaprodi hanya melihat sertifikat mahasiswa kampusnya sendiri.
  let universityId: string | undefined;
  if (req.user!.role === ROLES.UNIVERSITY || req.user!.role === ROLES.UNIVERSITY_STAFF) {
    const member = await prisma.universityMember.findFirst({
      where: { userId: req.user!.id },
      select: { universityId: true },
    });
    if (!member) throw new HttpError(403, "Anda tidak terhubung dengan universitas mana pun");
    universityId = member.universityId;
  }

  const certificates = await certificateService.listCertificates({
    status: req.query.status ? String(req.query.status) : undefined,
    universityId,
  });
  return sendSuccess(res, certificates, "Daftar sertifikat");
});

// Admin Kampus & Kaprodi hanya boleh menangani sertifikat mahasiswa kampusnya.
const assertKampusBerhak = async (req: Request, universityId?: string | null) => {
  if (req.user!.role !== ROLES.UNIVERSITY && req.user!.role !== ROLES.UNIVERSITY_STAFF) return;
  const member = await prisma.universityMember.findFirst({
    where: { userId: req.user!.id },
    select: { universityId: true },
  });
  if (!member || member.universityId !== universityId) {
    throw new HttpError(403, "Sertifikat ini bukan dari universitas Anda");
  }
};

// GET /certificates/:id
export const certificateDetailHandler = asyncHandler(async (req: Request, res: Response) => {
  const cert = await certificateService.getCertificateById(String(req.params.id));
  if (!cert) throw new HttpError(404, "Sertifikat tidak ditemukan");
  await assertKampusBerhak(req, (cert as any).student?.universityId);
  return sendSuccess(res, cert, "Detail sertifikat");
});

// PATCH /certificates/:id/skills
export const updateCertificateSkillsHandler = asyncHandler(async (req: Request, res: Response) => {
  const cert = await certificateService.getCertificateById(String(req.params.id));
  if (!cert) throw new HttpError(404, "Sertifikat tidak ditemukan");
  await assertKampusBerhak(req, (cert as any).student?.universityId);

  const updated = await certificateService.updateCertificateSkills(
    String(req.params.id),
    req.body.skills ?? [],
  );
  return sendSuccess(res, updated, "Keahlian sertifikat diperbarui");
});

// PATCH /certificates/:id/pending
export const resetCertificateHandler = asyncHandler(async (req: Request, res: Response) => {
  const cert = await certificateService.getCertificateById(String(req.params.id));
  if (!cert) throw new HttpError(404, "Sertifikat tidak ditemukan");
  await assertKampusBerhak(req, (cert as any).student?.universityId);

  const updated = await certificateService.setCertificatePending(String(req.params.id));
  return sendSuccess(res, updated, "Status sertifikat dikembalikan ke menunggu verifikasi");
});