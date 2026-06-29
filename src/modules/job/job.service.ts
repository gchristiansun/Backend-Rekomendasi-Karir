import prisma from "../../config/prisma";
import { CreateJobInput, UpdateJobInput } from "./job.validation";
import { findOrCreateByNames } from "../skill/skill.service";
import { JOB_STATUS } from "../../constants";

const jobInclude = {
  company: { select: { id: true, name: true, industry: true, logoUrl: true } },
  skills: { include: { skill: { select: { id: true, name: true } } } },
};

const shapeJob = (job: any) => ({
  id: job.id,
  title: job.title,
  description: job.description,
  location: job.location,
  type: job.type,
  status: job.status,
  salaryMin: job.salaryMin,
  salaryMax: job.salaryMax,
  createdAt: job.created_at,
  company: job.company,
  skills: job.skills.map((js: any) => js.skill),
});

export const listJobs = async (opts: {
  search?: string; type?: string; location?: string;
  status?: string; companyId?: string; skip: number; take: number;
}) => {
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.companyId) where.companyId = opts.companyId;
  if (opts.type) where.type = opts.type;
  if (opts.location) where.location = { contains: opts.location, mode: "insensitive" };
  if (opts.search) {
    where.OR = [
      { title: { contains: opts.search, mode: "insensitive" } },
      { description: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({ where, include: jobInclude, orderBy: { created_at: "desc" }, skip: opts.skip, take: opts.take }),
  ]);
  return { total, jobs: jobs.map(shapeJob) };
};

export const getJobById = async (id: string) => {
  const job = await prisma.job.findUnique({ where: { id }, include: jobInclude });
  return job ? shapeJob(job) : null;
};

export const createJob = async (companyId: string, postedById: string, data: CreateJobInput) => {
  const skills = await findOrCreateByNames(data.skills);
  const job = await prisma.job.create({
    data: {
      companyId, postedById,
      title: data.title, description: data.description, location: data.location,
      type: data.type, status: data.status, salaryMin: data.salaryMin, salaryMax: data.salaryMax,
      skills: { create: skills.map((s) => ({ skillId: s.id })) },
    },
    include: jobInclude,
  });
  return shapeJob(job);
};

export const updateJob = async (id: string, data: UpdateJobInput) => {
  let skillOps: any = undefined;
  if (data.skills) {
    const skills = await findOrCreateByNames(data.skills);
    skillOps = { deleteMany: {}, create: skills.map((s) => ({ skillId: s.id })) };
  }
  const job = await prisma.job.update({
    where: { id },
    data: {
      title: data.title, description: data.description, location: data.location,
      type: data.type, status: data.status, salaryMin: data.salaryMin, salaryMax: data.salaryMax,
      ...(skillOps ? { skills: skillOps } : {}),
    },
    include: jobInclude,
  });
  return shapeJob(job);
};

export const closeJob = async (id: string) => {
  const job = await prisma.job.update({ where: { id }, data: { status: JOB_STATUS.CLOSED }, include: jobInclude });
  return shapeJob(job);
};

export const deleteJob = (id: string) => prisma.job.delete({ where: { id } });

// Untuk ownership check: ambil pemilik (companyId) lowongan.
export const getJobOwner = (id: string) =>
  prisma.job.findUnique({ where: { id }, select: { id: true, companyId: true } });