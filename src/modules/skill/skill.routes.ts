import { Router } from "express";
import {
  listSkillsHandler,
  createSkillHandler,
  updateSkillHandler,
  deleteSkillHandler,
} from "./skill.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { createSkillSchema, updateSkillSchema } from "./skill.validation";
import { ROLES } from "../../constants";

const router = Router();

// Daftar skill: semua user terautentikasi (dipakai form input).
router.get("/", authMiddleware, listSkillsHandler);

// Kelola master skill: Admin & Admin Kampus.
router.post("/", authMiddleware, authorizeRole(ROLES.ADMIN, ROLES.UNIVERSITY), validateRequest(createSkillSchema), createSkillHandler);
router.patch("/:id", authMiddleware, authorizeRole(ROLES.ADMIN, ROLES.UNIVERSITY), validateRequest(updateSkillSchema), updateSkillHandler);
router.delete("/:id", authMiddleware, authorizeRole(ROLES.ADMIN), deleteSkillHandler);

export default router;