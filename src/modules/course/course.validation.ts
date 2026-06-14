import { z } from "zod";

export const createCourseSchema = z.object({
    title: z.string().min(1),
    provider: z.string(),
    description: z.string(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    duration: z.string(),
    url: z.string().optional(),
    thumbnail: z.string().optional(),
    embedding: z.string().optional()
})

export const updateCourseSchema = 
    createCourseSchema.partial()

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>