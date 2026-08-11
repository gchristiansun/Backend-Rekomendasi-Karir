import { Router } from "express";
import {
  listFavoritesHandler,
  addFavoriteHandler,
  removeFavoriteHandler,
  recordViewHandler,
  updateViewDurationHandler,
  mySignalsHandler,
  jobSignalsHandler,
} from "./interaction.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRole } from "../../middleware/authorizeRole";
import { validateRequest } from "../../middleware/validateRequest";
import {
  favoriteSchema,
  recordViewSchema,
  viewDurationSchema,
} from "./interaction.validation";
import { ROLES } from "../../constants";

const router = Router();
const STUDENT = authorizeRole(ROLES.STUDENT);

// Favorit (basket)
router.get("/favorites", authMiddleware, STUDENT, listFavoritesHandler);
router.post("/favorites", authMiddleware, STUDENT, validateRequest(favoriteSchema), addFavoriteHandler);
router.delete("/favorites/:jobId", authMiddleware, STUDENT, removeFavoriteHandler);

// View & durasi
router.post("/views", authMiddleware, STUDENT, validateRequest(recordViewSchema), recordViewHandler);
router.patch("/views/:id/duration", authMiddleware, STUDENT, validateRequest(viewDurationSchema), updateViewDurationHandler);

// Sinyal agregat
router.get("/signals/me", authMiddleware, STUDENT, mySignalsHandler);
router.get("/signals/job/:jobId", authMiddleware, authorizeRole(ROLES.COMPANY_STAFF), jobSignalsHandler);


router.get(
  "/signals/job/:jobId",
  authMiddleware,
  authorizeRole(ROLES.COMPANY, ROLES.COMPANY_STAFF),
  jobSignalsHandler,
);
export default router;