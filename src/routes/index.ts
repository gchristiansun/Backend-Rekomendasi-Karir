import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import companyRouter from "../modules/companies/company.routes";
import courseRouter from "../modules/course/course.routes"

const mainApiRouter = Router();

mainApiRouter.use('/auth', authRouter);
mainApiRouter.use('/companies', companyRouter);
mainApiRouter.use('/course', courseRouter)

export default mainApiRouter;