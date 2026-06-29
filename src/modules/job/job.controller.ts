import { Request, Response } from "express";
import * as jobService from "./job.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { getCompanyMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { COMPANY_STATUS, JOB_STATUS } from "../../constants";

// GET /jobs (semua user login) -> hanya lowongan aktif
export const listJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const { total, jobs } = await jobService.listJobs({
    search: req.query.search ? String(req.query.search) : undefined,
    type: req.query.type ? String(req.query.type) : undefined,
    location: req.query.location ? String(req.query.location) : undefined,
    status: JOB_STATUS.ACTIVE,
    skip, take: limit,
  });
  return sendSuccess(res, jobs, "Daftar lowongan aktif", 200, buildMeta(page, limit, total));
});

export const getJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getJobById(String(req.params.id));
  if (!job) throw new HttpError(404, "Lowongan tidak ditemukan");
  return sendSuccess(res, job, "Detail lowongan");
});

// GET /jobs/mine (HRD) -> semua lowongan perusahaannya (semua status)
export const listMyCompanyJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const { page, limit, skip } = getPagination(req.query);
  const { total, jobs } = await jobService.listJobs({
    companyId: member.companyId,
    status: req.query.status ? String(req.query.status) : undefined,
    search: req.query.search ? String(req.query.search) : undefined,
    skip, take: limit,
  });
  return sendSuccess(res, jobs, "Lowongan perusahaan", 200, buildMeta(page, limit, total));
});

// POST /jobs (HRD, perusahaan harus verified)
export const createJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  if (member.company.status !== COMPANY_STATUS.VERIFIED) {
    throw new HttpError(403, "Perusahaan Anda belum diverifikasi Admin. Lowongan belum dapat diposting.");
  }
  const job = await jobService.createJob(member.companyId, req.user!.id, req.body);
  return sendCreated(res, job, "Lowongan berhasil dibuat");
});

// === OWNERSHIP CHECK: pastikan HRD hanya mengelola lowongan perusahaannya sendiri ===
const assertOwnJob = async (userId: string, jobId: string) => {
  const member = await getCompanyMembership(userId);
  const owner = await jobService.getJobOwner(jobId);
  if (!owner) throw new HttpError(404, "Lowongan tidak ditemukan");
  if (owner.companyId !== member.companyId) {
    throw new HttpError(403, "Anda tidak berhak mengelola lowongan ini");
  }
};

export const updateJobHandler = asyncHandler(async (req: Request, res: Response) => {
  await assertOwnJob(req.user!.id, String(req.params.id));
  const job = await jobService.updateJob(String(req.params.id), req.body);
  return sendSuccess(res, job, "Lowongan diperbarui");
});

export const closeJobHandler = asyncHandler(async (req: Request, res: Response) => {
  await assertOwnJob(req.user!.id, String(req.params.id));
  const job = await jobService.closeJob(String(req.params.id));
  return sendSuccess(res, job, "Lowongan ditutup");
});

export const deleteJobHandler = asyncHandler(async (req: Request, res: Response) => {
  await assertOwnJob(req.user!.id, String(req.params.id));
  await jobService.deleteJob(String(req.params.id));
  return sendSuccess(res, null, "Lowongan dihapus");
});