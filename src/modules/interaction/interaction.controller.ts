import { Request, Response } from "express";
import * as interactionService from "./interaction.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getStudentByUserId, getCompanyMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { getJobOwner } from "../job/job.service";

// ---------- FAVORIT ----------
export const listFavoritesHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const items = await interactionService.listFavorites(student.id);
  return sendSuccess(res, items, "Daftar lowongan favorit");
});

export const addFavoriteHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const fav = await interactionService.addFavorite(student.id, req.body.jobId);
  return sendCreated(res, fav, "Lowongan ditambahkan ke favorit");
});

export const removeFavoriteHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  await interactionService.removeFavorite(student.id, String(req.params.jobId));
  return sendSuccess(res, null, "Lowongan dihapus dari favorit");
});

// ---------- VIEW & DURASI ----------
export const recordViewHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const view = await interactionService.recordView(student.id, req.body);
  return sendCreated(res, view, "Kunjungan dicatat");
});

export const updateViewDurationHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const view = await interactionService.updateViewDuration(
    student.id,
    String(req.params.id),
    req.body.durationMs,
  );
  if (!view) throw new HttpError(404, "Log kunjungan tidak ditemukan");
  return sendSuccess(res, view, "Durasi kunjungan diperbarui");
});

// ---------- SINYAL ----------
export const mySignalsHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const signals = await interactionService.getStudentSignals(student.id);
  return sendSuccess(res, signals, "Sinyal perilaku mahasiswa");
});

// Statistik lowongan (HRD, hanya lowongan perusahaannya).
export const jobSignalsHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const owner = await getJobOwner(String(req.params.jobId));
  if (!owner) throw new HttpError(404, "Lowongan tidak ditemukan");
  if (owner.companyId !== member.companyId) {
    throw new HttpError(403, "Anda tidak berhak melihat statistik lowongan ini");
  }
  const stats = await interactionService.getJobSignals(String(req.params.jobId));
  return sendSuccess(res, stats, "Statistik lowongan");
});