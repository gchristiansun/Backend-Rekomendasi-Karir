import { Router } from "express";
import {
  listUniversitiesHandler,
  getUniversityHandler,
  createUniversityHandler,
  updateUniversityHandler,
  deleteUniversityHandler,
} from "./university.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { createUniversitySchema, updateUniversitySchema } from "./university.validation";
import { ROLES } from "../../constants";

const router = Router();

// Seluruh endpoint universitas dikelola Admin Utama (Super Admin).
const ADMIN_ONLY = authorizeRole(ROLES.ADMIN);

router.get("/", authMiddleware, ADMIN_ONLY, listUniversitiesHandler);
router.get("/:id", authMiddleware, ADMIN_ONLY, getUniversityHandler);
router.post("/", authMiddleware, ADMIN_ONLY, validateRequest(createUniversitySchema), createUniversityHandler);
router.patch("/:id", authMiddleware, ADMIN_ONLY, validateRequest(updateUniversitySchema), updateUniversityHandler);
router.delete("/:id", authMiddleware, ADMIN_ONLY, deleteUniversityHandler);

export default router;
