import multer from "multer";
// import path from "path";
// import fs from "fs";
import { HttpError } from "../utils/httpError";

// Folder penyimpanan file (tahap dummy = local disk).*
// const UPLOAD_DIR = path.join(process.cwd(), "uploads", "certificates");
// fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
//   filename: (_req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     const base = path
//       .basename(file.originalname, ext)
//       .replace(/[^a-zA-Z0-9-_]/g, "_")
//       .slice(0, 40);
//     cb(null, `${Date.now()}-${base}${ext}`);
//   },
// });

// Simpan file di MEMORI (buffer), bukan disk.
// File akan diteruskan ke Supabase Storage oleh controller.
const storage = multer.memoryStorage();

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

// Uploader khusus file CSV (untuk import mahasiswa massal).
const CSV_ALLOWED = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/csv",
  "text/plain",
];

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const isCsvExt = file.originalname.toLowerCase().endsWith(".csv");
    if (CSV_ALLOWED.includes(file.mimetype) || isCsvExt) cb(null, true);
    else cb(new HttpError(400, "File harus berformat CSV"));
  },
});

// Uploader dokumen perusahaan: izinUsaha (wajib, PDF) + suratResmi (opsional).
const COMPANY_DOC_ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

export const uploadCompanyDocs = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB (sesuai hint frontend)
  fileFilter: (_req, file, cb) => {
    // Izin Usaha wajib PDF (sesuai form: "Hanya format PDF")
    if (file.fieldname === "izinUsaha") {
      if (file.mimetype === "application/pdf") cb(null, true);
      else cb(new HttpError(400, "Izin Usaha harus berformat PDF"));
      return;
    }
    // Surat resmi: PDF/JPG/PNG
    if (COMPANY_DOC_ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "Format dokumen harus PDF, JPG, atau PNG"));
  },
});


// Uploader logo perusahaan (gambar, maksimal 2 MB).
const LOGO_ALLOWED = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export const uploadLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (LOGO_ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "Logo harus berformat PNG, JPG, SVG, atau WEBP"));
  },
});