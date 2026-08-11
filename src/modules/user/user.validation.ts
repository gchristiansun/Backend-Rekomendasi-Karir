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

// Edit pengguna dari halaman Manajemen Pengguna (Super Admin).
export const updateUserByAdminSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.email("Email tidak valid").optional(),
  phone: z.string().min(6).max(30).optional(),
  status: z.enum(["active", "pending", "suspended", "deleted"]).optional(),
  major: z.string().min(2).optional(), // khusus mahasiswa
  nip: z.string().min(2).optional(),   // khusus admin kampus/perusahaan
});
export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;