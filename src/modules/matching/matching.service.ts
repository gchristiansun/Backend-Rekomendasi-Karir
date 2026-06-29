import prisma from "../../config/prisma";
import { computeMatch, RequiredSkill } from "../../utils/matching";
import { JOB_STATUS } from "../../constants";

// Ubah skill lowongan (dari DB) -> format RequiredSkill yang dimengerti computeMatch.
const toRequired = (
  job: { skills: { skillId: string; weight: number; skill: { name: string } }[] },
): RequiredSkill[] =>
  job.skills.map((s) => ({ skillId: s.skillId, name: s.skill.name, weight: s.weight }));

// Rekomendasi lowongan untuk seorang mahasiswa, terurut match score desc.
export const matchJobsForStudent = async (studentId: string, opts: { search?: string }) => {
  // 1. skill yang dimiliki mahasiswa
  const ownedRows = await prisma.studentSkill.findMany({
    where: { studentId },
    select: { skillId: true },
  });
  const owned = ownedRows.map((r) => r.skillId);

  // 2. semua lowongan aktif + skill-nya
  const jobs = await prisma.job.findMany({
    where: {
      status: JOB_STATUS.ACTIVE,
      ...(opts.search
        ? { OR: [{ title: { contains: opts.search, mode: "insensitive" } }, { description: { contains: opts.search, mode: "insensitive" } }] }
        : {}),
    },
    include: {
      company: { select: { id: true, name: true, logoUrl: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
    },
  });

  // 3. hitung match tiap lowongan, lalu urutkan
  const results = jobs.map((job) => {
    const match = computeMatch(owned, toRequired(job));
    return {
      id: job.id,
      title: job.title,
      location: job.location,
      type: job.type,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      createdAt: job.created_at,
      company: job.company,
      requiredSkills: job.skills.map((s) => s.skill),
      matchScore: match.score,
      matchedSkills: match.matchedSkills,
      gapSkills: match.missingSkills, // skill gap yang perlu di-highlight
    };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
};

// Detail kecocokan satu lowongan untuk satu mahasiswa.
export const matchJobDetail = async (studentId: string, jobId: string) => {
  const ownedRows = await prisma.studentSkill.findMany({
    where: { studentId },
    select: { skillId: true },
  });
  const owned = ownedRows.map((r) => r.skillId);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: { select: { id: true, name: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
    },
  });
  if (!job) return null;

  const match = computeMatch(owned, toRequired(job));
  return {
    job: {
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      requiredSkills: job.skills.map((s) => s.skill),
    },
    matchScore: match.score,
    matchedSkills: match.matchedSkills,
    gapSkills: match.missingSkills,
    totalRequired: match.totalRequired,
    totalMatched: match.totalMatched,
  };
};

// Kandidat mahasiswa untuk satu lowongan, terurut match score (untuk HRD).
export const matchCandidatesForJob = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
  });
  if (!job) return null;
  const required = toRequired(job);

  // semua mahasiswa + skill mereka
  const students = await prisma.student.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      skills: { select: { skillId: true } },
    },
  });

  const ranked = students
    .map((s) => {
      const owned = s.skills.map((sk) => sk.skillId);
      const match = computeMatch(owned, required);
      return {
        studentId: s.id,
        name: s.user.name,
        email: s.user.email,
        nim: s.nim,
        major: s.major,
        gpa: s.gpa,
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        gapSkills: match.missingSkills,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    job: { id: job.id, title: job.title, requiredSkills: job.skills.map((s) => s.skill) },
    candidates: ranked,
  };
};