import { Router } from "express";
import {
  matchJobsHandler,
  matchJobDetailHandler,
  matchCandidatesHandler,
} from "./matching.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { ROLES } from "../../constants";

const router = Router();

// Mahasiswa: rekomendasi lowongan + detail skill gap
router.get("/jobs", authMiddleware, authorizeRole(ROLES.STUDENT), matchJobsHandler);
router.get("/jobs/:jobId", authMiddleware, authorizeRole(ROLES.STUDENT), matchJobDetailHandler);

// HRD: daftar kandidat terurut untuk satu lowongan
router.get("/candidates/:jobId", authMiddleware, authorizeRole(ROLES.COMPANY_STAFF), matchCandidatesHandler);

export default router;