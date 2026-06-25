import prisma from "../../config/prisma";
import { CreateSkillInput, UpdateSkillInput } from "./skill.validation";

export const listSkills = async (search?: string) => {
  return prisma.skill.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
  });
};

export const createSkill = (data: CreateSkillInput) =>
  prisma.skill.create({ data });

export const updateSkill = (id: string, data: UpdateSkillInput) =>
  prisma.skill.update({ where: { id }, data });

export const deleteSkill = (id: string) =>
  prisma.skill.delete({ where: { id } });

// Cari/buat skill berdasarkan nama (dipakai saat input job/cert pakai nama bebas).
export const findOrCreateByNames = async (names: string[]) => {
  const clean = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const result = [];
  for (const name of clean) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    result.push(skill);
  }
  return result;
};