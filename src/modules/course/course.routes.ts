import { Router } from "express"
import { courseController } from "./course.controller"
import { validateRequest } from "../../middleware/validateRequest"
import {
    createCourseSchema,
    updateCourseSchema 
} from "./course.validation"

const router = Router();

router.get(
    "/",
    courseController.getAllCourse
)

router.get(
    "/:id",
    courseController.getCourseById
)

router.post(
    "/",
    validateRequest(createCourseSchema),
    courseController.createCourse
)

router.put(
    "/:id",
    validateRequest(updateCourseSchema),
    courseController.updateCourse
)

router.delete(
    "/:id",
    courseController.deleteCourse
)

export default router;