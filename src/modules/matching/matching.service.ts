import prisma from "../../config/prisma";
import { computeMatch, RequiredSkill } from "../../utils/matching";
import { JOB_STATUS, APPLICATION_STATUS, USER_STATUS } from "../../constants";
import {
  getCloVectorsBySubject,
  collectStudentCloVectors,
  computeSemanticMatch,
  rescaleSimilarity,
  isPassedGrade,
  parseVector,
  gradeWeight, 
  gradeLabel,
  type CloVector,
} from "../../utils/semanticMatching";

// Ubah skill lowongan (dari DB) -> format RequiredSkill yang dimengerti computeMatch.
const toRequired = (
  job: { skills: { skillId: string; weight: number; skill: { name: string } }[] },
): RequiredSkill[] =>
  job.skills.map((s: any) => ({ skillId: s.skillId, name: s.skill.name, weight: s.weight }));

// Ambil vektor persyaratan sebuah lowongan; kosong bila embedding belum diisi.
const toRequirementVectors = (job: any): { requirement: string; vec: number[] }[] =>
  (job?.requirements ?? [])
    .map((r: any) => ({ requirement: r.requirement, vec: parseVector(r.embedding) }))
    .filter((r: any) => !!r.vec) as { requirement: string; vec: number[] }[];

// Kumpulkan CLO mahasiswa dari daftar matkul yang diambil.
const studentClosOf = async (subjectsTaken: any[]): Promise<CloVector[]> => {
  const bySubject = await getCloVectorsBySubject();
  return collectStudentCloVectors(subjectsTaken, bySubject);
};

// ============================================================
// Rekomendasi lowongan untuk mahasiswa, terurut match score desc.
// Skor semantik dipakai bila embedding tersedia di kedua sisi;
// bila tidak, jatuh ke skor berbasis keahlian sebagai cadangan.
// ============================================================
export const matchJobsForStudent = async (studentId: string, opts: { search?: string }) => {
  const [ownedRows, subjectsTaken] = await Promise.all([
    prisma.studentSkill.findMany({ where: { studentId }, select: { skillId: true } }),
    prisma.subjectTaken.findMany({
      where: { studentId },
      select: { subjectId: true, score: true, grade: true },
    }),
  ]);
  const owned = ownedRows.map((r: any) => r.skillId);
  const studentClos = await studentClosOf(subjectsTaken);

  const jobs = await prisma.job.findMany({
    where: {
      status: JOB_STATUS.ACTIVE,
      ...(opts.search
        ? {
            OR: [
              { title: { contains: opts.search, mode: "insensitive" } },
              { description: { contains: opts.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      company: { select: { id: true, name: true, logoUrl: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
      requirements: { orderBy: { order: "asc" } },
    },
  });

  // sinyal perilaku: lamaran (untuk deprioritas) + favorit (untuk ikon hati di UI)
  const [applications, favorites] = await Promise.all([
    prisma.application.findMany({
      where: { studentId },
      select: { jobId: true, status: true, hiddenFromRecommendation: true },
    }),
    prisma.jobFavorite.findMany({ where: { studentId }, select: { jobId: true } }),
  ]);
  const appMap = new Map(applications.map((a: any) => [a.jobId, a]));
  const favSet = new Set(favorites.map((f: any) => f.jobId));

  const results = jobs.map((job: any) => {
    const ruleMatch = computeMatch(owned, toRequired(job));

    const reqVecs = toRequirementVectors(job);
    const semantic =
      reqVecs.length > 0 && studentClos.length > 0
        ? computeSemanticMatch(studentClos, reqVecs)
        : null;

    const app: any = appMap.get(job.id);
    const decided =
      !!app &&
      (app.status === APPLICATION_STATUS.ACCEPTED || app.status === APPLICATION_STATUS.REJECTED);

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      createdAt: job.created_at,
      company: job.company,
      requiredSkills: job.skills.map((s: any) => s.skill),
      matchScore: semantic ? semantic.score : ruleMatch.score,
      matchScoreRule: ruleMatch.score,          // baseline pembanding
      matchMethod: semantic ? "semantic" : "skill",
      coveredRequirements: semantic?.covered ?? null,
      totalRequirements: semantic?.totalRequirements ?? null,
      matchedSkills: ruleMatch.matchedSkills,
      gapSkills: ruleMatch.missingSkills,
      // sinyal perilaku
      isFavorite: favSet.has(job.id),
      hasApplied: !!app,
      applicationStatus: app?.status ?? null,
      deprioritized: !!(app?.hiddenFromRecommendation || decided),
    };
  });

  // lamaran yang sudah diterima/ditolak ditaruh paling bawah,
  // sisanya urut match score tertinggi.
  results.sort((a: any, b: any) => {
    if (a.deprioritized !== b.deprioritized) return a.deprioritized ? 1 : -1;
    return b.matchScore - a.matchScore;
  });

  return results;
};

// ============================================================
// Detail kecocokan satu lowongan untuk satu mahasiswa.
// ============================================================
export const matchJobDetail = async (studentId: string, jobId: string) => {
  const [ownedRows, subjectsTaken] = await Promise.all([
    prisma.studentSkill.findMany({ where: { studentId }, select: { skillId: true } }),
    prisma.subjectTaken.findMany({
      where: { studentId },
      select: { subjectId: true, score: true, grade: true },
    }),
  ]);
  const owned = ownedRows.map((r: any) => r.skillId);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: { select: { id: true, name: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
      requirements: { orderBy: { order: "asc" } },
    },
  });
  if (!job) return null;

  const ruleMatch = computeMatch(owned, toRequired(job));

  const studentClos = await studentClosOf(subjectsTaken);
  const reqVecs = toRequirementVectors(job);
  const semantic =
    reqVecs.length > 0 && studentClos.length > 0
      ? computeSemanticMatch(studentClos, reqVecs)
      : null;

  return {
    job: {
      id: job.id,
      title: job.title,
      department: (job as any).department,
      description: job.description,
      company: job.company,
      requiredSkills: job.skills.map((s: any) => s.skill),
      requirements: ((job as any).requirements ?? []).map((r: any) => ({
        id: r.id,
        requirement: r.requirement,
        skills: String(r.skills ?? "")
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),
      })),
    },
    matchScore: semantic ? semantic.score : ruleMatch.score,
    matchScoreRule: ruleMatch.score,
    matchMethod: semantic ? "semantic" : "skill",
    // rincian per persyaratan: berguna untuk menjelaskan skor ke mahasiswa
    requirementBreakdown: semantic?.perRequirement ?? [],
    coveredRequirements: semantic?.covered ?? null,
    matchedSkills: ruleMatch.matchedSkills,
    gapSkills: ruleMatch.missingSkills,
    totalRequired: ruleMatch.totalRequired,
    totalMatched: ruleMatch.totalMatched,
  };
};

// ============================================================
// Kandidat mahasiswa untuk satu lowongan, terurut match score (untuk HRD).
// ============================================================
export const matchCandidatesForJob = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      requirements: { orderBy: { order: "asc" } },
    },
  });
  if (!job) return null;

  const required = toRequired(job);
  const reqVecs = toRequirementVectors(job);
  const bySubject = await getCloVectorsBySubject();

  const students = await prisma.student.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      skills: { select: { skillId: true } },
      subjectsTaken: { select: { subjectId: true, score: true, grade: true } },
    },
  });

  const ranked = students
    .map((s: any) => {
      const owned = s.skills.map((sk: any) => sk.skillId);
      const ruleMatch = computeMatch(owned, required);

      const studentClos = collectStudentCloVectors(s.subjectsTaken, bySubject);
      const semantic =
        reqVecs.length > 0 && studentClos.length > 0
          ? computeSemanticMatch(studentClos, reqVecs)
          : null;

      return {
        studentId: s.id,
        name: s.user.name,
        email: s.user.email,
        nim: s.nim,
        major: s.major,
        gpa: s.gpa,
        matchScore: semantic ? semantic.score : ruleMatch.score,
        matchScoreRule: ruleMatch.score,
        matchMethod: semantic ? "semantic" : "skill",
        matchedSkills: ruleMatch.matchedSkills,
        gapSkills: ruleMatch.missingSkills,
      };
    })
    .sort((a: any, b: any) => b.matchScore - a.matchScore);

  return {
    job: { id: job.id, title: job.title, requiredSkills: job.skills.map((s: any) => s.skill) },
    candidates: ranked,
  };
};

// Prioritas status: yang paling menentukan menang bila mahasiswa melamar >1 lowongan.
const STATUS_RANK: Record<string, number> = {
  [APPLICATION_STATUS.ACCEPTED]: 4,
  [APPLICATION_STATUS.REJECTED]: 3,
  [APPLICATION_STATUS.PROCESSING]: 2,
  [APPLICATION_STATUS.SUBMITTED]: 1,
};

// ============================================================
// Talent pool: semua mahasiswa yang cocok dengan lowongan aktif perusahaan.
// Satu mahasiswa muncul sekali, memakai skor tertingginya di antara
// seluruh lowongan (lowongan itu dicatat sebagai roleMatch).
// ============================================================
export const listCompanyCandidates = async (
  companyId: string,
  opts: { jobId?: string; limit?: number },
) => {
  const jobs = await prisma.job.findMany({
    where: {
      companyId,
      status: JOB_STATUS.ACTIVE,
      ...(opts.jobId ? { id: opts.jobId } : {}),
    },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      requirements: { orderBy: { order: "asc" } },
    },
  });

  const jobOptions = jobs.map((j: any) => ({ id: j.id, title: j.title }));
  if (jobs.length === 0) return { candidates: [], jobs: jobOptions };

  // mahasiswa aktif saja (yang suspended/dihapus tidak ditampilkan)
  const students = await prisma.student.findMany({
    where: { user: { status: USER_STATUS.ACTIVE } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      university: { select: { id: true, name: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
      subjectsTaken: { select: { subjectId: true, score: true, grade: true } },
    },
  });

  // status lamaran mahasiswa ke perusahaan ini (untuk tab Diterima/Ditolak)
  const applications = await prisma.application.findMany({
    where: { job: { companyId } },
    select: { studentId: true, status: true },
  });
  const statusMap = new Map<string, string>();
  for (const app of applications as any[]) {
    const prev = statusMap.get(app.studentId);
    if (!prev || (STATUS_RANK[app.status] ?? 0) > (STATUS_RANK[prev] ?? 0)) {
      statusMap.set(app.studentId, app.status);
    }
  }

  // Status undangan terakhir per mahasiswa (untuk perusahaan ini).
  const invitations = await prisma.jobInvitation.findMany({
    where: { job: { companyId } },
    select: { studentId: true, status: true },
    orderBy: { created_at: "desc" },
  });
  const invitationMap = new Map<string, string>();
  for (const inv of invitations as any[]) {
    // yang pertama ditemui = paling baru, karena diurutkan desc
    if (!invitationMap.has(inv.studentId)) invitationMap.set(inv.studentId, inv.status);
  }

  // Vektor persyaratan per lowongan (untuk pencocokan semantik).
  const bySubject = await getCloVectorsBySubject();
  const reqVecByJob = new Map<string, { requirement: string; vec: number[] }[]>();
  for (const job of jobs as any[]) {
    const vecs = toRequirementVectors(job);
    if (vecs.length > 0) reqVecByJob.set(job.id, vecs);
  }

  // Lowongan yang siap dinilai secara semantik (punya embedding persyaratan).
  const jobsWithVec = (jobs as any[]).filter((j) => reqVecByJob.has(j.id));

  const candidates = students
    .map((student: any) => {
      const owned = student.skills.map((s: any) => s.skillId);
      const studentClos = collectStudentCloVectors(student.subjectsTaken, bySubject);
      // Bandingkan hanya antar lowongan dengan metode penilaian yang sama.
      // Skor semantik dan skor berbasis keahlian tidak setara skalanya, sehingga
      // mencampurnya membuat lowongan bersemantik selalu menang.
      const pool = studentClos.length > 0 && jobsWithVec.length > 0 ? jobsWithVec : (jobs as any[]);

      let best: any = null;
      for (const job of pool) {
        const required = job.skills.map((js: any) => ({
          skillId: js.skillId,
          name: js.skill.name,
          weight: js.weight,
        }));
        const ruleMatch = computeMatch(owned, required);

        const reqVecs = reqVecByJob.get(job.id);
        const semantic =
          reqVecs && studentClos.length > 0 ? computeSemanticMatch(studentClos, reqVecs) : null;

        const finalScore = semantic ? semantic.score : ruleMatch.score;

        if (!best || finalScore > best.finalScore) {
          best = { job, match: ruleMatch, required, semantic, finalScore };
        }
      }
      if (!best) return null;

      return {
        studentId: student.id,
        name: student.user?.name ?? "Tanpa Nama",
        email: student.user?.email ?? null,
        nim: student.nim,
        major: student.major,
        semester: student.semester,
        university: student.university?.name ?? null,
        matchScore: best.finalScore,
        matchScoreRule: best.match.score,          // baseline untuk pembanding TA
        matchMethod: best.semantic ? "semantic" : "skill",
        coveredRequirements: best.semantic?.covered ?? null,
        totalRequirements: best.semantic?.totalRequirements ?? null,
        roleMatch: best.job.title,
        bestJobId: best.job.id,
        matchedSkills: best.match.matchedSkills,
        gapSkills: best.match.missingSkills,
        applicationStatus: statusMap.get(student.id) ?? null,
        invitationStatus: invitationMap.get(student.id) ?? null,
      };
    })
    // seluruh mahasiswa aktif ditampilkan, termasuk yang skornya 0
    .filter((c: any) => !!c)
    .sort((a: any, b: any) => b.matchScore - a.matchScore)
    .slice(0, opts.limit ?? 100);

  return { candidates, jobs: jobOptions };
};


// ============================================================
// Detail kandidat: profil + analisis kompetensi per lowongan.
// Susunan: lowongan -> tanggung jawab -> CLO yang menutupinya.
//
// kontribusi CLO       = kemiripan semantik (diskalakan) x bobot nilai matkul
// skor tanggung jawab  = kontribusi tertinggi di antara CLO-nya
// skor lowongan        = rata-rata skor seluruh tanggung jawab
// ============================================================
const CLO_PER_REQUIREMENT = 3; // jumlah CLO teratas yang ditampilkan per tanggung jawab

export const getCandidateDetail = async (
  companyId: string,
  studentId: string,
  opts: { jobId?: string },
) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      university: { select: { id: true, name: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
      certificates: {
        select: { id: true, title: true, issuer: true, status: true, fileUrl: true },
      },
      subjectsTaken: {
        select: { subjectId: true, score: true, grade: true, semester: true },
      },
    },
  });
  if (!student) return null;

  const jobs = await prisma.job.findMany({
    where: {
      companyId,
      ...(opts.jobId ? { id: opts.jobId } : { status: JOB_STATUS.ACTIVE }),
    },
    include: {
      skills: { include: { skill: { select: { id: true, name: true } } } },
      requirements: { orderBy: { order: "asc" } },
    },
  });

  const owned = student.skills.map((s: any) => s.skillId);

  // Vektor CLO mahasiswa (hanya dari matkul yang lulus), lengkap dengan
  // bobot nilai dan nama mata kuliahnya.
  const bySubject = await getCloVectorsBySubject();
  const cloVecs = collectStudentCloVectors(student.subjectsTaken, bySubject);

  const subjectIds = Array.from(new Set(cloVecs.map((c) => c.subjectId)));
  const subjects = subjectIds.length
    ? await prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true, code: true },
      })
    : [];
  const subjectById = new Map(subjects.map((s: any) => [s.id, s]));

  // Susun analisis per lowongan
  const kompetensiGroups = (jobs as any[]).map((job) => {
    const reqs = (job.requirements ?? []).map((r: any) => {
      const reqVec = parseVector(r.embedding);

      const cloItems = reqVec
        ? cloVecs
            .map((clo) => {
              let sim = 0;
              for (let i = 0; i < clo.vec.length; i++) sim += clo.vec[i] * reqVec[i];
              const skorKemiripan = Math.round(rescaleSimilarity(sim) * 100);
              const bobot = clo.weight ?? 1;
              return {
                id: clo.cloId,
                kode: clo.code,
                deskripsi: clo.text || "Parafrase CLO belum tersedia.",
                matkul: subjectById.get(clo.subjectId)?.name ?? "-",
                nilai: clo.gradeLabel ?? "-",
                skorKemiripan,
                bobotNilai: bobot,
                kontribusi: Math.round(skorKemiripan * bobot),
              };
            })
            .sort((a, b) => b.kontribusi - a.kontribusi)
            .slice(0, CLO_PER_REQUIREMENT)
        : [];

      return {
        id: r.id,
        deskripsi: r.requirement,
        // tanggung jawab dianggap tertutup sebaik CLO terbaiknya
        matchScore: cloItems.length > 0 ? cloItems[0].kontribusi : 0,
        cloItems,
      };
    });

    const matchScore =
      reqs.length > 0
        ? Math.round(reqs.reduce((a: number, r: any) => a + r.matchScore, 0) / reqs.length)
        : 0;

    return {
      id: job.id,
      kategori: job.title,
      matchScore,
      tanggungJawabList: reqs,
    };
  });

// Lowongan diurutkan dari kecocokan tertinggi ke terendah, sehingga yang
  // paling relevan tampil paling atas sekaligus menjadi roleMatch kandidat.
  kompetensiGroups.sort((a, b) => b.matchScore - a.matchScore);
  const best = kompetensiGroups[0] ?? null;
  
  const bestJob = best ? (jobs as any[]).find((j) => j.id === best.id) : null;

  const ruleMatch = bestJob
    ? computeMatch(
        owned,
        bestJob.skills.map((js: any) => ({
          skillId: js.skillId,
          name: js.skill.name,
          weight: js.weight,
        })),
      )
    : null;

  const application = await prisma.application.findFirst({
    where: { studentId, job: { companyId, ...(opts.jobId ? { id: opts.jobId } : {}) } },
    select: { id: true, status: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  return {
    candidate: {
      studentId: student.id,
      name: student.user?.name ?? "Tanpa Nama",
      email: student.user?.email ?? null,
      phone: student.user?.phone ?? null,
      nim: student.nim,
      major: student.major,
      semester: student.semester,
      gpa: (student as any).gpa ?? null,
      bio: (student as any).bio ?? null,
      university: student.university?.name ?? null,
      skills: student.skills.map((s: any) => s.skill),
      matchScore: best?.matchScore ?? 0,
      matchScoreRule: ruleMatch?.score ?? 0,
      roleMatch: best?.kategori ?? "-",
      jobId: best?.id ?? null,
      matchedSkills: ruleMatch?.matchedSkills ?? [],
      gapSkills: ruleMatch?.missingSkills ?? [],
      applicationId: application?.id ?? null,
      applicationStatus: application?.status ?? null,
    },
    certificates: student.certificates,
    kompetensiGroups,
  };
};