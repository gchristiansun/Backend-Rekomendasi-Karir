import { Router } from "express";
import {
  inputGradeHandler,
  listStudentGradesHandler,
  deleteGradeHandler,
} from "./grade.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { inputGradeSchema } from "./grade.validation";
import { ROLES } from "../../constants";

const router = Router();

// Input & kelola nilai = Admin Kampus + Super Admin.
const KAMPUS = authorizeRole(ROLES.UNIVERSITY, ROLES.ADMIN);

router.post("/", authMiddleware, KAMPUS, validateRequest(inputGradeSchema), inputGradeHandler);
router.get("/student/:studentId", authMiddleware, KAMPUS, listStudentGradesHandler);
router.delete("/student/:studentId/subject/:subjectId", authMiddleware, KAMPUS, deleteGradeHandler);

export default router;