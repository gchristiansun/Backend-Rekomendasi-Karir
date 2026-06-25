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

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;