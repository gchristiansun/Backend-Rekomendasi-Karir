import { Router } from "express";
import {
  skillTrendsHandler,
  systemOverviewHandler,
  applicationStatsHandler,
  universityDashboardHandler,
  activityTrendsHandler,
  activityLogsHandler,
  recentSystemLogsHandler,
  masterCoursesHandler,
  masterIndustriesHandler,
  masterStatsHandler,
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

// ===== Khusus Super Admin (dashboard, log, master data) =====
const ADMIN_ONLY = authorizeRole(ROLES.ADMIN);
router.get("/activity-trends", authMiddleware, ADMIN_ONLY, activityTrendsHandler);
router.get("/activity-logs", authMiddleware, ADMIN_ONLY, activityLogsHandler);
router.get("/recent-logs", authMiddleware, ADMIN_ONLY, recentSystemLogsHandler);
router.get("/master/courses", authMiddleware, ADMIN_ONLY, masterCoursesHandler);
router.get("/master/industries", authMiddleware, ADMIN_ONLY, masterIndustriesHandler);
router.get("/master/stats", authMiddleware, ADMIN_ONLY, masterStatsHandler);

export default router;