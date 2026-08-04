import { Request, Response } from "express";
import * as authService from "./auth.service";
import { HttpError } from "../../utils/httpError";
import { comparePassword, hashPassword } from "../../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { UserPayload } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendCreated, sendSuccess } from "../../utils/apiResponse";
import { ROLES, USER_STATUS } from "../../constants";
import { supabase, SUPABASE_COMPANY_BUCKET } from "../../config/supabase";
import { randomUUID } from "crypto";
import { sendMail } from "../../config/mailer";
import {
  RegisterUserInput,
  LoginUserInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SetRecoveryEmailInput,
  VerifyRecoveryEmailInput,
  UpdateMeInput,
} from "./auth.validation";

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

// POST /auth/register/company (multipart/form-data)
// Field teks: name, email, password, companyName, industry, size, website,
//             address, description, nib
// Field file: izinUsaha (wajib, PDF), suratResmi (opsional)
export const registerCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, companyName, industry, size, website, address, description, nib } = req.body;

  // --- validasi manual (multipart tidak lewat Zod) ---
  if (!name || String(name).trim().length < 3)
    throw new HttpError(400, "Nama lengkap minimal 3 karakter");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    throw new HttpError(400, "Email tidak valid");
  if (!password || String(password).length < 8)
    throw new HttpError(400, "Password minimal 8 karakter");
  if (!companyName || String(companyName).trim().length < 2)
    throw new HttpError(400, "Nama perusahaan wajib diisi");
  if (!nib || !/^\d{13}$/.test(String(nib)))
    throw new HttpError(400, "NIB harus terdiri dari tepat 13 digit angka");

  // --- cek duplikat ---
  const existing = await authService.findUserByEmail(String(email));
  if (existing) throw new HttpError(409, "Email sudah terdaftar");
  const nibUsed = await authService.findCompanyByNib(String(nib));
  if (nibUsed) throw new HttpError(409, "NIB sudah terdaftar oleh perusahaan lain");

  // --- ambil file dari multer.fields ---
  const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
  const izinUsaha = files?.izinUsaha?.[0];
  const suratResmi = files?.suratResmi?.[0];
  if (!izinUsaha) throw new HttpError(400, "Dokumen Izin Usaha (PDF) wajib diunggah");

  // --- unggah ke Supabase ---
  const uploadDoc = async (file: Express.Multer.File, label: string) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "bin";
    const objectPath = `${label}/${Date.now()}-${randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(SUPABASE_COMPANY_BUCKET)
      .upload(objectPath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new HttpError(500, `Gagal mengunggah ${label}: ${error.message}`);
    const { data } = supabase.storage.from(SUPABASE_COMPANY_BUCKET).getPublicUrl(objectPath);
    return data.publicUrl;
  };

  const izinUsahaUrl = await uploadDoc(izinUsaha, "izin-usaha");
  const suratResmiUrl = suratResmi ? await uploadDoc(suratResmi, "surat-resmi") : undefined;

  // --- buat akun + perusahaan (pending) ---
  const user = await authService.createCompanyAccountFull({
    name: String(name),
    email: String(email),
    password: String(password),
    companyName: String(companyName),
    industry: industry ? String(industry) : undefined,
    size: size ? String(size) : undefined,
    website: website ? String(website) : undefined,
    address: address ? String(address) : undefined,
    description: description ? String(description) : undefined,
    nib: String(nib),
    izinUsahaUrl,
    suratResmiUrl,
  });

  return sendCreated(
    res,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.companyMember?.company,
    },
    "Pendaftaran perusahaan berhasil. Akun Anda berstatus Pending dan akan diverifikasi Superadmin dalam 1–2 hari kerja.",
  );
});

// POST /auth/forgot-password
export const forgotPasswordHandler = asyncHandler(
  async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
    const { email } = req.body;
    const user = await authService.findUserByEmail(email);

    const genericMsg =
      "Jika email terdaftar, tautan pemulihan kata sandi telah dikirim. Periksa kotak masuk (dan folder spam).";

    if (user && user.status === USER_STATUS.ACTIVE) {
      const rawToken = await authService.createPasswordResetToken(user.id);
      const resetLink = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/reset-password?token=${rawToken}`;

      const buildHtml = () => `
        <div style="font-family:Arial,sans-serif;max-width:480px">
          <h2>Pemulihan Kata Sandi</h2>
          <p>Halo ${user.name ?? ""},</p>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.
             Klik tombol di bawah (berlaku <b>1 jam</b>):</p>
          <p style="margin:24px 0">
            <a href="${resetLink}"
               style="background:#0f5ce0;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
               Atur Ulang Kata Sandi
            </a>
          </p>
          <p>Atau salin tautan ini ke browser:<br><a href="${resetLink}">${resetLink}</a></p>
          <p style="color:#888;font-size:12px">Jika Anda tidak meminta ini, abaikan email ini.</p>
        </div>`;

      // kirim ke email utama
      await sendMail(user.email, "Pemulihan Kata Sandi - Sistem Rekomendasi Karir", buildHtml());

      // + email pemulihan TERVERIFIKASI (dikirim TERPISAH agar alamat tidak saling bocor).
      // Inilah jalur penyelamat saat email kampus sudah dinonaktifkan.
      if (user.recoveryEmail && user.recoveryEmailVerifiedAt) {
        await sendMail(
          user.recoveryEmail,
          "Pemulihan Kata Sandi - Sistem Rekomendasi Karir",
          buildHtml(),
        );
      }
    }

    return sendSuccess(res, null, genericMsg);
  },
);

// POST /auth/reset-password
export const resetPasswordHandler = asyncHandler(
  async (req: Request<{}, {}, ResetPasswordInput>, res: Response) => {
    const { token, newPassword } = req.body;

    const hashed = await hashPassword(newPassword);
    const userId = await authService.resetPasswordWithToken(token, hashed);
    if (!userId) {
      throw new HttpError(400, "Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.");
    }
    return sendSuccess(res, null, "Kata sandi berhasil diubah. Silakan login dengan kata sandi baru.");
  },
);

// PATCH /auth/recovery-email  (login) - pasang/ganti email pemulihan
export const setRecoveryEmailHandler = asyncHandler(
  async (req: Request<{}, {}, SetRecoveryEmailInput>, res: Response) => {
    const { recoveryEmail, password } = req.body;

    const user = await authService.findUserById(req.user!.id);
    if (!user || !user.password) throw new HttpError(404, "User tidak ditemukan");

    // konfirmasi password (anti pembajakan sesi)
    const valid = await comparePassword(password, user.password);
    if (!valid) throw new HttpError(401, "Password salah");

    if (recoveryEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new HttpError(400, "Email pemulihan harus berbeda dari email utama");
    }

    const rawToken = await authService.createRecoveryEmailToken(user.id, recoveryEmail);
    const verifyLink = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/verify-recovery-email?token=${rawToken}`;

    await sendMail(
      recoveryEmail,
      "Verifikasi Email Pemulihan - Sistem Rekomendasi Karir",
      `
      <div style="font-family:Arial,sans-serif;max-width:480px">
        <h2>Verifikasi Email Pemulihan</h2>
        <p>Halo ${user.name ?? ""},</p>
        <p>Alamat ini didaftarkan sebagai <b>email pemulihan</b> akun Anda.
           Klik tombol di bawah untuk mengonfirmasi (berlaku <b>24 jam</b>):</p>
        <p style="margin:24px 0">
          <a href="${verifyLink}"
             style="background:#0f5ce0;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
             Verifikasi Email Pemulihan
          </a>
        </p>
        <p>Atau salin tautan ini ke browser:<br><a href="${verifyLink}">${verifyLink}</a></p>
        <p style="color:#888;font-size:12px">Jika Anda tidak merasa mendaftarkan alamat ini, abaikan email ini.</p>
      </div>
      `,
    );

    return sendSuccess(
      res,
      { recoveryEmail, verified: false },
      "Tautan verifikasi telah dikirim ke email pemulihan. Periksa kotak masuk (dan folder spam).",
    );
  },
);

// POST /auth/recovery-email/verify  (publik) - sahkan lewat token
export const verifyRecoveryEmailHandler = asyncHandler(
  async (req: Request<{}, {}, VerifyRecoveryEmailInput>, res: Response) => {
    const userId = await authService.confirmRecoveryEmail(req.body.token);
    if (!userId) {
      throw new HttpError(400, "Tautan tidak valid atau sudah kedaluwarsa. Silakan kirim ulang dari pengaturan akun.");
    }
    return sendSuccess(res, null, "Email pemulihan berhasil diverifikasi.");
  },
);

// PATCH /auth/me - ubah profil akun sendiri
export const updateMeHandler = asyncHandler(
  async (req: Request<{}, {}, UpdateMeInput>, res: Response) => {
    const { name, phone, email, password } = req.body;

    const user = await authService.findUserById(req.user!.id);
    if (!user) throw new HttpError(404, "User tidak ditemukan");

    const data: { name?: string; phone?: string; email?: string } = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;

    // Email adalah identitas login -> ganti hanya dengan konfirmasi kata sandi.
    if (email !== undefined && email.toLowerCase() !== user.email.toLowerCase()) {
      if (!password) {
        throw new HttpError(400, "Masukkan Kata Sandi Saat Ini untuk mengubah alamat email");
      }
      if (!user.password) throw new HttpError(400, "Akun ini tidak memiliki kata sandi");

      const valid = await comparePassword(password, user.password);
      if (!valid) throw new HttpError(401, "Kata sandi salah");

      const taken = await authService.findUserByEmail(email);
      if (taken) throw new HttpError(409, "Email sudah digunakan akun lain");

      data.email = email;
    }

    const updated = await authService.updateOwnProfile(user.id, data);
    return sendSuccess(res, updated, "Profil akun berhasil diperbarui");
  },
);