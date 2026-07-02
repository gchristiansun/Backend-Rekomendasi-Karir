import { Request, Response } from "express";
import * as importService from "./import.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendCreated, sendSuccess } from "../../utils/apiResponse";
import { getUniversityMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../constants";

// Tentukan universityId dari admin yang login.
// Admin Kampus -> universitasnya. Super Admin -> dari body (opsional) / null.
const resolveUniversityId = async (req: Request): Promise<string | null> => {
  if (req.user!.role === ROLES.ADMIN) {
    return req.body.universityId ? String(req.body.universityId) : null;
  }
  const member = await getUniversityMembership(req.user!.id);
  return member.universityId;
};

export const addStudentManualHandler = asyncHandler(async (req: Request, res: Response) => {
  const universityId = await resolveUniversityId(req);
  const result = await importService.addStudentManual(req.body, universityId);
  return sendCreated(res, result, "Mahasiswa berhasil ditambahkan");
});

export const importStudentsCsvHandler = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw new HttpError(400, "File CSV wajib diunggah (field: file)");
  const universityId = await resolveUniversityId(req);
  const csvContent = file.buffer.toString("utf-8");
  const result = await importService.importStudentsCsv(csvContent, universityId);
  return sendSuccess(res, result, "Import CSV selesai");
});