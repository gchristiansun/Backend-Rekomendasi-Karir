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

const router = Router();

// Kelola lowongan = HRD (company_staff) saja, sesuai PDF.
const HRD_ONLY = authorizeRole(ROLES.COMPANY_STAFF);

// route spesifik (/mine) sebelum yang generik (/:id)
router.get("/mine", authMiddleware, HRD_ONLY, listMyCompanyJobsHandler);
router.post("/", authMiddleware, HRD_ONLY, validateRequest(createJobSchema), createJobHandler);
router.patch("/:id", authMiddleware, HRD_ONLY, validateRequest(updateJobSchema), updateJobHandler);
router.patch("/:id/close", authMiddleware, HRD_ONLY, closeJobHandler);
router.delete("/:id", authMiddleware, HRD_ONLY, deleteJobHandler);

// browse: semua user login
router.get("/", authMiddleware, listJobsHandler);
router.get("/:id", authMiddleware, getJobHandler);

export default router;