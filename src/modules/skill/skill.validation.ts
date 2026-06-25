import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(1, "Nama skill wajib diisi"),
  category: z.string().optional(),
});

export const updateSkillSchema = createSkillSchema.partial();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;