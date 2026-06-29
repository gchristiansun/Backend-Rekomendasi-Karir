import { z } from "zod";

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  industry: z.string().optional(),
  description: z.string().max(2000).optional(),
  website: z.string().url("Website harus URL valid").optional(),
  logoUrl: z.string().optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;