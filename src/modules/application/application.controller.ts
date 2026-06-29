import { Request, Response } from "express";
import * as appService from "./application.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getStudentByUserId, getCompanyMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { getJobOwner } from "../job/job.service";
import { APPLICATION_STATUS } from "../../constants";

// POST /applications (mahasiswa melamar)
export const applyHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const app = await appService.apply(student.id, req.body.jobId, req.body.coverLetter);
  return sendCreated(res, app, "Lamaran terkirim");
});

// GET /applications/me (mahasiswa)
export const myApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const apps = await appService.listMyApplications(student.id);
  return sendSuccess(res, apps, "Daftar lamaran saya");
});

// GET /applications/job/:jobId (HRD) -> ownership check
export const jobApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const owner = await getJobOwner(String(req.params.jobId));
  if (!owner) throw new HttpError(404, "Lowongan tidak ditemukan");
  if (owner.companyId !== member.companyId) {
    throw new HttpError(403, "Anda tidak berhak melihat pelamar lowongan ini");
  }
  const apps = await appService.listApplicationsForJob(String(req.params.jobId));
  return sendSuccess(res, apps, "Daftar pelamar");
});

// PATCH /applications/:id/status (HRD) -> ownership check
export const updateStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const app = await appService.getApplicationWithJob(String(req.params.id));
  if (!app) throw new HttpError(404, "Lamaran tidak ditemukan");
  if (app.job.companyId !== member.companyId) {
    throw new HttpError(403, "Anda tidak berhak mengubah lamaran ini");
  }
  const updated = await appService.updateStatus(String(req.params.id), req.body.status);
  return sendSuccess(res, { id: updated.id, status: updated.status }, "Status lamaran diperbarui");
});

// DELETE /applications/:id (mahasiswa batalkan)
export const withdrawHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const app = await appService.getApplicationWithJob(String(req.params.id));
  if (!app) throw new HttpError(404, "Lamaran tidak ditemukan");
  if (app.student.id !== student.id) {
    throw new HttpError(403, "Anda hanya dapat membatalkan lamaran sendiri");
  }
  // hanya boleh batalkan kalau masih submitted/processing
  if (
    app.status !== APPLICATION_STATUS.SUBMITTED &&
    app.status !== APPLICATION_STATUS.PROCESSING
  ) {
    throw new HttpError(400, "Lamaran yang sudah diterima/ditolak tidak dapat dibatalkan");
  }
  await appService.withdraw(String(req.params.id));
  return sendSuccess(res, null, "Lamaran dibatalkan");
});