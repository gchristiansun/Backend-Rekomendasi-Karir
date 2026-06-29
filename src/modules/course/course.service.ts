import prisma from "../../config/prisma";
import { CreateCourseInput, UpdateCourseInput } from "./course.validation";
import { findOrCreateByNames } from "../skill/skill.service";

// Bentuk response matkul yang rapi (skills jadi array {id,name}).
const shape = (c: any) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  sks: c.sks,
  semester: c.semester,
  rps: c.rps,
  university: c.university,
  skills: c.skills.map((cs: any) => cs.skill),
  cloCount: c._count?.clos ?? undefined,
});

export const listCourses = async (universityId?: string) => {
  const courses = await prisma.course.findMany({
    where: universityId ? { universityId } : undefined,
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
      _count: { select: { clos: true } },
    },
    orderBy: [{ semester: "asc" }, { name: "asc" }],
  });
  return courses.map(shape);
};

export const getCourseById = async (id: string) => {
  const c = await prisma.course.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
      _count: { select: { clos: true } },
    },
  });
  return c ? shape(c) : null;
};

// CLO milik sebuah matkul (tanpa embedding -> embedding besar, tidak perlu di response biasa).
export const getCourseCLOs = async (courseId: string) => {
  return prisma.cLO.findMany({
    where: { courseId },
    select: { id: true, code: true, text: true, paraphrase: true },
    orderBy: { code: "asc" },
  });
};

export const createCourse = async (universityId: string | null, data: CreateCourseInput) => {
  const skills = await findOrCreateByNames(data.skills ?? []);
  const c = await prisma.course.create({
    data: {
      code: data.code,
      name: data.name,
      sks: data.sks,
      semester: data.semester,
      rps: data.rps,
      universityId: universityId ?? data.universityId ?? null,
      skills: { create: skills.map((s) => ({ skillId: s.id })) },
    },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
    },
  });
  return shape(c);
};

export const updateCourse = async (id: string, data: UpdateCourseInput) => {
  let skillOps: any = undefined;
  if (data.skills) {
    const skills = await findOrCreateByNames(data.skills);
    skillOps = { deleteMany: {}, create: skills.map((s) => ({ skillId: s.id })) };
  }
  const c = await prisma.course.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      sks: data.sks,
      semester: data.semester,
      rps: data.rps,
      ...(skillOps ? { skills: skillOps } : {}),
    },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
    },
  });
  return shape(c);
};

export const deleteCourse = (id: string) => prisma.course.delete({ where: { id } });