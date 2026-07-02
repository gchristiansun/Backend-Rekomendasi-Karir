import { Request, Response } from "express";
import * as gradeService from "./grade.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";

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