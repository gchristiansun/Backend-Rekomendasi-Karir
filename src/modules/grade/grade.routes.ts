import { Router } from "express";
import {
  inputGradeHandler,
  listStudentGradesHandler,
  deleteGradeHandler,
  setCloWeightsHandler,
  subjectGradesHandler,
  saveCloGradesHandler
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

// grade.routes.ts — route literal sebelum yang ber-parameter
router.get("/subject/:subjectId", authMiddleware, KAMPUS, subjectGradesHandler);
router.patch("/subject/:subjectId/clo-weights", authMiddleware, KAMPUS, setCloWeightsHandler);
router.post("/clo", authMiddleware, KAMPUS, saveCloGradesHandler);

export default router;