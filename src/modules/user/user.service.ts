import prisma from "../../config/prisma";
import { hashPassword } from "../../utils/password";
import { CreateUniversityAdminInput } from "./user.validation";
import {
  ROLES,
  USER_STATUS,
  UNIVERSITY_POSITION,
} from "../../constants";
import { HttpError } from "../../utils/httpError";

// Buat akun Admin Kampus (role university) + hubungkan ke universitas.
export const createUniversityAdmin = async (input: CreateUniversityAdminInput) => {
  const hashed = await hashPassword(input.password);

  // tentukan universitas: pakai yang ada, atau buat baru
  let universityId = input.universityId;
  if (!universityId) {
    const uni = await prisma.university.create({
      data: { name: input.universityName!, code: input.universityCode! },
    });
    universityId = uni.id;
  } else {
    const exists = await prisma.university.findUnique({ where: { id: universityId } });
    if (!exists) throw new HttpError(404, "Universitas tidak ditemukan");
  }

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashed,
      role: ROLES.UNIVERSITY,
      status: USER_STATUS.ACTIVE,
      universityMember: {
        create: {
          position: UNIVERSITY_POSITION.ADMIN_KAMPUS,
          universityId,
        },
      },
    },
    include: { universityMember: { include: { university: true } } },
  });
};

// Daftar semua user (log master data) + filter role/status/search + pagination.
export const listUsers = async (opts: {
  role?: string;
  status?: string;
  search?: string;
  skip: number;
  take: number;
}) => {
  const where: any = {};
  if (opts.role) where.role = opts.role;
  if (opts.status) where.status = opts.status;
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { email: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, created_at: true, updated_at: true,
      },
      orderBy: { created_at: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
  ]);
  return { total, users };
};

export const getUserById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, status: true, created_at: true,
    },
  });

// Ubah status akun (suspend / activate / soft-delete).
export const setUserStatus = async (id: string, status: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, "User tidak ditemukan");
  if (user.role === ROLES.ADMIN) {
    throw new HttpError(403, "Akun Admin Utama tidak dapat diubah statusnya");
  }
  return prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};