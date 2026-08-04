import { Request, Response } from "express";
import * as companyService from "./company.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { getCompanyMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { COMPANY_STATUS, NOTIFICATION_TYPE } from "../../constants";
import prisma from "../../config/prisma";
import { supabase, SUPABASE_LOGO_BUCKET } from "../../config/supabase";
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

// PATCH /companies/:id/reject (Superadmin) - akun dihapus permanen
export const rejectCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as RejectCompanyInput;

  const { company, contacts } = await companyService.rejectAndDeleteCompany(
    String(req.params.id),
    reason,
  );

  // Email WAJIB dikirim setelah data diambil, karena akunnya sudah dihapus.
  for (const c of contacts) {
    await sendMail(
      c.email,
      `Pendaftaran ${company.name} Ditolak`,
      mailShell(
        "Pendaftaran Ditolak",
        `<p>Halo ${c.name ?? ""},</p>
         <p>Pendaftaran perusahaan <b>${company.name}</b> tidak dapat kami setujui.</p>
         <p><b>Alasan penolakan:</b><br>${reason}</p>
         <p>Akun beserta dokumen yang diunggah telah dihapus dari sistem.
            Anda dapat mendaftar ulang setelah memperbaiki hal-hal di atas.</p>`,
      ),
    );
  }

  return sendSuccess(res, company, "Pendaftaran ditolak, akun dihapus, dan pemberitahuan telah dikirim");
});