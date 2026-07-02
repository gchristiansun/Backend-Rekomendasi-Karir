import { z } from "zod";

// Buat akun Admin Kampus. University: pilih existing (universityId)
// ATAU buat baru (universityName + universityCode).
export const createUniversityAdminSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    phone: z.string().min(6).max(30).optional(),
    universityId: z.string().optional(),
    universityName: z.string().min(2).optional(),
    universityCode: z.string().min(2).optional(),
  })
  .refine(
    (d) => !!d.universityId || (!!d.universityName && !!d.universityCode),
    {
      message: "Isi universityId (universitas yang ada) ATAU universityName + universityCode (universitas baru)",
      path: ["universityId"],
    },
  );

export type CreateUniversityAdminInput = z.infer<typeof createUniversityAdminSchema>;