import { Request, Response } from "express";
import * as companyService from "./company.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { getCompanyMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { COMPANY_STATUS, NOTIFICATION_TYPE } from "../../constants";
import prisma from "../../config/prisma";
import { supabase, SUPABASE_LOGO_BUCKET, SUPABASE_COMPANY_BUCKET } from "../../config/supabase";
import { randomUUID } from "crypto";
import { sendMail } from "../../config/mailer";
import { VerifyCompanyInput, RejectCompanyInput } from "./company.validation";

// GET /companies (admin) - daftar + filter status (mis. ?status=pending untuk verifikasi)
export const listCompaniesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const { total, companies } = await companyService.listCompanies({
    status: req.query.status ? String(req.query.status) : undefined,
    search: req.query.search ? String(req.query.search) : undefined,
    skip,
    take: limit,
  });
  return sendSuccess(res, companies, "Daftar perusahaan", 200, buildMeta(page, limit, total));
});

// GET /companies/me (company / company_staff) - profil + statistik
export const myCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const company = await companyService.getCompanyById(member.companyId);
  const stats = await companyService.getCompanyStats(member.companyId);
  return sendSuccess(res, { ...company, stats }, "Profil perusahaan");
});

// PATCH /companies/me
export const updateMyCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const company = await companyService.updateCompany(member.companyId, req.body);
  return sendSuccess(res, company, "Profil perusahaan diperbarui");
});

export const getCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.getCompanyById(String(req.params.id));
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  return sendSuccess(res, company, "Detail perusahaan");
});

// GET /companies/:id/review (Superadmin) - data lengkap untuk halaman verifikasi
export const companyReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.getCompanyForReview(String(req.params.id));
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  return sendSuccess(res, company, "Detail perusahaan untuk verifikasi");
});

// PATCH /companies/me/logo (multipart/form-data, field: logo)
export const uploadLogoHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);

  const file = req.file;
  if (!file) throw new HttpError(400, "Berkas logo wajib diunggah");

  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "png";
  const objectPath = `${member.companyId}/${Date.now()}-${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(SUPABASE_LOGO_BUCKET)
    .upload(objectPath, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new HttpError(500, `Gagal mengunggah logo: ${error.message}`);

  const { data } = supabase.storage.from(SUPABASE_LOGO_BUCKET).getPublicUrl(objectPath);
  const company = await companyService.updateCompanyLogo(member.companyId, data.publicUrl);

  return sendSuccess(res, { logoUrl: company.logoUrl }, "Logo perusahaan diperbarui");
});

const mailShell = (title: string, body: string) => `
  <div style="font-family:Arial,sans-serif;max-width:520px">
    <h2 style="color:#0f5ce0">${title}</h2>
    ${body}
    <p style="color:#888;font-size:12px;margin-top:24px">
      Email ini dikirim otomatis oleh Sistem Rekomendasi Karir.
    </p>
  </div>`;

// PATCH /companies/:id/verify (Superadmin)
export const verifyCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body as VerifyCompanyInput;

  const { company, contacts } = await companyService.verifyCompanyWithMessage(
    String(req.params.id),
    message,
  );

  const catatan = message ? `<p><b>Catatan dari Admin:</b><br>${message}</p>` : "";

  // Email dikirim terpisah per penerima agar alamat tidak saling terlihat.
  for (const c of contacts) {
    await sendMail(
      c.email,
      `Perusahaan ${company.name} Telah Diverifikasi`,
      mailShell(
        "Verifikasi Berhasil",
        `<p>Halo ${c.name ?? ""},</p>
         <p>Perusahaan <b>${company.name}</b> telah <b>diverifikasi</b>.
            Seluruh fitur rekrutmen kini terbuka: memasang lowongan, melihat pelamar,
            dan mengundang kandidat.</p>
         ${catatan}`,
      ),
    );
  }

  return sendSuccess(res, company, "Perusahaan diverifikasi dan pemberitahuan telah dikirim");
});

// PATCH /companies/:id/reject (Superadmin)
export const rejectCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as RejectCompanyInput;

  const { company, contacts } = await companyService.rejectCompany(String(req.params.id), reason);

  const linkPerbaikan = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/company/ubah-profil-perusahaan`;

  for (const c of contacts) {
    await sendMail(
      c.email,
      `Pendaftaran ${company.name} Perlu Diperbaiki`,
      mailShell(
        "Pendaftaran Belum Dapat Disetujui",
        `<p>Halo ${c.name ?? ""},</p>
         <p>Pendaftaran perusahaan <b>${company.name}</b> belum dapat kami setujui.</p>
         <p><b>Alasan:</b><br>${reason}</p>
         <p>Anda dapat memperbaiki data dan mengunggah ulang dokumen melalui tombol di bawah.
            Setelah dokumen baru diunggah, pendaftaran otomatis diajukan kembali untuk ditinjau.</p>
         <p style="margin:24px 0">
           <a href="${linkPerbaikan}"
              style="background:#0f5ce0;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
              Perbaiki Data Perusahaan
           </a>
         </p>
         <p>Atau salin tautan ini ke browser:<br><a href="${linkPerbaikan}">${linkPerbaikan}</a></p>`,
      ),
    );
  }

  return sendSuccess(res, company, "Pendaftaran ditolak dan pemberitahuan telah dikirim");
});

// PATCH /companies/:id (Superadmin) - edit profil perusahaan dari halaman verifikasi
export const updateCompanyByAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.updateCompanyByAdmin(String(req.params.id), req.body);
  return sendSuccess(res, company, "Profil perusahaan diperbarui oleh admin");
});

// PATCH /companies/:id/reevaluate (Superadmin) - cabut status, kembali ke antrean pending
export const reevaluateCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.reevaluateCompany(String(req.params.id));
  return sendSuccess(res, company, "Status perusahaan dikembalikan ke pending untuk evaluasi ulang");
});

// PATCH /companies/me/documents (multipart: izinUsaha, suratResmi)
export const updateCompanyDocsHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);

  const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
  const izinUsaha = files?.izinUsaha?.[0];
  const suratResmi = files?.suratResmi?.[0];
  if (!izinUsaha && !suratResmi) {
    throw new HttpError(400, "Tidak ada dokumen yang diunggah");
  }

  const uploadDoc = async (file: Express.Multer.File, label: string) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "bin";
    const objectPath = `${label}/${Date.now()}-${randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(SUPABASE_COMPANY_BUCKET)
      .upload(objectPath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new HttpError(500, `Gagal mengunggah ${label}: ${error.message}`);
    const { data } = supabase.storage.from(SUPABASE_COMPANY_BUCKET).getPublicUrl(objectPath);
    return data.publicUrl;
  };

  const company = await companyService.updateCompanyDocuments(member.companyId, {
    izinUsahaUrl: izinUsaha ? await uploadDoc(izinUsaha, "izin-usaha") : undefined,
    suratResmiUrl: suratResmi ? await uploadDoc(suratResmi, "surat-resmi") : undefined,
  });

  return sendSuccess(
    res,
    company,
    company.status === "pending"
      ? "Dokumen diperbarui dan pendaftaran diajukan kembali untuk ditinjau"
      : "Dokumen perusahaan diperbarui",
  );
});