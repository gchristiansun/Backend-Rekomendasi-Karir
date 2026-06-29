import { z } from "zod";
import { APPLICATION_STATUS } from "../../constants";

export const applySchema = z.object({
  jobId: z.string().min(1, "jobId wajib diisi"),
  coverLetter: z.string().max(2000).optional(),
});

// HRD hanya boleh ubah ke processing/accepted/rejected (tidak balik ke submitted).
export const updateStatusSchema = z.object({
  status: z.enum([
    APPLICATION_STATUS.PROCESSING,
    APPLICATION_STATUS.ACCEPTED,
    APPLICATION_STATUS.REJECTED,
  ]),
});

export type ApplyInput = z.infer<typeof applySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;