import { Router } from "express";
import {
  applyHandler,
  myApplicationsHandler,
  jobApplicationsHandler,
  updateStatusHandler,
  companyApplicationsHandler,
  withdrawHandler,
} from "./application.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { applySchema, updateStatusSchema } from "./application.validation";
import { ROLES } from "../../constants";
import { requireVerifiedCompany } from "../../middleware/requireVerifiedCompany";

const router = Router();

// Mahasiswa
router.post("/", authMiddleware, authorizeRole(ROLES.STUDENT), validateRequest(applySchema), applyHandler);
router.get("/me", authMiddleware, authorizeRole(ROLES.STUDENT), myApplicationsHandler);
router.delete("/:id", authMiddleware, authorizeRole(ROLES.STUDENT), withdrawHandler);

// HRD
router.get("/job/:jobId", authMiddleware, authorizeRole(ROLES.COMPANY_STAFF), jobApplicationsHandler);
router.patch("/:id/status", authMiddleware, authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF), validateRequest(updateStatusSchema), updateStatusHandler);

router.patch("/:id/status", authMiddleware, authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF), updateStatusHandler);

router.get(
  "/company",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  requireVerifiedCompany,
  companyApplicationsHandler,
);

router.get(
  "/job/:jobId",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  requireVerifiedCompany,
  jobApplicationsHandler,
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  requireVerifiedCompany,
  updateStatusHandler,
);

export default router;