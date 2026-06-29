import { z } from "zod";

export const createSubjectSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, "Nama mata kuliah wajib diisi"),
  sks: z.number().int().min(1).max(10).optional(),
  semester: z.number().int().min(1).max(14).optional(),
  rps: z.string().optional(),
  universityId: z.string().optional(),
  skills: z.array(z.string().min(1)).default([]),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;