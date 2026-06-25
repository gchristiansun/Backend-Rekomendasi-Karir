import { Router } from "express";
import {
  getMyProfileHandler,
  updateMyProfileHandler,
  getMyCompetencyHandler,
  getMySkillsHandler,
  addMySkillsHandler,
  removeMySkillHandler,
  getStudentByIdHandler,
  listStudentsHandler,
} from "./student.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { updateStudentSchema, addSkillsSchema } from "./student.validation";
import { ROLES } from "../../constants";

const router = Router();
const STUDENT = authorizeRole(ROLES.STUDENT);

// --- Endpoint milik mahasiswa sendiri ---
router.get("/me", authMiddleware, STUDENT, getMyProfileHandler);
router.patch("/me", authMiddleware, STUDENT, validateRequest(updateStudentSchema), updateMyProfileHandler);
router.get("/me/competency", authMiddleware, STUDENT, getMyCompetencyHandler);
router.get("/me/skills", authMiddleware, STUDENT, getMySkillsHandler);
router.post("/me/skills", authMiddleware, STUDENT, validateRequest(addSkillsSchema), addMySkillsHandler);
router.delete("/me/skills/:skillId", authMiddleware, STUDENT, removeMySkillHandler);

// --- Untuk perusahaan / kampus / admin ---
router.get(
  "/",
  authMiddleware,
  authorizeRole(ROLES.ADMIN, ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF),
  listStudentsHandler,
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRole(ROLES.ADMIN, ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF, ROLES.COMPANY, ROLES.COMPANY_STAFF),
  getStudentByIdHandler,
);

export default router;