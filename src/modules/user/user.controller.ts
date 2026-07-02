import { Request, Response } from "express";
import * as userService from "./user.service";
import { findUserByEmail } from "../auth/auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { HttpError } from "../../utils/httpError";
import { USER_STATUS } from "../../constants";

export const createUniversityAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  // cek email belum dipakai
  const existing = await findUserByEmail(req.body.email);
  if (existing) throw new HttpError(409, "Email sudah terdaftar");

  const user = await userService.createUniversityAdmin(req.body);
  return sendCreated(
    res,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.universityMember?.university,
    },
    "Akun Admin Kampus berhasil dibuat",
  );
});

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const { total, users } = await userService.listUsers({
    role: req.query.role ? String(req.query.role) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
    search: req.query.search ? String(req.query.search) : undefined,
    skip,
    take: limit,
  });
  return sendSuccess(res, users, "Daftar semua pengguna", 200, buildMeta(page, limit, total));
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(String(req.params.id));
  if (!user) throw new HttpError(404, "User tidak ditemukan");
  return sendSuccess(res, user, "Detail pengguna");
});

export const suspendUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.setUserStatus(String(req.params.id), USER_STATUS.SUSPENDED);
  return sendSuccess(res, user, "Pengguna disuspend");
});

export const activateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.setUserStatus(String(req.params.id), USER_STATUS.ACTIVE);
  return sendSuccess(res, user, "Pengguna diaktifkan kembali");
});

export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  // soft-delete: set status = deleted (data tetap ada di DB)
  const user = await userService.setUserStatus(String(req.params.id), USER_STATUS.DELETED);
  return sendSuccess(res, user, "Pengguna dihapus (soft-delete)");
});