import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";

const mainApiRouter = Router();

mainApiRouter.use('/auth', authRouter);

export default mainApiRouter;