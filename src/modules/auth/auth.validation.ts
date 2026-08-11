import { z } from "zod";
import { ROLES } from "../../constants";

// Registrasi: student (default) atau company (perusahaan self-register).
export const registerUserSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    phone: z.string().min(6).max(30).optional(),
    role: z.enum([ROLES.STUDENT, ROLES.COMPANY]).default(ROLES.STUDENT),
    // wajib jika role = company
    companyName: z.string().min(2).optional(),
    nim: z.string().min(3).optional(), // opsional untuk student
  })
  .refine(
    (data) => data.role !== ROLES.COMPANY || !!data.companyName,
    { message: "companyName wajib diisi untuk pendaftaran perusahaan", path: ["companyName"] },
  );

export const loginUserSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru harus berbeda dari password lama",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token tidak valid"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const setRecoveryEmailSchema = z.object({
  recoveryEmail: z.email("Email pemulihan tidak valid"),
  password: z.string().min(1, "Password wajib diisi untuk konfirmasi"),
});

export const verifyRecoveryEmailSchema = z.object({
  token: z.string().min(10, "Token tidak valid"),
});

export type SetRecoveryEmailInput = z.infer<typeof setRecoveryEmailSchema>;
export type VerifyRecoveryEmailInput = z.infer<typeof verifyRecoveryEmailSchema>;

export const updateMeSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").optional(),
  phone: z.string().min(6, "Nomor telepon terlalu pendek").max(30).optional(),
  email: z.email("Email tidak valid").optional(),
  // wajib diisi hanya bila email diubah
  password: z.string().optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;