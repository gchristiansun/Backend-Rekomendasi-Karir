import { z } from "zod";
import { ALL_JOB_TYPES, ALL_JOB_STATUS } from "../../constants";

export const createJobSchema = z.object({
  title: z.string().min(3, "Judul lowongan minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi pekerjaan wajib diisi (min 10 karakter)"),
  location: z.string().optional(),
  type: z.enum(ALL_JOB_TYPES as [string, ...string[]]).default("fulltime"),
  status: z.enum(ALL_JOB_STATUS as [string, ...string[]]).default("active"),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  // skill teknis yang dibutuhkan (nama bebas) -> wajib min 1 sesuai PDF
  skills: z.array(z.string().min(1)).min(1, "Minimal 1 skill teknis dibutuhkan"),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;