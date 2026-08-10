import { Request, Response } from "express";
import * as studentService from "./student.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { getStudentByUserId } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import prisma from "../../config/prisma";
import { ROLES, USER_STATUS } from "../../constants";

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

  // Admin Kampus & Kaprodi hanya boleh melihat mahasiswa kampusnya sendiri.
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

  const { total, students } = await studentService.listStudents({
    search: req.query.search ? String(req.query.search) : undefined,
    universityId,
    skip,
    take: limit,
  });
  return sendSuccess(res, students, "Daftar mahasiswa", 200, buildMeta(page, limit, total));
});

// DELETE /students/:id - nonaktifkan akun mahasiswa (soft-delete)
export const deleteStudentHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { id: String(req.params.id) },
    select: { id: true, userId: true, universityId: true },
  });
  if (!student) throw new HttpError(404, "Mahasiswa tidak ditemukan");
  // Admin Kampus hanya boleh menonaktifkan mahasiswa kampusnya sendiri.
  if (req.user!.role === ROLES.UNIVERSITY) {
    const member = await prisma.universityMember.findFirst({
      where: { userId: req.user!.id },
      select: { universityId: true },
    });
    if (!member || member.universityId !== student.universityId) {
      throw new HttpError(403, "Mahasiswa ini bukan dari universitas Anda");
    }
  }
  // Mengikuti pola soft-delete yang dipakai Superadmin: data tetap tersimpan
  // untuk keperluan riwayat, tetapi akunnya tidak bisa dipakai lagi.
  await prisma.user.update({
    where: { id: student.userId },
    data: { status: USER_STATUS.DELETED },
  });

  return sendSuccess(res, null, "Akun mahasiswa dinonaktifkan");
});

// GET /students/:id/detail
export const studentAcademicDetailHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await studentService.getStudentAcademicDetail(String(req.params.id));
  if (!data) throw new HttpError(404, "Mahasiswa tidak ditemukan");

  // Admin Kampus & Kaprodi hanya boleh melihat mahasiswa kampusnya sendiri.
  if (req.user!.role === ROLES.UNIVERSITY || req.user!.role === ROLES.UNIVERSITY_STAFF) {
    const member = await prisma.universityMember.findFirst({
      where: { userId: req.user!.id },
      select: { universityId: true },
    });
    if (!member || member.universityId !== data.student.university?.id) {
      throw new HttpError(403, "Mahasiswa ini bukan dari universitas Anda");
    }
  }

  return sendSuccess(res, data, "Detail akademik mahasiswa");
});

// PATCH /students/:id
export const updateStudentByAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const updated = await studentService.updateStudentByAdmin(String(req.params.id), req.body);
  return sendSuccess(res, updated, "Data mahasiswa diperbarui");
});

// GET /students/faculty-major-map
export const facultyMajorMapHandler = asyncHandler(async (req: Request, res: Response) => {
  let universityId: string | undefined;
  if (req.user!.role === ROLES.UNIVERSITY || req.user!.role === ROLES.UNIVERSITY_STAFF) {
    const member = await prisma.universityMember.findFirst({
      where: { userId: req.user!.id },
      select: { universityId: true },
    });
    universityId = member?.universityId;
  }
  const map = await studentService.getFacultyMajorMap(universityId);
  return sendSuccess(res, map, "Daftar fakultas dan program studi");
});