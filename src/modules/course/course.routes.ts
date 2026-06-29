import { Router } from "express";
import {
  listCoursesHandler,
  getCourseHandler,
  getCourseCLOsHandler,
  createCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
} from "./course.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { createCourseSchema, updateCourseSchema } from "./course.validation";
import { ROLES } from "../../constants";

const router = Router();

// Baca: Admin Kampus, Kaprodi, Admin Utama
const READERS = authorizeRole(ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF, ROLES.ADMIN);
// Kelola kurikulum: Admin Kampus + Admin Utama
const MANAGERS = authorizeRole(ROLES.UNIVERSITY, ROLES.ADMIN);

router.get("/", authMiddleware, READERS, listCoursesHandler);
router.get("/:id", authMiddleware, READERS, getCourseHandler);
router.get("/:id/clos", authMiddleware, READERS, getCourseCLOsHandler);
router.post("/", authMiddleware, MANAGERS, validateRequest(createCourseSchema), createCourseHandler);
router.patch("/:id", authMiddleware, MANAGERS, validateRequest(updateCourseSchema), updateCourseHandler);
router.delete("/:id", authMiddleware, MANAGERS, deleteCourseHandler);

export default router;