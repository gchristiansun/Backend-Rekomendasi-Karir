import { Router } from "express";
import {
  listSubjectsHandler,
  getSubjectHandler,
  createSubjectHandler,
  updateSubjectHandler,
  deleteSubjectHandler,
  listClosHandler,
  createCloHandler,
  updateCloHandler,
  deleteCloHandler,
} from "./subject.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { createSubjectSchema, updateSubjectSchema } from "./subject.validation";
import { ROLES } from "../../constants";

const router = Router();
const READERS = authorizeRole(ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF, ROLES.ADMIN);
const MANAGERS = authorizeRole(ROLES.UNIVERSITY, ROLES.ADMIN);

// Mata kuliah
router.get("/", authMiddleware, READERS, listSubjectsHandler);
router.get("/:id", authMiddleware, READERS, getSubjectHandler);
router.post("/", authMiddleware, MANAGERS, validateRequest(createSubjectSchema), createSubjectHandler);
router.patch("/:id", authMiddleware, MANAGERS, validateRequest(updateSubjectSchema), updateSubjectHandler);
router.delete("/:id", authMiddleware, MANAGERS, deleteSubjectHandler);

// CLO
router.get("/:id/clos", authMiddleware, READERS, listClosHandler);
router.post("/:id/clos", authMiddleware, MANAGERS, createCloHandler);
router.patch("/clos/:cloId", authMiddleware, MANAGERS, updateCloHandler);
router.delete("/clos/:cloId", authMiddleware, MANAGERS, deleteCloHandler);

export default router;