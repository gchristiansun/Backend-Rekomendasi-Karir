import { z } from "zod";

export const createInvitationSchema = z.object({
  jobId: z.string().min(1, "jobId wajib diisi"),
  studentId: z.string().min(1, "studentId wajib diisi"),
  message: z.string().max(500).optional(),
});

export const respondInvitationSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>;