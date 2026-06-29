import { Request, Response } from "express";
import * as companyService from "./company.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { getCompanyMembership } from "../../utils/context";
import { HttpError } from "../../utils/httpError";
import { COMPANY_STATUS, NOTIFICATION_TYPE } from "../../constants";
import prisma from "../../config/prisma";

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

// PATCH /companies/:id/verify (admin)
export const verifyCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.getCompanyById(String(req.params.id));
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");

  const updated = await companyService.setVerification(String(req.params.id), COMPANY_STATUS.VERIFIED);

  // notifikasi ke seluruh anggota perusahaan
  await Promise.all(
    company.members.map((m: any) =>
      prisma.notification.create({
        data: {
          userId: m.user.id,
          title: "Perusahaan terverifikasi",
          message: `Perusahaan ${company.name} telah diverifikasi. Anda kini dapat memposting lowongan.`,
          type: NOTIFICATION_TYPE.SYSTEM,
        },
      }),
    ),
  );
  return sendSuccess(res, updated, "Perusahaan diverifikasi");
});

// PATCH /companies/:id/reject (admin)
export const rejectCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.getCompanyById(String(req.params.id));
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  const updated = await companyService.setVerification(String(req.params.id), COMPANY_STATUS.REJECTED);
  return sendSuccess(res, updated, "Perusahaan ditolak");
});