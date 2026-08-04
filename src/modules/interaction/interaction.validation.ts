import { z } from "zod";

export const favoriteSchema = z.object({
  jobId: z.string().min(1, "jobId wajib diisi"),
});

export const recordViewSchema = z.object({
  jobId: z.string().min(1, "jobId wajib diisi"),
  source: z.enum(["detail", "list", "search", "recommendation"]).default("detail"),
  // opsional: kalau frontend langsung kirim durasi (mis. lewat sendBeacon)
  durationMs: z.number().int().nonnegative().max(3_600_000).optional(),
});

export const viewDurationSchema = z.object({
  // dibatasi 1 jam: lebih dari itu hampir pasti tab menganggur, bukan dibaca
  durationMs: z.number().int().nonnegative().max(3_600_000),
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type RecordViewInput = z.infer<typeof recordViewSchema>;
export type ViewDurationInput = z.infer<typeof viewDurationSchema>;