import prisma from "../../config/prisma"
import { HttpError } from "../../utils/httpError"
import {
    CreateCourseInput,
    UpdateCourseInput
} from "./course.validation"

export const courseService = {
    async getAllCourses() {
        return prisma.courses.findMany({
            orderBy:{
                created_at: "desc"
            }
        })
    },

    async getCourseById(id: string) {
        const course = await prisma.courses.findUnique({
            where: { id }
        })

        if (!course) throw new Error("Course not found")

        return course;
    },

    async createCourse(input: CreateCourseInput) {
        return prisma.courses.create({
            data: {
                title: input.title,
                provider: input.provider,
                description: input.description,
                level: input.level,
                duration: input.duration,
                url: input.url,
                thumbnail: input.thumbnail,
                embedding: input.embedding
            }
        })
    },

    async updateCourse(id: string, input: UpdateCourseInput) {
        const course = await prisma.courses.findUnique({
            where: { id }
        })
        if (!course) throw new Error("Course not found")

        return prisma.courses.update({
            where: { id },
            data: {
                title: input.title ?? course.title,
                provider: input.provider ?? course.provider,
                description: input.description ?? course.description,
                level: input.level ?? course.level,
                duration: input.duration ?? course.duration,
                url: input.url ?? course.url,
                thumbnail: input.thumbnail ?? course.thumbnail,
                embedding: input.embedding ?? course.embedding
            }
        })
    },

    async deleteCourse(id: string) {
        const course = await prisma.courses.findUnique({
            where: { id }
        })

        if (!course) throw new Error("Course not found")

        return prisma.courses.delete({
            where: { id }
        })
    }
}