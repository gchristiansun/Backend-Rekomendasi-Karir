import prisma from "../../config/prisma";
import { hashPassword } from "../../utils/password";
import { RegisterUserInput } from "./auth.validation";
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
    data: { refresh_token: refreshToken },
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