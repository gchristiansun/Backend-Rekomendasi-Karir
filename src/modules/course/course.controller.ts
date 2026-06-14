import { Request, Response, NextFunction } from "express"
import { courseService } from "./course.service"
import { HttpError } from "../../utils/httpError"

type courseParams = {
    id: string
}

export const courseController= {
    async getAllCourse(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
          const course = await courseService.getAllCourses()  ;
          res.json(course)
        } catch (err) {
            next(err)
        }
    },

    async getCourseById(
        req: Request<courseParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { id } = req.params;
            const course = await courseService.getCourseById(id)

            if (!course) {
                throw new HttpError(404, "Course not found")
            }

            res.json(course);
        } catch (err) {
            next(err);
        }
    },

    async createCourse(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const course = await courseService.createCourse(req.body);
            res.status(201).json(course);
        } catch (err) {
            next(err)
        }
    },

    async updateCourse(
        req: Request<courseParams>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            const updated = await courseService.updateCourse(id, req.body);

            res.json(updated)
        } catch (err) {
            next(err)
        }
    },

    async deleteCourse(
        req: Request<courseParams>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            await courseService.deleteCourse(id);
            res.status(204).send()
        } catch (err) {
            next(err)
        }
    }
}