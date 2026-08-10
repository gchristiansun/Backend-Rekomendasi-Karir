import prisma from "../../config/prisma";
import { CreateJobInput, UpdateJobInput } from "./job.validation";
import { findOrCreateByNames } from "../skill/skill.service";
import { JOB_STATUS } from "../../constants";
import { embedTexts } from "../../config/aiService";

const jobInclude = {
  company: { select: { id: true, name: true, industry: true, logoUrl: true } },
  skills: { include: { skill: { select: { id: true, name: true } } } },
  requirements: { orderBy: { order: "asc" as const } },
};

// CSV "a,b,c" -> ["a","b","c"]
const splitSkills = (csv: string): string[] =>
  String(csv ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const shapeJob = (job: any) => ({
  id: job.id,
  title: job.title,
  department: job.department,
  description: job.description,
  location: job.location,
  type: job.type,
  status: job.status,
  salaryMin: job.salaryMin,
  salaryMax: job.salaryMax,
  postingDate: job.postingDate,
  deadline: job.deadline,
  createdAt: job.created_at,
  company: job.company,
  skills: job.skills.map((js: any) => js.skill),
  requirements: (job.requirements ?? []).map((r: any) => ({
    id: r.id,
    requirement: r.requirement,
    skills: splitSkills(r.skills),
  })),
});

// Frekuensi skill dari seluruh requirements -> weight JobSkill.
// Skill yang muncul di 2 tanggung jawab = weight 2 (lebih penting).
const collectSkillFreq = (
  requirements: { requirement: string; skills: string[] }[],
) => {
  const freq = new Map<string, number>();
  for (const r of requirements) {
    for (const raw of r.skills) {
      const name = raw.trim();
      if (!name) continue;
      freq.set(name, (freq.get(name) ?? 0) + 1);
    }
  }
  return freq;
};

// Isi embedding tiap requirement lewat AI service. Dijalankan setelah lowongan
// tersimpan agar id requirement sudah ada. Kegagalan tidak membatalkan
// pembuatan lowongan - embedding bisa diisi belakangan lewat skrip backfill.
const fillRequirementEmbeddings = async (requirements: any[]) => {
  // Tidak ada requirement, tidak perlu memanggil AI service.
  if (!requirements || requirements.length === 0) return;
  // Ambil embedding dari AI service. Jika gagal, log saja.
  const vectors = await embedTexts(requirements.map((r: any) => r.requirement));
  if (!vectors || vectors.length !== requirements.length) return;
  // Simpan embedding ke database.
  await Promise.all(
    requirements.map((r: any, i: number) =>
      prisma.jobRequirement.update({
        where: { id: r.id },
        data: { embedding: JSON.stringify(vectors[i]) },
      }),
    ),
  );
};

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
      { department: { contains: opts.search, mode: "insensitive" } },
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
  const freq = collectSkillFreq(data.requirements);
  const uniqueNames = Array.from(freq.keys());
  const skills = await findOrCreateByNames(uniqueNames);

  const job = await prisma.job.create({
    data: {
      companyId,
      postedById,
      title: data.title,
      department: data.department,
      description: data.description,
      location: data.location,
      type: data.type,
      status: data.status,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      postingDate: data.postingDate ? new Date(data.postingDate) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      requirements: {
        create: data.requirements.map((r, i) => ({
          requirement: r.requirement,
          skills: r.skills.map((s) => s.trim()).filter(Boolean).join(","), // CSV
          order: i,
        })),
      },
      skills: {
        create: skills.map((s) => ({ skillId: s.id, weight: freq.get(s.name) ?? 1 })),
      },
    },
    include: jobInclude,
  });
  await fillRequirementEmbeddings(job.requirements);
  return shapeJob(job);
};

export const updateJob = async (id: string, data: UpdateJobInput) => {
  let requirementOps: any = undefined;
  let skillOps: any = undefined;

  if (data.requirements) {
    const freq = collectSkillFreq(data.requirements);
    const uniqueNames = Array.from(freq.keys());
    const skills = await findOrCreateByNames(uniqueNames);

    requirementOps = {
      deleteMany: {},
      create: data.requirements.map((r, i) => ({
        requirement: r.requirement,
        skills: r.skills.map((s) => s.trim()).filter(Boolean).join(","),
        order: i,
      })),
    };
    skillOps = {
      deleteMany: {},
      create: skills.map((s) => ({ skillId: s.id, weight: freq.get(s.name) ?? 1 })),
    };
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      title: data.title,
      department: data.department,
      description: data.description,
      location: data.location,
      type: data.type,
      status: data.status,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      ...(requirementOps ? { requirements: requirementOps } : {}),
      ...(skillOps ? { skills: skillOps } : {}),
      ...(data.postingDate !== undefined
        ? { postingDate: data.postingDate ? new Date(data.postingDate) : null }
        : {}),
      ...(data.deadline !== undefined
        ? { deadline: data.deadline ? new Date(data.deadline) : null }
        : {}),
    },
    include: jobInclude,
  });
  if (data.requirements) await fillRequirementEmbeddings(job.requirements);
  return shapeJob(job);
};

export const closeJob = async (id: string) => {
  const job = await prisma.job.update({ where: { id }, data: { status: JOB_STATUS.CLOSED }, include: jobInclude });
  return shapeJob(job);
};

export const deleteJob = (id: string) => prisma.job.delete({ where: { id } });

export const getJobOwner = (id: string) =>
  prisma.job.findUnique({ where: { id }, select: { id: true, companyId: true } });