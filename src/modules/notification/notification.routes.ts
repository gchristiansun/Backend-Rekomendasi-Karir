import { Router } from "express";
import {
  listHandler,
  unreadCountHandler,
  markReadHandler,
  markAllReadHandler,
} from "./notification.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Semua user terautentikasi punya notifikasi sendiri (tanpa batasan role).
router.get("/", authMiddleware, listHandler);
router.get("/unread-count", authMiddleware, unreadCountHandler);
router.patch("/read-all", authMiddleware, markAllReadHandler);
router.patch("/:id/read", authMiddleware, markReadHandler);

export default router;