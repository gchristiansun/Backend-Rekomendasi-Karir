import prisma from "../../config/prisma";
import { computeMatch } from "../../utils/matching";
import { JOB_STATUS } from "../../constants";

// Ambil skillId yang dimiliki mahasiswa.
const getOwnedSkillIds = async (studentId: string): Promise<Set<string>> => {
  const rows = await prisma.studentSkill.findMany({
    where: { studentId },
    select: { skillId: true },
  });
  return new Set(rows.map((r: any) => r.skillId));
};

// Cari OnlineCourse yang mengajarkan skill-skill tertentu, urut berdasarkan
// berapa banyak skill gap yang ditutupinya.
const findCoursesForSkills = async (gapSkillIds: string[]) => {
  if (gapSkillIds.length === 0) return [];

  const courses = await prisma.onlineCourse.findMany({
    where: { skills: { some: { skillId: { in: gapSkillIds } } } },
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
  });

  const gapSet = new Set(gapSkillIds);
  return courses
    .map((c: any) => {
      // skill kursus yang termasuk gap mahasiswa
      const covers = c.skills
        .map((cs: any) => cs.skill)
        .filter((s: any) => gapSet.has(s.id));
      return {
        id: c.id,
        title: c.title,
        provider: c.provider,
        url: c.url,
        level: c.level,
        coversSkills: covers, // skill gap yang ditutup kursus ini
        coverCount: covers.length,
      };
    })
    .filter((c: any) => c.coverCount > 0)
    .sort((a: any, b: any) => b.coverCount - a.coverCount);
};

// ============================================================
// Rekomendasi kursus untuk menutup SEMUA skill gap mahasiswa
// (dikumpulkan dari seluruh lowongan aktif).
// ============================================================
export const recommendCoursesOverall = async (studentId: string) => {
  const owned = await getOwnedSkillIds(studentId);

  // kumpulkan semua skill yang diminta lowongan aktif
  const jobs = await prisma.job.findMany({
    where: { status: JOB_STATUS.ACTIVE },
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
  });

  // skill gap = skill diminta lowongan yang belum dimiliki
  const gapMap = new Map<string, { id: string; name: string }>();
  for (const job of jobs) {
    for (const js of job.skills) {
      if (!owned.has(js.skill.id)) {
        gapMap.set(js.skill.id, { id: js.skill.id, name: js.skill.name });
      }
    }
  }
  const gapSkills = Array.from(gapMap.values());
  const courses = await findCoursesForSkills(gapSkills.map((s) => s.id));

  return {
    totalGapSkills: gapSkills.length,
    gapSkills,
    recommendedCourses: courses,
  };
};

// ============================================================
// Rekomendasi kursus untuk menutup gap pada SATU lowongan.
// ============================================================
export const recommendCoursesForJob = async (studentId: string, jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
  });
  if (!job) return null;

  const ownedArr = Array.from(await getOwnedSkillIds(studentId));
  const required = job.skills.map((js: any) => ({
    skillId: js.skillId,
    name: js.skill.name,
    weight: js.weight,
  }));

  const match = computeMatch(ownedArr, required);
  const courses = await findCoursesForSkills(match.missingSkills.map((s) => s.id));

  return {
    job: { id: job.id, title: job.title },
    matchScore: match.score,
    gapSkills: match.missingSkills,
    recommendedCourses: courses,
  };
};