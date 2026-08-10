import { Router } from "express";
import {
  skillTrendsHandler,
  systemOverviewHandler,
  applicationStatsHandler,
  universityDashboardHandler
} from "./analytics.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { ROLES } from "../../constants";

const router = Router();

// Tren skill: Kaprodi (+ Admin Kampus & Admin Utama boleh lihat juga).
router.get(
  "/skill-trends",
  authMiddleware,
  authorizeRole(ROLES.UNIVERSITY_STAFF, ROLES.UNIVERSITY, ROLES.ADMIN),
  skillTrendsHandler,
);

// Overview sistem: Admin Utama.
router.get("/overview", authMiddleware, authorizeRole(ROLES.ADMIN), systemOverviewHandler);

// Distribusi status lamaran: Admin Utama (+ bisa ditambah role lain nanti).
router.get("/applications", authMiddleware, authorizeRole(ROLES.ADMIN), applicationStatsHandler);

router.get(
  "/university/dashboard",
  authMiddleware,
  authorizeRole(ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF),
  universityDashboardHandler,
);

export default router;