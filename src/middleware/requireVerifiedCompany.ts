import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/httpError";
import { ROLES, COMPANY_STATUS } from "../constants";

/**
 * Menggembok fitur perusahaan sampai diverifikasi Superadmin.
 * Role non-perusahaan dilewatkan, supaya middleware ini aman dipasang
 * di route yang dipakai bersama role lain.
 */
export const requireVerifiedCompany = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const role = req.user?.role;
    if (role !== ROLES.COMPANY && role !== ROLES.COMPANY_STAFF) return next();

    const member = await prisma.companyMember.findFirst({
      where: { userId: req.user!.id },
      include: { company: { select: { status: true } } },
    });
    if (!member) throw new HttpError(403, "Anda tidak terhubung dengan perusahaan mana pun");

    const status = member.company.status;

    // Perusahaan yang sudah diverifikasi berhak memakai fitur ini.
    if (status === COMPANY_STATUS.VERIFIED) return next();

    if (status === COMPANY_STATUS.REJECTED) {
      throw new HttpError(
        403,
        "Pendaftaran perusahaan Anda ditolak. Perbaiki data dan dokumen di halaman Ubah Profil Perusahaan, lalu ajukan verifikasi ulang.",
      );
    }

    // Sisanya (pending, atau status tak dikenal) diperlakukan sebagai belum terverifikasi.
    throw new HttpError(
      403,
      "Akun perusahaan Anda belum diverifikasi. Anda dapat memasang lowongan setelah Superadmin menyetujui dokumen pendaftaran.",
    );
  } catch (err) {
    next(err);
  }
};