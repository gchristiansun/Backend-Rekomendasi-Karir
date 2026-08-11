import { Router } from "express";
import {
  listCompaniesHandler,
  myCompanyHandler,
  updateMyCompanyHandler,
  getCompanyHandler,
  verifyCompanyHandler,
  rejectCompanyHandler,
  uploadLogoHandler,
  companyReviewHandler,
  updateCompanyDocsHandler,
} from "./company.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { ROLES } from "../../constants";
import { uploadLogo } from "../../config/upload";
import { updateCompanySchema, verifyCompanySchema, rejectCompanySchema } from "./company.validation";
import { uploadCompanyDocs } from "../../config/upload";

const router = Router();

// Profil perusahaan sendiri (Direktur & HRD)
router.get("/me", authMiddleware, authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF), myCompanyHandler);
router.patch("/me", authMiddleware, authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF), validateRequest(updateCompanySchema), updateMyCompanyHandler);

// route /me/... harus di atas /:id
router.patch(
  "/me/logo",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  uploadLogo.single("logo"),
  uploadLogoHandler,
);
const ADMIN = authorizeRole(ROLES.ADMIN);

router.get("/:id/review", authMiddleware, ADMIN, companyReviewHandler);
router.patch("/:id/verify", authMiddleware, ADMIN, validateRequest(verifyCompanySchema), verifyCompanyHandler);
router.patch("/:id/reject", authMiddleware, ADMIN, validateRequest(rejectCompanySchema), rejectCompanyHandler);

// Admin Utama: kelola & verifikasi
router.get("/", authMiddleware, authorizeRole(ROLES.ADMIN), listCompaniesHandler);
router.get("/:id", authMiddleware, authorizeRole(ROLES.ADMIN), getCompanyHandler);


export default router;

// route /me/... harus di atas /:id
router.patch(
  "/me/documents",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  uploadCompanyDocs.fields([
    { name: "izinUsaha", maxCount: 1 },
    { name: "suratResmi", maxCount: 1 },
  ]),
  updateCompanyDocsHandler,
);