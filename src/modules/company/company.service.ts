import prisma from "../../config/prisma";
import { UpdateCompanyInput } from "./company.validation";
import { COMPANY_STATUS } from "../../constants";
import { HttpError } from "../../utils/httpError";
import { supabase, SUPABASE_COMPANY_BUCKET } from "../../config/supabase";

export const listCompanies = async (opts: {
  status?: string;
  search?: string;
  skip: number;
  take: number;
}) => {
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.search) where.name = { contains: opts.search, mode: "insensitive" };

  const [total, companies] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      include: { _count: { select: { jobs: true, members: true } } },
      orderBy: { created_at: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
  ]);
  return { total, companies };
};

export const getCompanyById = (id: string) =>
  prisma.company.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      _count: { select: { jobs: true } },
    },
  });

export const updateCompany = async (companyId: string, data: any) => {
  const current = await prisma.company.findUnique({
    where: { id: companyId },
    select: { status: true },
  });
  if (!current) throw new HttpError(404, "Perusahaan tidak ditemukan");

  const payload: any = { ...data };

  // NIB adalah identitas legal yang sudah ditinjau Superadmin.
  // Setelah terverifikasi, perubahan NIB diabaikan (bukan ditolak,
  // supaya form yang mengirim seluruh field tetap bisa menyimpan data lain).
  if (current.status === COMPANY_STATUS.VERIFIED) {
    delete payload.nib;
  }

  return prisma.company.update({ where: { id: companyId }, data: payload });
};

export const setVerification = (
  id: string,
  status: (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS],
) =>
  prisma.company.update({
    where: { id },
    data: {
      status,
      verifiedAt: status === COMPANY_STATUS.VERIFIED ? new Date() : null,
    },
  });

// Statistik ringkas untuk dashboard Direktur.
export const getCompanyStats = async (companyId: string) => {
  const [activeJobs, totalJobs, applications] = await Promise.all([
    prisma.job.count({ where: { companyId, status: "active" } }),
    prisma.job.count({ where: { companyId } }),
    prisma.application.count({ where: { job: { companyId } } }),
  ]);
  return { activeJobs, totalJobs, totalApplicants: applications };
};

// Simpan URL logo hasil unggahan.
export const updateCompanyLogo = (companyId: string, logoUrl: string) =>
  prisma.company.update({
    where: { id: companyId },
    data: { logoUrl },
    select: { id: true, logoUrl: true },
  });

// Data lengkap untuk halaman verifikasi Superadmin (termasuk dokumen legal).
export const getCompanyForReview = (companyId: string) =>
  prisma.company.findUnique({
    where: { id: companyId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, role: true } },
        },
      },
    },
  });

// Kumpulkan email seluruh anggota perusahaan (untuk pemberitahuan).
const collectMemberContacts = (company: any) =>
  (company.members ?? [])
    .map((m: any) => ({ email: m.user?.email, name: m.user?.name, userId: m.userId }))
    .filter((c: any) => !!c.email);

// ============================================================
// VERIFIKASI (disetujui)
// ============================================================
export const verifyCompanyWithMessage = async (companyId: string, message?: string) => {
  const company = await getCompanyForReview(companyId);
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  if (company.status === COMPANY_STATUS.VERIFIED)
    throw new HttpError(400, "Perusahaan ini sudah terverifikasi");

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { status: COMPANY_STATUS.VERIFIED, verifiedAt: new Date() },
  });

  return { company: updated, contacts: collectMemberContacts(company) };
};

// ============================================================
// PENOLAKAN (akun dihapus permanen)
// ============================================================

// URL publik Supabase -> path objek, agar berkasnya bisa dihapus.
const objectPathFromPublicUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const marker = `/object/public/${SUPABASE_COMPANY_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
};

export const rejectAndDeleteCompany = async (companyId: string, reason: string) => {
  const company = await getCompanyForReview(companyId);
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");

  // Pengaman: perusahaan terverifikasi tidak boleh dihapus lewat jalur ini,
  // karena sudah punya lowongan, pelamar, dan undangan yang ikut terhapus.
  if (company.status !== COMPANY_STATUS.PENDING) {
    throw new HttpError(
      400,
      "Hanya perusahaan berstatus pending yang dapat ditolak. Gunakan penonaktifan akun untuk perusahaan terverifikasi.",
    );
  }

  const contacts = collectMemberContacts(company);
  const userIds = (company.members ?? []).map((m: any) => m.userId);
  const snapshot = { id: company.id, name: company.name, nib: company.nib };

  // Hapus dokumen di Supabase (best-effort; kegagalan tidak membatalkan penolakan).
  const paths = [
    objectPathFromPublicUrl((company as any).izinUsahaUrl),
    objectPathFromPublicUrl((company as any).suratResmiUrl),
  ].filter(Boolean) as string[];
  if (paths.length > 0) {
    const { error } = await supabase.storage.from(SUPABASE_COMPANY_BUCKET).remove(paths);
    if (error) console.warn("[reject] gagal hapus dokumen Supabase:", error.message);
  }

  // Hapus perusahaan (cascade: CompanyMember, Job, dst) lalu akun penggunanya.
  await prisma.$transaction(async (tx: any) => {
    await tx.company.delete({ where: { id: companyId } });
    if (userIds.length > 0) {
      await tx.user.deleteMany({ where: { id: { in: userIds } } });
    }
  });

  return { company: snapshot, contacts };
};