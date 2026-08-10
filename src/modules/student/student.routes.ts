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
  deleteStudentHandler,
  studentAcademicDetailHandler,
  facultyMajorMapHandler,
  updateStudentByAdminHandler
} from "./student.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { updateStudentSchema, addSkillsSchema, updateStudentByAdminSchema } from "./student.validation";
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

router.delete(
  "/:id",
  authMiddleware,
  authorizeRole(ROLES.UNIVERSITY, ROLES.ADMIN),
  deleteStudentHandler,
);

router.get(
  "/:id/detail",
  authMiddleware,
  authorizeRole(ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF, ROLES.ADMIN),
  studentAcademicDetailHandler,
);

// route literal sebelum yang ber-parameter
router.get("/faculty-major-map", authMiddleware, authorizeRole(ROLES.UNIVERSITY, ROLES.UNIVERSITY_STAFF, ROLES.ADMIN), facultyMajorMapHandler);
router.patch("/:id", authMiddleware, authorizeRole(ROLES.UNIVERSITY, ROLES.ADMIN), validateRequest(updateStudentByAdminSchema), updateStudentByAdminHandler);

export default router;