import { z } from "zod";

export const createCourseSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, "Nama mata kuliah wajib diisi"),
  sks: z.number().int().min(1).max(10).optional(),
  semester: z.number().int().min(1).max(14).optional(),
  rps: z.string().optional(),
  universityId: z.string().optional(),
  // CPL/keyword skill yang dikembangkan matkul ini (nama bebas)
  skills: z.array(z.string().min(1)).default([]),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;