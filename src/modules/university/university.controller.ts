import { Request, Response } from "express";
import * as universityService from "./university.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { HttpError } from "../../utils/httpError";

export const listUniversitiesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query, 50);
  const { total, universities } = await universityService.listUniversities({
    search: req.query.search ? String(req.query.search) : undefined,
    skip,
    take: limit,
  });
  return sendSuccess(res, universities, "Daftar universitas", 200, buildMeta(page, limit, total));
});

export const getUniversityHandler = asyncHandler(async (req: Request, res: Response) => {
  const uni = await universityService.getUniversityById(String(req.params.id));
  if (!uni) throw new HttpError(404, "Universitas tidak ditemukan");
  return sendSuccess(res, uni, "Detail universitas");
});

export const createUniversityHandler = asyncHandler(async (req: Request, res: Response) => {
  const created = await universityService.createUniversityWithAdmin(req.body);
  return sendCreated(res, created, "Universitas dan akun Admin Kampus berhasil dibuat");
});

export const updateUniversityHandler = asyncHandler(async (req: Request, res: Response) => {
  const updated = await universityService.updateUniversity(String(req.params.id), req.body);
  return sendSuccess(res, updated, "Data universitas diperbarui");
});

export const deleteUniversityHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await universityService.deleteUniversity(String(req.params.id));
  return sendSuccess(res, result, "Universitas beserta akun adminnya dihapus");
});
