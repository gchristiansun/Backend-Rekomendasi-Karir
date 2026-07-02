import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import skillRouter from "../modules/skill/skill.routes";
import studentRouter from "../modules/student/student.routes";
import companyRouter from "../modules/company/company.routes";
import jobRouter from "../modules/job/job.routes";
import matchingRouter from "../modules/matching/matching.routes";
import applicationRouter from "../modules/application/application.routes";
import subjectRouter from "../modules/subject/subject.routes";
import notificationRouter from "../modules/notification/notification.routes";
import certificateRouter from "../modules/certificate/certificate.routes";
import userRouter from "../modules/user/user.routes";
import importRouter from "../modules/import/import.routes";
import gradeRouter from "../modules/grade/grade.routes";
import analyticsRouter from "../modules/analytics/analytics.routes";

const mainApiRouter = Router();

mainApiRouter.use("/auth", authRouter);
mainApiRouter.use("/skills", skillRouter);
mainApiRouter.use("/students", studentRouter);
mainApiRouter.use("/companies", companyRouter);
mainApiRouter.use("/jobs", jobRouter);
mainApiRouter.use("/matching", matchingRouter);
mainApiRouter.use("/applications", applicationRouter);
mainApiRouter.use("/subjects", subjectRouter);
mainApiRouter.use("/notifications", notificationRouter);
mainApiRouter.use("/certificates", certificateRouter);
mainApiRouter.use("/users", userRouter);
mainApiRouter.use("/import", importRouter);
mainApiRouter.use("/grades", gradeRouter);
mainApiRouter.use("/analytics", analyticsRouter);

export default mainApiRouter;