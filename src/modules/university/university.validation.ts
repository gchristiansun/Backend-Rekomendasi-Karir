import { z } from "zod";

// Super Admin mendaftarkan universitas baru sekaligus akun Admin Kampusnya.
export const createUniversitySchema = z.object({
  name: z.string().min(3, "Nama universitas minimal 3 karakter"),
  city: z.string().min(2, "Kota/Kabupaten wajib diisi"),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  website: z.string().min(3, "Website wajib diisi"),
  code: z.string().min(2).optional(), // opsional: digenerate dari nama bila kosong
  admin: z.object({
    name: z.string().min(3, "Nama admin minimal 3 karakter"),
    email: z.email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    phone: z.string().min(6).max(30).optional(),
    nip: z.string().min(3).optional(),
  }),
});
export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;

// Edit dari modal Kelola Universitas (data univ + status/nama admin utama).
export const updateUniversitySchema = z.object({
  name: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  website: z.string().min(3).optional(),
  adminName: z.string().min(3).optional(),
  adminStatus: z.enum(["active", "pending", "suspended"]).optional(),
});
export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;
