import prisma from "../../config/prisma";
import { hashPassword } from "../../utils/password";
import { HttpError } from "../../utils/httpError";
import {
  ROLES,
  USER_STATUS,
  UNIVERSITY_POSITION,
} from "../../constants";
import { CreateUniversityInput, UpdateUniversityInput } from "./university.validation";

// Anggota dengan posisi admin_kampus dianggap "Admin Utama" universitas.
const adminMemberInclude = {
  members: {
    where: { position: UNIVERSITY_POSITION.ADMIN_KAMPUS },
    include: {
      user: {
        select: {
          id: true, name: true, email: true, phone: true,
          status: true, lastLoginAt: true,
        },
      },
    },
    orderBy: { created_at: "asc" as const },
    take: 1,
  },
  _count: { select: { students: true, members: true } },
};

// Bentuk respons yang gampang dipakai frontend (admin utama dipipihkan).
const toUniversityRow = (u: any) => {
  const admin = u.members?.[0]?.user ?? null;
  return {
    id: u.id,
    name: u.name,
    code: u.code,
    city: u.city,
    address: u.address,
    website: u.website,
    created_at: u.created_at,
    totalStudents: u._count?.students ?? 0,
    totalMembers: u._count?.members ?? 0,
    admin, // { id, name, email, phone, status, lastLoginAt } | null
  };
};

export const listUniversities = async (opts: {
  search?: string;
  skip: number;
  take: number;
}) => {
  const where: any = {};
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { city: { contains: opts.search, mode: "insensitive" } },
      {
        members: {
          some: {
            position: UNIVERSITY_POSITION.ADMIN_KAMPUS,
            user: { name: { contains: opts.search, mode: "insensitive" } },
          },
        },
      },
    ];
  }

  const [total, universities] = await Promise.all([
    prisma.university.count({ where }),
    prisma.university.findMany({
      where,
      include: adminMemberInclude,
      orderBy: { created_at: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
  ]);
  return { total, universities: universities.map(toUniversityRow) };
};

export const getUniversityById = async (id: string) => {
  const uni = await prisma.university.findUnique({
    where: { id },
    include: adminMemberInclude,
  });
  return uni ? toUniversityRow(uni) : null;
};

// Kode unik dari akronim nama ("Universitas Lampung" -> "UL", "UL-2", ...).
const generateUniqueCode = async (name: string) => {
  const base =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 8) || "UNIV";

  let code = base;
  for (let i = 2; ; i++) {
    const exists = await prisma.university.findUnique({ where: { code } });
    if (!exists) return code;
    code = `${base}-${i}`;
  }
};

// Buat universitas + akun Admin Kampus dalam satu transaksi.
export const createUniversityWithAdmin = async (input: CreateUniversityInput) => {
  const emailUsed = await prisma.user.findUnique({ where: { email: input.admin.email } });
  if (emailUsed) throw new HttpError(409, "Email admin sudah terdaftar");

  const code = input.code ?? (await generateUniqueCode(input.name));
  const hashed = await hashPassword(input.admin.password);

  return prisma.$transaction(async (tx) => {
    const university = await tx.university.create({
      data: {
        name: input.name,
        code,
        city: input.city,
        address: input.address,
        website: input.website,
      },
    });

    const adminUser = await tx.user.create({
      data: {
        name: input.admin.name,
        email: input.admin.email,
        phone: input.admin.phone,
        password: hashed,
        role: ROLES.UNIVERSITY,
        status: USER_STATUS.ACTIVE,
        universityMember: {
          create: {
            universityId: university.id,
            position: UNIVERSITY_POSITION.ADMIN_KAMPUS,
            nip: input.admin.nip,
          },
        },
      },
      select: { id: true, name: true, email: true, status: true },
    });

    return { ...university, admin: adminUser };
  });
};

export const updateUniversity = async (id: string, input: UpdateUniversityInput) => {
  const uni = await prisma.university.findUnique({
    where: { id },
    include: adminMemberInclude,
  });
  if (!uni) throw new HttpError(404, "Universitas tidak ditemukan");

  const data: any = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.city !== undefined) data.city = input.city;
  if (input.address !== undefined) data.address = input.address;
  if (input.website !== undefined) data.website = input.website;

  const adminUser = (uni as any).members?.[0]?.user;
  await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx.university.update({ where: { id }, data });
    }
    // perubahan nama/status admin utama ikut disimpan bila dikirim
    if (adminUser && (input.adminName !== undefined || input.adminStatus !== undefined)) {
      await tx.user.update({
        where: { id: adminUser.id },
        data: {
          ...(input.adminName !== undefined ? { name: input.adminName } : {}),
          ...(input.adminStatus !== undefined ? { status: input.adminStatus } : {}),
        },
      });
    }
  });

  return getUniversityById(id);
};

// Hapus universitas + seluruh akun anggotanya (admin kampus & kaprodi).
// Mahasiswa TIDAK dihapus: relasi universityId mereka menjadi null (SetNull).
export const deleteUniversity = async (id: string) => {
  const uni = await prisma.university.findUnique({
    where: { id },
    include: { members: { select: { userId: true } } },
  });
  if (!uni) throw new HttpError(404, "Universitas tidak ditemukan");

  const memberUserIds = uni.members.map((m) => m.userId);
  await prisma.$transaction(async (tx) => {
    if (memberUserIds.length > 0) {
      await tx.user.deleteMany({ where: { id: { in: memberUserIds } } });
    }
    await tx.university.delete({ where: { id } });
  });

  return { id, deletedMembers: memberUserIds.length };
};
