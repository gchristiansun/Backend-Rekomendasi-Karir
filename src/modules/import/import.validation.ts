import { z } from "zod";

// Tambah 1 mahasiswa manual (body JSON).
export const addStudentManualSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.email("Email tidak valid"),
  nim: z.string().min(3, "NIM wajib diisi"),
  major: z.string().optional(),
  semester: z.number().int().min(1).max(20).optional(),
});

export type AddStudentManualInput = z.infer<typeof addStudentManualSchema>;