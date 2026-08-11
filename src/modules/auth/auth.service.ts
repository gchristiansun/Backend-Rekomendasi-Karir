import prisma from "../../config/prisma";
import { hashPassword } from "../../utils/password";
import { RegisterUserInput } from "./auth.validation";
import crypto from "crypto";
import {
  ROLES,
  USER_STATUS,
  COMPANY_STATUS,
  COMPANY_POSITION,
} from "../../constants";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

// Registrasi mahasiswa: buat User + profil Student kosong.
export const createStudent = async (input: RegisterUserInput) => {
  const hashed = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashed,
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
      student: {
        create: { nim: input.nim },
      },
    },
    include: { student: true },
  });
};

// Registrasi perusahaan: buat User(role=company) + Company(pending) + membership(direktur).
export const createCompanyAccount = async (input: RegisterUserInput) => {
  const hashed = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashed,
      role: ROLES.COMPANY,
      status: USER_STATUS.ACTIVE,
      companyMember: {
        create: {
          position: COMPANY_POSITION.DIREKTUR,
          company: {
            create: {
              name: input.companyName!,
              status: COMPANY_STATUS.PENDING,
            },
          },
        },
      },
    },
    include: { companyMember: { include: { company: true } } },
  });
};

export const saveRefreshToken = async (userId: string, refreshToken: string) => {
  return prisma.user.update({
    where: { id: userId },
    // login sukses -> catat juga waktu login terakhir (dipakai halaman Super Admin)
    data: { refresh_token: refreshToken, lastLoginAt: new Date() },
  });
};

// Cek NIB sudah terpakai atau belum.
export const findCompanyByNib = (nib: string) =>
  prisma.company.findUnique({ where: { nib } });

// Registrasi perusahaan LENGKAP (form 4 tahap frontend):
// User(direktur) + Company(pending) + semua detail + dokumen.
export const createCompanyAccountFull = async (input: {
  name: string;
  email: string;
  password: string;
  companyName: string;
  industry?: string;
  size?: string;
  website?: string;
  address?: string;
  description?: string;
  nib: string;
  izinUsahaUrl: string;
  suratResmiUrl?: string;
}) => {
  const hashed = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: ROLES.COMPANY,
      status: USER_STATUS.ACTIVE,
      companyMember: {
        create: {
          position: COMPANY_POSITION.DIREKTUR,
          company: {
            create: {
              name: input.companyName,
              industry: input.industry,
              size: input.size,
              website: input.website,
              address: input.address,
              description: input.description,
              nib: input.nib,
              izinUsahaUrl: input.izinUsahaUrl,
              suratResmiUrl: input.suratResmiUrl,
              status: COMPANY_STATUS.PENDING, // menunggu verifikasi Superadmin
            },
          },
        },
      },
    },
    include: { companyMember: { include: { company: true } } },
  });
};

export const clearRefreshToken = async (token: string) => {
  const user = await prisma.user.findFirst({ where: { refresh_token: token } });
  if (!user) return null;
  return prisma.user.update({
    where: { id: user.id },
    data: { refresh_token: null },
  });
};

export const findUserByToken = async (token: string) => {
  return prisma.user.findFirst({ where: { refresh_token: token } });
};

// Profil lengkap untuk endpoint /me (termasuk konteks role).
export const getMe = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      created_at: true,
      recoveryEmail: true,
      recoveryEmailVerifiedAt: true,
      student: {
        select: {
          id: true, nim: true, major: true, semester: true, gpa: true,
          university: { select: { id: true, name: true } },
        },
      },
      companyMember: {
        select: {
          position: true,
          company: { select: { id: true, name: true, status: true } },
        },
      },
      universityMember: {
        select: {
          position: true,
          university: { select: { id: true, name: true } },
        },
      },
    },
  });
};

// Ambil user (termasuk password) untuk verifikasi ganti password.
export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

// Update password (sudah di-hash di controller).
export const updatePassword = (userId: string, hashedPassword: string) =>
  prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // ============================================================
// LUPA KATA SANDI
// ============================================================
const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Buat token reset untuk user. Mengembalikan token MENTAH (untuk link email).
export const createPasswordResetToken = async (userId: string) => {
  // hapus token lama user ini (satu token aktif saja)
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const rawToken = crypto.randomBytes(32).toString("hex"); // 64 karakter acak
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // berlaku 1 jam
    },
  });
  return rawToken;
};

// Verifikasi token: ada, belum dipakai, belum kedaluwarsa.
export const verifyPasswordResetToken = async (rawToken: string) => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
};

// Reset password: update password + tandai token terpakai + logout sesi lama.
export const resetPasswordWithToken = async (rawToken: string, hashedNewPassword: string) => {
  const record = await verifyPasswordResetToken(rawToken);
  if (!record) return null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashedNewPassword,
        refresh_token: null, // logout semua sesi lama demi keamanan
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return record.userId;
};

// ============================================================
// EMAIL PEMULIHAN (recovery email)
// ============================================================

// Simpan email pemulihan (belum terverifikasi) + buat token verifikasi.
// Mengembalikan token MENTAH untuk link email.
export const createRecoveryEmailToken = async (userId: string, email: string) => {
  // satu proses verifikasi aktif saja per user
  await prisma.recoveryEmailToken.deleteMany({ where: { userId } });

  // catat sebagai "pending" di User (verifiedAt di-null-kan)
  await prisma.user.update({
    where: { id: userId },
    data: { recoveryEmail: email, recoveryEmailVerifiedAt: null },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  await prisma.recoveryEmailToken.create({
    data: {
      userId,
      email,
      tokenHash: crypto.createHash("sha256").update(rawToken).digest("hex"),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // berlaku 24 jam
    },
  });
  return rawToken;
};

// Verifikasi token -> sahkan email pemulihan.
export const confirmRecoveryEmail = async (rawToken: string) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await prisma.recoveryEmailToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      // pakai email DARI TOKEN (bukan dari kolom User) -> anti race condition
      data: { recoveryEmail: record.email, recoveryEmailVerifiedAt: new Date() },
    }),
    prisma.recoveryEmailToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return record.userId;
};

// Perbarui profil akun sendiri (nama, telepon, email).
export const updateOwnProfile = (
  userId: string,
  data: { name?: string; phone?: string; email?: string },
) =>
  prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, status: true },
  });