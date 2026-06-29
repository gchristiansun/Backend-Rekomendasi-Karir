import { Router } from "express";
import {
  listCompaniesHandler,
  myCompanyHandler,
  updateMyCompanyHandler,
  getCompanyHandler,
  verifyCompanyHandler,
  rejectCompanyHandler,
} from "./company.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { updateCompanySchema } from "./company.validation";
import { ROLES } from "../../constants";

const router = Router();

// Profil perusahaan sendiri (Direktur & HRD)
router.get("/me", authMiddleware, authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF), myCompanyHandler);
router.patch("/me", authMiddleware, authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF), validateRequest(updateCompanySchema), updateMyCompanyHandler);

// Admin Utama: kelola & verifikasi
router.get("/", authMiddleware, authorizeRole(ROLES.ADMIN), listCompaniesHandler);
router.patch("/:id/verify", authMiddleware, authorizeRole(ROLES.ADMIN), verifyCompanyHandler);
router.patch("/:id/reject", authMiddleware, authorizeRole(ROLES.ADMIN), rejectCompanyHandler);
router.get("/:id", authMiddleware, authorizeRole(ROLES.ADMIN), getCompanyHandler);

export default router;