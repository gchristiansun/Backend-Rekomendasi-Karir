import { Request, Response } from "express";
import * as gradeService from "./grade.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { HttpError } from "../../utils/httpError";
import prisma from "../../config/prisma";
import { ROLES } from "../../constants";

export const inputGradeHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await gradeService.inputGrade(req.body);
  return sendCreated(res, result, "Nilai berhasil diinput");
});

export const listStudentGradesHandler = asyncHandler(async (req: Request, res: Response) => {
  const grades = await gradeService.listStudentGrades(String(req.params.studentId));
  return sendSuccess(res, grades, "Daftar nilai mahasiswa");
});

export const deleteGradeHandler = asyncHandler(async (req: Request, res: Response) => {
  await gradeService.deleteGrade(String(req.params.studentId), String(req.params.subjectId));
  return sendSuccess(res, null, "Nilai dihapus");
});

// GET /grades/subject/:subjectId
export const subjectGradesHandler = asyncHandler(async (req: Request, res: Response) => {
  let universityId: string | undefined;
  if (req.user!.role === ROLES.UNIVERSITY || req.user!.role === ROLES.UNIVERSITY_STAFF) {
    const member = await prisma.universityMember.findFirst({
      where: { userId: req.user!.id },
      select: { universityId: true },
    });
    if (!member) throw new HttpError(403, "Anda tidak terhubung dengan universitas mana pun");
    universityId = member.universityId;
  }

  const data = await gradeService.listSubjectGrades(String(req.params.subjectId), universityId);
  if (!data) throw new HttpError(404, "Mata kuliah tidak ditemukan");
  return sendSuccess(res, data, "Data nilai mata kuliah");
});

// PATCH /grades/subject/:subjectId/clo-weights
export const setCloWeightsHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await gradeService.setCloWeights(String(req.params.subjectId), req.body.weights ?? []);
  return sendSuccess(res, data, "Bobot CLO diperbarui");
});

// POST /grades/clo
export const saveCloGradesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { studentId, subjectId, scores } = req.body;
  const data = await gradeService.saveCloGrades(studentId, subjectId, scores ?? []);
  return sendSuccess(res, data, "Nilai CLO disimpan");
});