import { Router } from "express";
import {
  loginUserHandler,
  logoutUserHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  registerCompanyHandler,
  updateMeHandler,
  meHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  setRecoveryEmailHandler,
  verifyRecoveryEmailHandler,
} from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  loginUserSchema,
  registerUserSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setRecoveryEmailSchema,
  verifyRecoveryEmailSchema,
  updateMeSchema,
} from "./auth.validation";
import { authMiddleware } from "../../middleware/auth.middleware";
import { uploadCompanyDocs } from "../../config/upload";

const authRouter = Router();

// Registrasi
authRouter.post("/register", validateRequest(registerUserSchema), registerUserHandler);
authRouter.post(
  "/register/company",
  uploadCompanyDocs.fields([
    { name: "izinUsaha", maxCount: 1 },
    { name: "suratResmi", maxCount: 1 },
  ]),
  registerCompanyHandler,
);

// Autentikasi
authRouter.post("/login", validateRequest(loginUserSchema), loginUserHandler);
authRouter.post("/logout", logoutUserHandler);
authRouter.post("/refresh-token", refreshAccessTokenHandler);
authRouter.get("/me", authMiddleware, meHandler);

authRouter.patch("/me", authMiddleware, validateRequest(updateMeSchema), updateMeHandler);

// Kata sandi
authRouter.patch("/password", authMiddleware, validateRequest(changePasswordSchema), changePasswordHandler);
authRouter.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPasswordHandler);
authRouter.post("/reset-password", validateRequest(resetPasswordSchema), resetPasswordHandler);

// Email pemulihan
authRouter.patch("/recovery-email", authMiddleware, validateRequest(setRecoveryEmailSchema), setRecoveryEmailHandler);
authRouter.post("/recovery-email/verify", validateRequest(verifyRecoveryEmailSchema), verifyRecoveryEmailHandler);

export default authRouter;