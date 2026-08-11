import { Router } from "express";
import {
  createUniversityAdminHandler,
  listUsersHandler,
  getUserHandler,
  updateUserHandler,
  suspendUserHandler,
  activateUserHandler,
  deleteUserHandler,
} from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { createUniversityAdminSchema, updateUserByAdminSchema } from "./user.validation";
import { ROLES } from "../../constants";

const router = Router();

// SEMUA endpoint di sini khusus Admin Utama.
const ADMIN_ONLY = authorizeRole(ROLES.ADMIN);

router.post("/university-admin", authMiddleware, ADMIN_ONLY, validateRequest(createUniversityAdminSchema), createUniversityAdminHandler);
router.get("/", authMiddleware, ADMIN_ONLY, listUsersHandler);
router.get("/:id", authMiddleware, ADMIN_ONLY, getUserHandler);
router.patch("/:id", authMiddleware, ADMIN_ONLY, validateRequest(updateUserByAdminSchema), updateUserHandler);
router.patch("/:id/suspend", authMiddleware, ADMIN_ONLY, suspendUserHandler);
router.patch("/:id/activate", authMiddleware, ADMIN_ONLY, activateUserHandler);
router.delete("/:id", authMiddleware, ADMIN_ONLY, deleteUserHandler);

export default router;