import { Request, Response } from "express";
import * as matchingService from "./matching.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getStudentByUserId, getCompanyMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { getJobOwner } from "../job/job.service";

export const matchJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const jobs = await matchingService.matchJobsForStudent(student.id, {
    search: req.query.search ? String(req.query.search) : undefined,
  });
  return sendSuccess(res, jobs, "Rekomendasi lowongan berdasarkan kompetensi");
});

export const matchJobDetailHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const detail = await matchingService.matchJobDetail(student.id, String(req.params.jobId));
  if (!detail) throw new HttpError(404, "Lowongan tidak ditemukan");
  return sendSuccess(res, detail, "Analisis kecocokan & skill gap");
});

export const matchCandidatesHandler = asyncHandler(async (req: Request, res: Response) => {
  // OWNERSHIP CHECK: HRD hanya boleh lihat kandidat untuk lowongan perusahaannya.
  const member = await getCompanyMembership(req.user!.id);
  const owner = await getJobOwner(String(req.params.jobId));
  if (!owner) throw new HttpError(404, "Lowongan tidak ditemukan");
  if (owner.companyId !== member.companyId) {
    throw new HttpError(403, "Anda tidak berhak melihat kandidat lowongan ini");
  }
  const result = await matchingService.matchCandidatesForJob(String(req.params.jobId));
  return sendSuccess(res, result, "Daftar kandidat terurut kecocokan");
});

// GET /matching/candidates - talent pool lintas lowongan perusahaan
export const companyCandidatesHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const data = await matchingService.listCompanyCandidates(member.companyId, {
    jobId: req.query.jobId ? String(req.query.jobId) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  return sendSuccess(res, data, "Rekomendasi kandidat perusahaan");
});

// GET /matching/candidates/detail/:studentId?jobId=...
export const candidateDetailHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const data = await matchingService.getCandidateDetail(
    member.companyId,
    String(req.params.studentId),
    { jobId: req.query.jobId ? String(req.query.jobId) : undefined },
  );
  if (!data) throw new HttpError(404, "Kandidat tidak ditemukan");
  return sendSuccess(res, data, "Detail kandidat");
});