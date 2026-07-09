import { Request, Response } from "express";
import * as recService from "./recommendation.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getStudentByUserId } from "../../utils/context";
import { HttpError } from "../../utils/httpError";

// GET /recommendation/courses -> rekomendasi kursus untuk semua gap mahasiswa
export const recommendOverallHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const data = await recService.recommendCoursesOverall(student.id);
  return sendSuccess(res, data, "Rekomendasi kursus untuk menutup skill gap");
});

// GET /recommendation/courses/job/:jobId -> rekomendasi kursus untuk gap 1 lowongan
export const recommendForJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const data = await recService.recommendCoursesForJob(student.id, String(req.params.jobId));
  if (!data) throw new HttpError(404, "Lowongan tidak ditemukan");
  return sendSuccess(res, data, "Rekomendasi kursus untuk lowongan ini");
});