import { Router } from "express";
import {
  listJobsHandler, getJobHandler, listMyCompanyJobsHandler,
  createJobHandler, updateJobHandler, closeJobHandler, deleteJobHandler,
} from "./job.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { createJobSchema, updateJobSchema } from "./job.validation";
import { ROLES } from "../../constants";
import { requireVerifiedCompany } from "../../middleware/requireVerifiedCompany";

const router = Router();

// Kelola lowongan = HRD (company_staff) saja, sesuai PDF.
const COMPANY_SIDE = authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF);

// route spesifik (/mine) sebelum yang generik (/:id)
router.get("/mine", authMiddleware, COMPANY_SIDE, requireVerifiedCompany, listMyCompanyJobsHandler);
router.post("/", authMiddleware, COMPANY_SIDE, requireVerifiedCompany, validateRequest(createJobSchema), createJobHandler);
router.patch("/:id", authMiddleware, COMPANY_SIDE, requireVerifiedCompany, validateRequest(updateJobSchema), updateJobHandler);
router.patch("/:id/close", authMiddleware, COMPANY_SIDE, requireVerifiedCompany, closeJobHandler);
router.delete("/:id", authMiddleware, COMPANY_SIDE, requireVerifiedCompany, deleteJobHandler);      

// browse: semua user login
router.get("/", authMiddleware, listJobsHandler);
router.get("/:id", authMiddleware, getJobHandler);

export default router;