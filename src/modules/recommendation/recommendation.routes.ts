import { Router } from "express";
import {
  recommendOverallHandler,
  recommendForJobHandler,
} from "./recommendation.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { ROLES } from "../../constants";

const router = Router();

// Rekomendasi kursus = untuk mahasiswa.
const STUDENT = authorizeRole(ROLES.STUDENT);

// route spesifik (/job/:jobId) sebelum yang umum
router.get("/courses/job/:jobId", authMiddleware, STUDENT, recommendForJobHandler);
router.get("/courses", authMiddleware, STUDENT, recommendOverallHandler);

export default router;