import { z } from "zod";
import { ALL_JOB_TYPES, ALL_JOB_STATUS } from "../../constants";

// Satu tanggung jawab + daftar keahliannya.
// API menerima skills sebagai ARRAY; service menyimpannya sebagai CSV.
const requirementItemSchema = z.object({
  requirement: z.string().min(3, "Tanggung jawab minimal 3 karakter"),
  skills: z.array(z.string().min(1)).min(1, "Minimal 1 keahlian per tanggung jawab"),
});

export const createJobSchema = z.object({
  title: z.string().min(3, "Nama posisi minimal 3 karakter"),
  department: z.string().min(2, "Departemen wajib diisi"),
  type: z.enum(ALL_JOB_TYPES as [string, ...string[]]).default("fulltime"),
  location: z.string().min(2, "Lokasi wajib diisi"),
  description: z.string().optional(),
  status: z.enum(ALL_JOB_STATUS as [string, ...string[]]).default("active"),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  postingDate: z.string().optional(),
  deadline: z.string().optional(),
  requirements: z.array(requirementItemSchema).min(1, "Minimal 1 tanggung jawab"),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;