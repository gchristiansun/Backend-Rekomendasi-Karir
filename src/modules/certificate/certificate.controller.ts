import { Request, Response } from "express";
import * as certService from "./certificate.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getStudentByUserId, getUniversityMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../constants";
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
  const fileUrl = file ? `/uploads/certificates/${file.filename}` : undefined;
  const fileType = file ? path.extname(file.originalname).replace(".", "").toLowerCase() : undefined;

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