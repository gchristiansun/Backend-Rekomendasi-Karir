import { z } from "zod";

// Tambah 1 mahasiswa manual (body JSON).
export const addStudentManualSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.email("Email tidak valid"),
  nim: z.string().min(3, "NIM wajib diisi"),
  major: z.string().optional(),
  semester: z.number().int().min(1).max(20).optional(),
  faculty: z.string().min(2).optional(),
  entryYear: z.number().int().min(1900).max(2100).optional(),
  gpa: z.number().min(0).max(4).optional(),
});

export type AddStudentManualInput = z.infer<typeof addStudentManualSchema>;