import { Router } from "express";
import {
  loginUserHandler,
  logoutUserHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  meHandler,
  changePasswordHandler
} from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { loginUserSchema, registerUserSchema, changePasswordSchema } from "./auth.validation";
import { authMiddleware } from "../../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerUserSchema), registerUserHandler);
authRouter.post("/login", validateRequest(loginUserSchema), loginUserHandler);
authRouter.post("/logout", logoutUserHandler);
authRouter.post("/refresh-token", refreshAccessTokenHandler);
authRouter.get("/me", authMiddleware, meHandler);
authRouter.patch("/password", authMiddleware, validateRequest(changePasswordSchema), changePasswordHandler);

export default authRouter;