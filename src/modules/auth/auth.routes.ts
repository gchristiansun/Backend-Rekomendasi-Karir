import { Router } from "express";
import {
  loginUserHandler,
  logoutUserHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
} from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { loginUserSchema, registerUserSchema } from "./auth.validation";

const authRouter = Router();

// Route untuk register
authRouter.post(
  "/register",
  validateRequest(registerUserSchema),
  registerUserHandler,
);

// Route untuk login
authRouter.post(
    "/login", 
    validateRequest(loginUserSchema), 
    loginUserHandler
);

// Route untuk logout
authRouter.post("/logout", logoutUserHandler);

// Route untuk refresh token
authRouter.post("/refresh-token", refreshAccessTokenHandler);

export default authRouter;
