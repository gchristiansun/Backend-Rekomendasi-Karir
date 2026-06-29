import prisma from "../../config/prisma";
import { CreateSubjectInput, UpdateSubjectInput } from "./subject.validation";
import { findOrCreateByNames } from "../skill/skill.service";

const shape = (s: any) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  sks: s.sks,
  semester: s.semester,
  rps: s.rps,
  university: s.university,
  skills: s.skills.map((ss: any) => ss.skill),
  cloCount: s._count?.clos ?? undefined,
});

export const listSubjects = async (universityId?: string) => {
  const subjects = await prisma.subject.findMany({
    where: universityId ? { universityId } : undefined,
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
      _count: { select: { clos: true } },
    },
    orderBy: [{ semester: "asc" }, { name: "asc" }],
  });
  return subjects.map(shape);
};

export const getSubjectById = async (id: string) => {
  const s = await prisma.subject.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
      _count: { select: { clos: true } },
    },
  });
  return s ? shape(s) : null;
};

export const getSubjectCLOs = async (subjectId: string) => {
  return prisma.cLO.findMany({
    where: { subjectId },
    select: { id: true, code: true, text: true, paraphrase: true },
    orderBy: { code: "asc" },
  });
};

export const createSubject = async (universityId: string | null, data: CreateSubjectInput) => {
  const skills = await findOrCreateByNames(data.skills ?? []);
  const s = await prisma.subject.create({
    data: {
      code: data.code,
      name: data.name,
      sks: data.sks,
      semester: data.semester,
      rps: data.rps,
      universityId: universityId ?? data.universityId ?? null,
      skills: { create: skills.map((sk) => ({ skillId: sk.id })) },
    },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      university: { select: { id: true, name: true } },
    },
  });
  return shape(s);
};

export const updateSubject = async (id: string, data: UpdateSubjectInput) => {
  let skillOps: any = undefined;
  if (data.skills) {
    const skills = await findOrCreateByNames(data.skills);
    skillOps = { deleteMany: {}, create: skills.map((sk) => ({ skillId: sk.id })) };
  }
  const s = await prisma.subject.update({
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
  return shape(s);
};

export const deleteSubject = (id: string) => prisma.subject.delete({ where: { id } });