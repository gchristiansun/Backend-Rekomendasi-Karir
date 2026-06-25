import multer from "multer";
import path from "path";
import fs from "fs";
import { HttpError } from "../utils/httpError";

// Folder penyimpanan file (tahap dummy = local disk).
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "certificates");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

// Sesuai PDF: sertifikat PDF/JPG (tambah PNG, umum dipakai).
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "Format file harus PDF, JPG, atau PNG"));
  },
});