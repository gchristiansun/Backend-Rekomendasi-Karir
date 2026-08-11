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
      include: {
        _count: { select: { jobs: true, members: true } },
        // kontak pendaftar (ditampilkan di tabel verifikasi Super Admin)
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { created_at: "asc" },
          take: 1,
        },
      },
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
    // jejak penolakan sebelumnya dibersihkan agar tidak tertinggal di profil
    data: {
      status: COMPANY_STATUS.VERIFIED,
      verifiedAt: new Date(),
      rejectionReason: null,
      rejectedAt: null,
    } as any,
  });

  return { company: updated, contacts: collectMemberContacts(company) };
};

// Penolakan tidak menghapus akun: perusahaan tetap dapat masuk, memperbaiki
// dokumen di halaman profil, lalu mengajukan verifikasi ulang.
export const rejectCompany = async (companyId: string, reason: string) => {
  const company = await getCompanyForReview(companyId);
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  if (company.status === COMPANY_STATUS.VERIFIED) {
    throw new HttpError(
      400,
      "Perusahaan yang sudah terverifikasi tidak dapat ditolak. Gunakan penonaktifan akun bila diperlukan.",
    );
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      status: COMPANY_STATUS.REJECTED,
      rejectionReason: reason,
      rejectedAt: new Date(),
    } as any,
  });

  return { company: updated, contacts: collectMemberContacts(company) };
};

// ============================================================
// EDIT OLEH SUPER ADMIN
// Berbeda dengan updateCompany (self-service): admin boleh mengubah
// seluruh field, termasuk NIB, tanpa terkunci status verifikasi.
// ============================================================
export const updateCompanyByAdmin = async (companyId: string, data: any) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  return prisma.company.update({ where: { id: companyId }, data });
};

// Kembalikan perusahaan (terverifikasi/ditolak) ke antrean verifikasi.
export const reevaluateCompany = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  if (company.status === COMPANY_STATUS.PENDING) {
    throw new HttpError(400, "Perusahaan ini sudah berstatus pending");
  }

  return prisma.company.update({
    where: { id: companyId },
    data: {
      status: COMPANY_STATUS.PENDING,
      verifiedAt: null,
      rejectionReason: null,
      rejectedAt: null,
    },
  });
};

// Perbarui dokumen legal dan ajukan verifikasi ulang.
// Dokumen terkunci setelah perusahaan terverifikasi, sama seperti NIB.
export const updateCompanyDocuments = async (
  companyId: string,
  urls: { izinUsahaUrl?: string; suratResmiUrl?: string },
) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new HttpError(404, "Perusahaan tidak ditemukan");
  if (company.status === COMPANY_STATUS.VERIFIED) {
    throw new HttpError(400, "Dokumen tidak dapat diubah karena perusahaan sudah terverifikasi.");
  }

  const data: any = {};
  if (urls.izinUsahaUrl) data.izinUsahaUrl = urls.izinUsahaUrl;
  if (urls.suratResmiUrl) data.suratResmiUrl = urls.suratResmiUrl;

  // Mengunggah dokumen baru setelah ditolak dianggap sebagai pengajuan ulang.
  if (company.status === COMPANY_STATUS.REJECTED) {
    data.status = COMPANY_STATUS.PENDING;
    data.rejectionReason = null;
    data.rejectedAt = null;
  }

  return prisma.company.update({ where: { id: companyId }, data });
};


