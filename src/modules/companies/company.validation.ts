import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  founded: z.string().optional(),
  website: z.string().url().optional(),
  logo_icon: z.string().optional(),
  description: z.string().optional(),
  verified: z.boolean().optional(),
  admin_email: z.string(),
  admin_password: z.string(),
  admin_name: z.string()
});

export const updateCompanySchema =
  createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>