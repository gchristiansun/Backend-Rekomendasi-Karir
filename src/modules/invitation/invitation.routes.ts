import { Router } from "express";
import {
  createInvitationHandler,
  companyInvitationsHandler,
  cancelInvitationHandler,
  myInvitationsHandler,
  respondInvitationHandler,
} from "./invitation.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import { createInvitationSchema, respondInvitationSchema } from "./invitation.validation";
import { ROLES } from "../../constants";

const router = Router();
const COMPANY_SIDE = authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF);
const STUDENT = authorizeRole(ROLES.STUDENT);

// route literal sebelum yang ber-parameter
router.get("/company", authMiddleware, COMPANY_SIDE, companyInvitationsHandler);
router.get("/me", authMiddleware, STUDENT, myInvitationsHandler);

router.post("/", authMiddleware, COMPANY_SIDE, validateRequest(createInvitationSchema), createInvitationHandler);
router.patch("/:id/cancel", authMiddleware, COMPANY_SIDE, cancelInvitationHandler);
router.patch("/:id/respond", authMiddleware, STUDENT, validateRequest(respondInvitationSchema), respondInvitationHandler);




export default router;