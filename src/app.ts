import express, { Application, Request, Response, NextFunction, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mainApiRouter from "./routes";
import { HttpError } from "./utils/httpError";
import { errorHandler } from "./middleware/errorHandler";
import { setupSwagger } from "./config/swagger";
import path from "path";

const app: Application = express();

// Di belakang ngrok / proxy Vercel, alamat asli klien dan skema https ada di
// header X-Forwarded-*. Tanpa ini req.protocol selalu terbaca "http".
app.set("trust proxy", 1);

// ----------------------------------------------------------------------------
// CORS
// FRONTEND_URL boleh berisi beberapa alamat dipisah koma, misalnya alamat
// Vercel produksi sekaligus localhost saat pengembangan:
//   FRONTEND_URL=http://localhost:5173,https://namaapp.vercel.app
// Karena credentials:true, header Access-Control-Allow-Origin WAJIB berisi satu
// origin persis (tidak boleh "*"), jadi origin pemanggil dipantulkan kembali.
// ----------------------------------------------------------------------------
const bersihkanOrigin = (nilai: string) => nilai.trim().replace(/\/+$/, "");

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(bersihkanOrigin)
  .filter(Boolean);

// Setiap push ke Vercel membuat URL pratinjau dengan subdomain baru. Diaktifkan
// lewat ALLOW_VERCEL_PREVIEW=true agar tidak terbuka begitu saja di produksi.
const izinkanPreviewVercel = process.env.ALLOW_VERCEL_PREVIEW === "true";
const polaVercel = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Permintaan tanpa Origin (curl, Postman, health check) tidak diblokir.
    if (!origin) return callback(null, true);

    const asal = bersihkanOrigin(origin);
    if (allowedOrigins.includes(asal)) return callback(null, true);
    if (izinkanPreviewVercel && polaVercel.test(asal)) return callback(null, true);

    // Ditolak tanpa melempar galat: browser yang akan memblokir responsnya,
    // sementara catatan ini memudahkan menelusuri origin yang belum terdaftar.
    console.warn(`[cors] origin ditolak: ${origin} (terdaftar: ${allowedOrigins.join(", ")})`);
    return callback(null, false);
  },
};

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
//upload file static
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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