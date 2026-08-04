import { z } from "zod";

export const updateCompanySchema = z.object({
  name: z.string().min(2, "Nama perusahaan minimal 2 karakter").optional(),
  industry: z.string().min(2).optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  size: z.string().optional(),      // ukuran perusahaan
  address: z.string().optional(),   // alamat kantor pusat
  logoUrl: z.string().optional(),   // logo perusahaan
  nib: z.string().regex(/^\d{13}$/, "NIB harus 13 digit angka").optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const verifyCompanySchema = z.object({
  message: z.string().max(1000).optional(),
});

export const rejectCompanySchema = z.object({
  reason: z.string().min(10, "Alasan penolakan minimal 10 karakter"),
});

export type VerifyCompanyInput = z.infer<typeof verifyCompanySchema>;
export type RejectCompanyInput = z.infer<typeof rejectCompanySchema>;