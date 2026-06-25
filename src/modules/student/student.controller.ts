import { Request, Response } from "express";
import * as studentService from "./student.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { getStudentByUserId } from "../../utils/context";
import { HttpError } from "../../utils/httpError";

export const getMyProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const profile = await studentService.getStudentProfile(student.id);
  return sendSuccess(res, profile, "Profil mahasiswa");
});

export const updateMyProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const updated = await studentService.updateStudent(student.id, req.body);
  return sendSuccess(res, updated, "Profil diperbarui");
});

export const getMyCompetencyHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const competency = await studentService.getCompetency(student.id);
  return sendSuccess(res, competency, "Profil kompetensi");
});

export const getMySkillsHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const skills = await studentService.listSkills(student.id);
  return sendSuccess(res, skills, "Daftar skill mahasiswa");
});

export const addMySkillsHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const skills = await studentService.addManualSkills(student.id, req.body.skills);
  return sendSuccess(res, skills, "Skill ditambahkan");
});

export const removeMySkillHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  await studentService.removeSkill(student.id, String(req.params.skillId));
  return sendSuccess(res, null, "Skill dihapus");
});

// Untuk perusahaan/admin melihat profil kandidat by id.
export const getStudentByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const profile = await studentService.getStudentProfile(String(req.params.id));
  if (!profile) throw new HttpError(404, "Mahasiswa tidak ditemukan");
  return sendSuccess(res, profile, "Detail mahasiswa");
});

export const listStudentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const { total, students } = await studentService.listStudents({
    search: req.query.search ? String(req.query.search) : undefined,
    universityId: req.query.universityId ? String(req.query.universityId) : undefined,
    skip,
    take: limit,
  });
  return sendSuccess(res, students, "Daftar mahasiswa", 200, buildMeta(page, limit, total));
});