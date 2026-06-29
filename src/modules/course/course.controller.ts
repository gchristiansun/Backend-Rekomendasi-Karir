import { Request, Response } from "express";
import * as courseService from "./course.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getUniversityMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { ROLES } from "../../constants";

export const listCoursesHandler = asyncHandler(async (req: Request, res: Response) => {
  let universityId: string | undefined;
  if (req.user!.role === ROLES.ADMIN) {
    universityId = req.query.universityId ? String(req.query.universityId) : undefined;
  } else {
    const member = await getUniversityMembership(req.user!.id);
    universityId = member.universityId;
  }
  const courses = await courseService.listCourses(universityId);
  return sendSuccess(res, courses, "Daftar mata kuliah / kurikulum");
});

export const getCourseHandler = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getCourseById(String(req.params.id));
  if (!course) throw new HttpError(404, "Mata kuliah tidak ditemukan");
  return sendSuccess(res, course, "Detail mata kuliah");
});

export const getCourseCLOsHandler = asyncHandler(async (req: Request, res: Response) => {
  const clos = await courseService.getCourseCLOs(String(req.params.id));
  return sendSuccess(res, clos, "Daftar CLO mata kuliah");
});

export const createCourseHandler = asyncHandler(async (req: Request, res: Response) => {
  let universityId: string | null = null;
  if (req.user!.role !== ROLES.ADMIN) {
    const member = await getUniversityMembership(req.user!.id);
    universityId = member.universityId;
  }
  const course = await courseService.createCourse(universityId, req.body);
  return sendCreated(res, course, "Mata kuliah dibuat");
});

export const updateCourseHandler = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.updateCourse(String(req.params.id), req.body);
  return sendSuccess(res, course, "Mata kuliah diperbarui");
});

export const deleteCourseHandler = asyncHandler(async (req: Request, res: Response) => {
  await courseService.deleteCourse(String(req.params.id));
  return sendSuccess(res, null, "Mata kuliah dihapus");
});