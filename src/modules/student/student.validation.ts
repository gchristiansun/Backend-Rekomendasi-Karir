import { z } from "zod";

// Update profil mahasiswa. Semua opsional -> boleh kirim sebagian field saja.
export const updateStudentSchema = z.object({
  nim: z.string().min(3).optional(),
  major: z.string().optional(),
  semester: z.number().int().min(1).max(20).optional(),
  gpa: z.number().min(0).max(4).optional(),
  bio: z.string().max(1000).optional(),
  universityId: z.string().optional(),
});

export const updateStudentByAdminSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.email("Email tidak valid").optional(),
  nim: z.string().min(3).optional(),
  major: z.string().min(2).optional(),
  faculty: z.string().min(2).optional(),
  entryYear: z.number().int().min(1900).max(2100).optional(),
  gpa: z.number().min(0).max(4).optional(),
  status: z.enum(["Active", "Inactive", "Graduated"]).optional(),
});

// Tambah skill manual: { skills: ["React", "Docker"] }
export const addSkillsSchema = z.object({
  skills: z.array(z.string().min(1)).min(1, "Minimal 1 skill"),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type AddSkillsInput = z.infer<typeof addSkillsSchema>;