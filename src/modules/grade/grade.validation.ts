import { z } from "zod";

// Input nilai 1 mahasiswa untuk 1 matkul.
export const inputGradeSchema = z.object({
  studentId: z.string().min(1, "studentId wajib diisi"),
  subjectId: z.string().min(1, "subjectId wajib diisi"),
  score: z.number().min(0).max(100).optional(),
  grade: z.string().max(2).optional(), // A/B/C/D/E (opsional)
  semester: z.number().int().min(1).max(20).optional(),
});

export type InputGradeInput = z.infer<typeof inputGradeSchema>;