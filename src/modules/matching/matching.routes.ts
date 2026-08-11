import { Router } from "express";
import {
  matchJobsHandler,
  matchJobDetailHandler,
  matchCandidatesHandler,
  companyCandidatesHandler,
  candidateDetailHandler,
} from "./matching.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { ROLES } from "../../constants";

const router = Router();

router.get("/candidates/:jobId", authMiddleware, authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF), matchCandidatesHandler);

// Mahasiswa: rekomendasi lowongan + detail skill gap
router.get("/jobs", authMiddleware, authorizeRole(ROLES.STUDENT), matchJobsHandler);
router.get("/jobs/:jobId", authMiddleware, authorizeRole(ROLES.STUDENT), matchJobDetailHandler);

// HRD: daftar kandidat terurut untuk satu lowongan
router.get("/candidates/:jobId", authMiddleware, authorizeRole(ROLES.COMPANY_STAFF), matchCandidatesHandler);

// route literal WAJIB sebelum yang ber-parameter, kalau tidak "candidates"
// akan tertangkap sebagai :jobId
router.get(
  "/candidates",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  companyCandidatesHandler,
);

router.get(
  "/candidates/detail/:studentId",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  candidateDetailHandler,
);

router.get(
  "/candidates/:jobId",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  matchCandidatesHandler,
);

export default router;