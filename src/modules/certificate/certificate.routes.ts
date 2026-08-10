import { Router } from "express";
import {
  uploadCertificateHandler,
  myCertificatesHandler,
  pendingCertificatesHandler,
  approveCertificateHandler,
  rejectCertificateHandler,
  listCertificatesHandler,
  certificateDetailHandler,
  updateCertificateSkillsHandler,
  resetCertificateHandler,
} from "./certificate.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { uploadCertificate } from "../../config/upload";
import { ROLES } from "../../constants";

const router = Router();

// Mahasiswa: upload + lihat sertifikat sendiri
router.post(
  "/",
  authMiddleware,
  authorizeRole(ROLES.STUDENT),
  uploadCertificate.single("file"), // <- multer: tangani 1 file dari field "file"
  uploadCertificateHandler,
);
router.get("/me", authMiddleware, authorizeRole(ROLES.STUDENT), myCertificatesHandler);

// Admin Kampus (+ Admin Utama): verifikasi
const REVIEWERS = authorizeRole(ROLES.UNIVERSITY, ROLES.ADMIN);
router.get("/pending", authMiddleware, REVIEWERS, pendingCertificatesHandler);
router.patch("/:id/approve", authMiddleware, REVIEWERS, approveCertificateHandler);
router.patch("/:id/reject", authMiddleware, REVIEWERS, rejectCertificateHandler);

router.get(
  "/",
  authMiddleware,
  authorizeRole(ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF, ROLES.ADMIN),
  listCertificatesHandler,
);

const KAMPUS = authorizeRole(ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF, ROLES.ADMIN);

router.get("/:id", authMiddleware, KAMPUS, certificateDetailHandler);
router.patch("/:id/skills", authMiddleware, KAMPUS, updateCertificateSkillsHandler);
router.patch("/:id/pending", authMiddleware, KAMPUS, resetCertificateHandler);

export default router;