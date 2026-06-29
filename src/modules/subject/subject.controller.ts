import { Request, Response } from "express";
import * as subjectService from "./subject.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getUniversityMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../constants";

export const listSubjectsHandler = asyncHandler(async (req: Request, res: Response) => {
  let universityId: string | undefined;
  if (req.user!.role === ROLES.ADMIN) {
    universityId = req.query.universityId ? String(req.query.universityId) : undefined;
  } else {
    const member = await getUniversityMembership(req.user!.id);
    universityId = member.universityId;
  }
  const subjects = await subjectService.listSubjects(universityId);
  return sendSuccess(res, subjects, "Daftar mata kuliah");
});

export const getSubjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.getSubjectById(String(req.params.id));
  if (!subject) throw new HttpError(404, "Mata kuliah tidak ditemukan");
  return sendSuccess(res, subject, "Detail mata kuliah");
});

export const getSubjectCLOsHandler = asyncHandler(async (req: Request, res: Response) => {
  const clos = await subjectService.getSubjectCLOs(String(req.params.id));
  return sendSuccess(res, clos, "Daftar CLO mata kuliah");
});

export const createSubjectHandler = asyncHandler(async (req: Request, res: Response) => {
  let universityId: string | null = null;
  if (req.user!.role !== ROLES.ADMIN) {
    const member = await getUniversityMembership(req.user!.id);
    universityId = member.universityId;
  }
  const subject = await subjectService.createSubject(universityId, req.body);
  return sendCreated(res, subject, "Mata kuliah dibuat");
});

export const updateSubjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.updateSubject(String(req.params.id), req.body);
  return sendSuccess(res, subject, "Mata kuliah diperbarui");
});

export const deleteSubjectHandler = asyncHandler(async (req: Request, res: Response) => {
  await subjectService.deleteSubject(String(req.params.id));
  return sendSuccess(res, null, "Mata kuliah dihapus");
});