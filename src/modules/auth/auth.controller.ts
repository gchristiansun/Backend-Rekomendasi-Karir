import { Request, Response } from "express";
import * as authService from "./auth.service";
import { HttpError } from "../../utils/httpError";
import { comparePassword, hashPassword } from "../../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { LoginUserInput, RegisterUserInput } from "./auth.validation";
import { UserPayload } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendCreated, sendSuccess } from "../../utils/apiResponse";
import { ROLES, USER_STATUS } from "../../constants";
import { ChangePasswordInput } from "./auth.validation";

const REFRESH_COOKIE = "refreshToken";
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
};

export const registerUserHandler = asyncHandler(
  async (req: Request<{}, {}, RegisterUserInput>, res: Response) => {
    const input = req.body;

    const existing = await authService.findUserByEmail(input.email);
    if (existing) throw new HttpError(409, "Email sudah terdaftar");

    if (input.role === ROLES.COMPANY) {
      const user = await authService.createCompanyAccount(input);
      return sendCreated(
        res,
        {
          id: user.id, name: user.name, email: user.email, role: user.role,
          company: user.companyMember?.company,
        },
        "Akun perusahaan terdaftar. Menunggu verifikasi Admin sebelum dapat memposting lowongan.",
      );
    }

    const user = await authService.createStudent(input);
    return sendCreated(
      res,
      { id: user.id, name: user.name, email: user.email, role: user.role, studentId: user.student?.id },
      "Registrasi mahasiswa berhasil",
    );
  },
);

export const loginUserHandler = asyncHandler(
  async (req: Request<{}, {}, LoginUserInput>, res: Response) => {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user || !user.password) {
      throw new HttpError(401, "Email atau password salah");
    }
    if (user.status === USER_STATUS.SUSPENDED) {
      throw new HttpError(403, "Akun Anda telah dinonaktifkan. Hubungi admin.");
    }
    if (user.status === USER_STATUS.DELETED) {
      throw new HttpError(403, "Akun tidak ditemukan.");
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new HttpError(401, "Email atau password salah");

    const payload = { id: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await authService.saveRefreshToken(user.id, refreshToken);
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);

    return sendSuccess(
      res,
      {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
      },
      "Login berhasil",
    );
  },
);

export const refreshAccessTokenHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE];
    if (!tokenFromCookie) throw new HttpError(401, "No refresh token provided");

    const payload = verifyRefreshToken(tokenFromCookie) as UserPayload | null;
    if (!payload) throw new HttpError(403, "Invalid or expired refresh token");

    const user = await authService.findUserByToken(tokenFromCookie);
    if (!user || user.id !== payload.id) {
      throw new HttpError(403, "Invalid token or user mismatch");
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    return sendSuccess(res, { accessToken }, "Token diperbarui");
  },
);

export const logoutUserHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE];
    if (tokenFromCookie) await authService.clearRefreshToken(tokenFromCookie);

    res.cookie(REFRESH_COOKIE, "", {
      ...refreshCookieOptions,
      maxAge: undefined,
      expires: new Date(0),
    });
    return sendSuccess(res, null, "Logout berhasil");
  },
);

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const me = await authService.getMe(req.user!.id);
  if (!me) throw new HttpError(404, "User tidak ditemukan");
  return sendSuccess(res, me, "Profil pengguna");
});

export const changePasswordHandler = asyncHandler(
  async (req: Request<{}, {}, ChangePasswordInput>, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    const user = await authService.findUserById(req.user!.id);
    if (!user || !user.password) {
      throw new HttpError(404, "User tidak ditemukan");
    }

    // verifikasi password lama
    const valid = await comparePassword(oldPassword, user.password);
    if (!valid) throw new HttpError(401, "Password lama salah");

    const hashed = await hashPassword(newPassword);
    await authService.updatePassword(user.id, hashed);

    return sendSuccess(res, null, "Password berhasil diubah");
  },
);