import express, { Application, Request, Response, NextFunction, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mainApiRouter from "./routes";
import { HttpError } from "./utils/httpError";
import { errorHandler } from "./middleware/errorHandler";
import { setupSwagger } from "./config/swagger";

const app: Application = express();

// CORS configuration for credentials
const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
};

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: "up",
        message: "server is healthy"
    })
});

setupSwagger(app);
app.use('/api', mainApiRouter);
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new HttpError(404, "endpoint not found"));
});

app.use(errorHandler);

export default app;