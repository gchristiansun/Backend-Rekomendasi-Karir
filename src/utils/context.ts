import prisma from "../config/prisma";
import { HttpError } from "./httpError";

// Ambil profil Student dari userId (untuk endpoint mahasiswa).
export const getStudentByUserId = async (userId: string) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new HttpError(404, "Profil mahasiswa tidak ditemukan");
  return student;
};

// Ambil keanggotaan perusahaan (companyId + posisi) dari userId.
export const getCompanyMembership = async (userId: string) => {
  const member = await prisma.companyMember.findUnique({
    where: { userId },
    include: { company: true },
  });
  if (!member) throw new HttpError(404, "Akun ini tidak terhubung ke perusahaan");
  return member;
};

// Ambil keanggotaan universitas (universityId + posisi) dari userId.
export const getUniversityMembership = async (userId: string) => {
  const member = await prisma.universityMember.findUnique({
    where: { userId },
    include: { university: true },
  });
  if (!member) throw new HttpError(404, "Akun ini tidak terhubung ke universitas");
  return member;
};