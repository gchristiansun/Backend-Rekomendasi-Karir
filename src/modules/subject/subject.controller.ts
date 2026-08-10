import { Request, Response } from "express";
import * as subjectService from "./subject.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getUniversityMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../constants";
import prisma from "../../config/prisma";

export const listSubjectsHandler = asyncHandler(async (req: Request, res: Response) => {
  // Admin Kampus & Kaprodi hanya boleh melihat mata kuliah kampusnya sendiri.
  // Nilai dari query sengaja ditimpa agar pembatasan ini tidak bisa dilangkahi.
  let universityId = req.query.universityId ? String(req.query.universityId) : undefined;
  if (req.user!.role === ROLES.UNIVERSITY || req.user!.role === ROLES.UNIVERSITY_STAFF) {
    const member = await prisma.universityMember.findFirst({
      where: { userId: req.user!.id },
      select: { universityId: true },
    });
    if (!member) throw new HttpError(403, "Anda tidak terhubung dengan universitas mana pun");
    universityId = member.universityId;
  }

  const subjects = await subjectService.listSubjects({
    universityId,
    search: req.query.search ? String(req.query.search) : undefined,
  });
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
  const member = await prisma.universityMember.findFirst({
    where: { userId: req.user!.id },
    select: { universityId: true },
  });

  const subject = await subjectService.createSubject(member?.universityId ?? null, req.body);
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

// subject.controller.ts
export const listClosHandler = asyncHandler(async (req: Request, res: Response) => {
  const clos = await subjectService.listClosBySubject(String(req.params.id));
  return sendSuccess(res, clos, "Daftar CLO mata kuliah");
});

export const createCloHandler = asyncHandler(async (req: Request, res: Response) => {
  const clo = await subjectService.createClo(String(req.params.id), req.body);
  return sendCreated(res, clo, "CLO dibuat");
});

export const updateCloHandler = asyncHandler(async (req: Request, res: Response) => {
  const clo = await subjectService.updateClo(String(req.params.cloId), req.body);
  return sendSuccess(res, clo, "CLO diperbarui");
});

export const deleteCloHandler = asyncHandler(async (req: Request, res: Response) => {
  const force = String(req.query.force ?? "") === "true";
  const hasil = await subjectService.deleteClo(String(req.params.cloId), force);
  return sendSuccess(res, hasil, "CLO dihapus");
});