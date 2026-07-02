import { Router } from "express";
import { addStudentManualHandler, importStudentsCsvHandler } from "./import.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { uploadCsv } from "../../config/upload";
import { addStudentManualSchema } from "./import.validation";
import { ROLES } from "../../constants";

const router = Router();

// Khusus Admin Kampus + Super Admin.
const KAMPUS = authorizeRole(ROLES.UNIVERSITY, ROLES.ADMIN);

router.post(
  "/students",
  authMiddleware,
  KAMPUS,
  validateRequest(addStudentManualSchema),
  addStudentManualHandler,
);
router.post(
  "/students/csv",
  authMiddleware,
  KAMPUS,
  uploadCsv.single("file"), // multer: terima 1 file CSV dari field "file"
  importStudentsCsvHandler,
);

export default router;