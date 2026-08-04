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
    if (status === COMPANY_STATUS.VERIFIED) return next();

    if (status === COMPANY_STATUS.PENDING) {
      throw new HttpError(
        403,
        "Perusahaan Anda sedang menunggu verifikasi Superadmin. Fitur ini akan terbuka setelah akun diverifikasi.",
      );
    }
    throw new HttpError(403, "Perusahaan Anda tidak memiliki akses ke fitur ini.");
  } catch (err) {
    next(err);
  }
};