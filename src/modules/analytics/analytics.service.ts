import prisma from "../../config/prisma";
import { aggregateSkillFrequency } from "../../utils/matching";
import { JOB_STATUS } from "../../constants";

// ============================================================
// Tren skill: frekuensi skill dari SEMUA lowongan aktif.
// Untuk dashboard Kaprodi (bahan evaluasi kurikulum).
// ============================================================
export const getSkillTrends = async (limit?: number) => {
  // ambil semua lowongan aktif + skill-nya
  const jobs = await prisma.job.findMany({
    where: { status: JOB_STATUS.ACTIVE },
    include: { skills: { include: { skill: { select: { id: true, name: true } } } } },
  });

  // ubah ke format yang dimengerti aggregateSkillFrequency:
  // array of [ {skillId, name}, ... ] per lowongan
  const skillLists = jobs.map((job: any) =>
    job.skills.map((js: any) => ({ skillId: js.skillId, name: js.skill.name })),
  );

  // hitung frekuensi (sudah terurut desc dari fungsinya)
  let trends = aggregateSkillFrequency(skillLists);
  if (limit && limit > 0) trends = trends.slice(0, limit);

  return {
    totalActiveJobs: jobs.length,
    totalUniqueSkills: trends.length,
    trends, // [{ skillId, name, count }] siap dibuat grafik
  };
};

// ============================================================
// Overview sistem (untuk Admin Utama). Angka ringkas.
// ============================================================
export const getSystemOverview = async () => {
  const [
    totalUniversities,
    totalStudents,
    totalCompanies,
    verifiedCompanies,
    pendingCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    totalSubjects,
  ] = await Promise.all([
    prisma.university.count(),
    prisma.student.count(),
    prisma.company.count(),
    prisma.company.count({ where: { status: "verified" } }),
    prisma.company.count({ where: { status: "pending" } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: JOB_STATUS.ACTIVE } }),
    prisma.application.count(),
    prisma.subject.count(),
  ]);

  return {
    universities: totalUniversities,
    students: totalStudents,
    companies: { total: totalCompanies, verified: verifiedCompanies, pending: pendingCompanies },
    jobs: { total: totalJobs, active: activeJobs },
    applications: totalApplications,
    subjects: totalSubjects,
  };
};

// ============================================================
// Distribusi status lamaran (untuk dashboard, opsional).
// ============================================================
export const getApplicationStats = async () => {
  const grouped = await prisma.application.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  return grouped.map((g: any) => ({ status: g.status, count: g._count.status }));
};

// ============================================================
// Ringkasan dashboard Admin Kampus / Kaprodi.
// Dihitung di database supaya frontend cukup satu permintaan.
// ============================================================
export const getUniversityDashboard = async (universityId: string) => {
  const [totalStudents, subjects, clos, takenGroups, totalTaken] = await Promise.all([
    prisma.student.count({ where: { universityId } }),
    prisma.subject.findMany({
      where: { universityId },
      select: { id: true, code: true, name: true, sks: true, semester: true },
      orderBy: { code: "asc" },
    }),
    prisma.cLO.findMany({
      where: { subject: { universityId } },
      select: { id: true, subjectId: true, code: true },
    }),
    // berapa mahasiswa yang sudah punya nilai per mata kuliah
    prisma.subjectTaken.groupBy({
      by: ["subjectId"],
      where: { student: { universityId } },
      _count: true,
    }),
    prisma.subjectTaken.count({ where: { student: { universityId } } }),
  ]);

  const closBySubject = new Map<string, any[]>();
  for (const c of clos as any[]) {
    const list = closBySubject.get(c.subjectId) ?? [];
    list.push(c);
    closBySubject.set(c.subjectId, list);
  }

  const gradedBySubject = new Map<string, number>();
  for (const g of takenGroups as any[]) gradedBySubject.set(g.subjectId, g._count);

  const statusOf = (graded: number, total: number): "Selesai" | "Sebagian" | "Belum" => {
    if (total === 0 || graded === 0) return "Belum";
    return graded >= total ? "Selesai" : "Sebagian";
  };

  const courses = subjects.map((s: any) => {
    const subjectClos = closBySubject.get(s.id) ?? [];
    const graded = gradedBySubject.get(s.id) ?? 0;
    const status = statusOf(graded, totalStudents);

    return {
      id: s.id,
      code: s.code,
      name: s.name,
      sks: s.sks,
      semester: s.semester ?? null,
      cloCount: subjectClos.length,
      gradedStudents: graded,
      totalStudents,
      status,
      // Nilai dicatat per mata kuliah, bukan per CLO, sehingga seluruh CLO
      // dalam satu matkul memiliki progres yang sama.
      clos: subjectClos.map((c: any, i: number) => ({
        id: c.id,
        name: c.code ?? c.kode ?? `CLO${i + 1}`,
        graded,
        total: totalStudents,
        status,
      })),
    };
  });

  return {
    stats: {
      students: totalStudents,
      courses: subjects.length,
      totalCLO: clos.length,
      gradesInputted: totalTaken,
    },
    courses,
  };
};

// ============================================================
// ==============  BAGIAN KHUSUS SUPER ADMIN  =================
// ============================================================

// ------------------------------------------------------------
// Tren aktivitas harian (dashboard Super Admin).
// Dihitung dari event yang MEMANG tercatat di database:
//   - jobViews     : JobView (peninjauan lowongan oleh mahasiswa)
//   - applications : Application (lamaran masuk)
// ------------------------------------------------------------
export const getActivityTrends = async (days: number) => {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [views, apps] = await Promise.all([
    prisma.jobView.findMany({
      where: { created_at: { gte: since } },
      select: { created_at: true },
    }),
    prisma.application.findMany({
      where: { created_at: { gte: since } },
      select: { created_at: true },
    }),
  ]);

  // siapkan bucket per hari supaya hari tanpa aktivitas tetap muncul (nilai 0)
  const buckets = new Map<string, { date: string; jobViews: number; applications: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, jobViews: 0, applications: 0 });
  }

  const keyOf = (dt: Date) => new Date(dt).toISOString().slice(0, 10);
  for (const v of views as any[]) {
    const b = buckets.get(keyOf(v.created_at));
    if (b) b.jobViews += 1;
  }
  for (const a of apps as any[]) {
    const b = buckets.get(keyOf(a.created_at));
    if (b) b.applications += 1;
  }

  return Array.from(buckets.values());
};

// ------------------------------------------------------------
// Log aktivitas pengguna (halaman Log Aktivitas Super Admin).
// Diturunkan dari tabel event yang sudah ada, per kelompok pengguna.
// ------------------------------------------------------------
export type ActivityLogGroup = "student" | "university" | "company";

export const getActivityLogs = async (opts: {
  group: ActivityLogGroup;
  activity?: string;
  search?: string;
  skip: number;
  take: number;
}) => {
  const { group, activity, search } = opts;
  // union beberapa sumber: ambil (skip+take) teratas per sumber, gabung, urutkan, potong
  const fetch = opts.skip + opts.take;

  type Row = {
    id: string;
    time: string; // ISO
    actorName: string | null;
    orgName: string | null; // universitas / perusahaan aktor
    activity: string;
    detail: string | null;
    subDetail: string | null;
    durationMs?: number | null;
  };

  const rows: Row[] = [];
  let total = 0;

  if (group === "student") {
    const nameFilter = search
      ? { student: { user: { name: { contains: search, mode: "insensitive" as const } } } }
      : {};

    const wantApply = !activity || activity === "Apply Job";
    const wantView = !activity || activity === "View Job";
    const wantSave = !activity || activity === "Save Job";

    const studentInclude = {
      student: {
        include: {
          user: { select: { name: true } },
          university: { select: { name: true } },
        },
      },
      job: { select: { title: true, company: { select: { name: true } } } },
    };

    const [apps, views, favs, cApps, cViews, cFavs] = await Promise.all([
      wantApply
        ? prisma.application.findMany({
            where: { ...nameFilter },
            include: studentInclude,
            orderBy: { created_at: "desc" },
            take: fetch,
          })
        : Promise.resolve([] as any[]),
      wantView
        ? prisma.jobView.findMany({
            where: { ...nameFilter },
            include: studentInclude,
            orderBy: { created_at: "desc" },
            take: fetch,
          })
        : Promise.resolve([] as any[]),
      wantSave
        ? prisma.jobFavorite.findMany({
            where: { ...nameFilter },
            include: studentInclude,
            orderBy: { created_at: "desc" },
            take: fetch,
          })
        : Promise.resolve([] as any[]),
      wantApply ? prisma.application.count({ where: { ...nameFilter } }) : Promise.resolve(0),
      wantView ? prisma.jobView.count({ where: { ...nameFilter } }) : Promise.resolve(0),
      wantSave ? prisma.jobFavorite.count({ where: { ...nameFilter } }) : Promise.resolve(0),
    ]);

    total = cApps + cViews + cFavs;
    for (const a of apps as any[]) {
      rows.push({
        id: `app-${a.id}`,
        time: a.created_at.toISOString(),
        actorName: a.student?.user?.name ?? null,
        orgName: a.student?.university?.name ?? null,
        activity: "Apply Job",
        detail: a.job?.title ?? null,
        subDetail: a.job?.company?.name ?? null,
      });
    }
    for (const v of views as any[]) {
      rows.push({
        id: `view-${v.id}`,
        time: v.created_at.toISOString(),
        actorName: v.student?.user?.name ?? null,
        orgName: v.student?.university?.name ?? null,
        activity: "View Job",
        detail: v.job?.title ?? null,
        subDetail: v.job?.company?.name ?? null,
        durationMs: v.durationMs,
      });
    }
    for (const f of favs as any[]) {
      rows.push({
        id: `fav-${f.id}`,
        time: f.created_at.toISOString(),
        actorName: f.student?.user?.name ?? null,
        orgName: f.student?.university?.name ?? null,
        activity: "Save Job",
        detail: f.job?.title ?? null,
        subDetail: f.job?.company?.name ?? null,
      });
    }
  }

  if (group === "university") {
    const wantVerify = !activity || activity === "VERIFIKASI BERKAS";
    const wantAdd = !activity || activity === "TAMBAH MAHASISWA";

    const certWhere: any = { reviewedAt: { not: null } };
    if (search) certWhere.reviewedBy = { name: { contains: search, mode: "insensitive" } };
    const studentWhere: any = {};
    if (search) studentWhere.university = { name: { contains: search, mode: "insensitive" } };

    const [certs, students, cCerts, cStudents] = await Promise.all([
      wantVerify
        ? prisma.certificate.findMany({
            where: certWhere,
            include: {
              reviewedBy: {
                select: {
                  name: true,
                  universityMember: { select: { university: { select: { name: true } } } },
                },
              },
              student: { include: { user: { select: { name: true } } } },
            },
            orderBy: { reviewedAt: "desc" },
            take: fetch,
          })
        : Promise.resolve([] as any[]),
      wantAdd
        ? prisma.student.findMany({
            where: studentWhere,
            include: {
              user: { select: { name: true } },
              university: { select: { name: true } },
            },
            orderBy: { created_at: "desc" },
            take: fetch,
          })
        : Promise.resolve([] as any[]),
      wantVerify ? prisma.certificate.count({ where: certWhere }) : Promise.resolve(0),
      wantAdd ? prisma.student.count({ where: studentWhere }) : Promise.resolve(0),
    ]);

    total = cCerts + cStudents;
    for (const c of certs as any[]) {
      rows.push({
        id: `cert-${c.id}`,
        time: (c.reviewedAt ?? c.updated_at).toISOString(),
        actorName: c.reviewedBy?.name ?? null,
        orgName: c.reviewedBy?.universityMember?.university?.name ?? null,
        activity: "VERIFIKASI BERKAS",
        detail: `Mahasiswa: ${c.student?.user?.name ?? "-"}`,
        subDetail: `Sertifikat: ${c.title}`,
      });
    }
    for (const s of students as any[]) {
      rows.push({
        id: `stud-${s.id}`,
        time: s.created_at.toISOString(),
        actorName: null, // pembuat data tidak tercatat di tabel Student
        orgName: s.university?.name ?? null,
        activity: "TAMBAH MAHASISWA",
        detail: `Mahasiswa: ${s.user?.name ?? "-"}`,
        subDetail: s.nim ? `NIM: ${s.nim}` : null,
      });
    }
  }

  if (group === "company") {
    const wantPost = !activity || activity === "Post Lowongan";
    const wantInvite = !activity || activity === "Kirim Undangan";

    const jobWhere: any = {};
    if (search) {
      jobWhere.OR = [
        { postedBy: { name: { contains: search, mode: "insensitive" } } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    const invWhere: any = {};
    if (search) {
      invWhere.OR = [
        { invitedBy: { name: { contains: search, mode: "insensitive" } } },
        { job: { company: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [jobs, invites, cJobs, cInvites] = await Promise.all([
      wantPost
        ? prisma.job.findMany({
            where: jobWhere,
            include: {
              postedBy: { select: { name: true } },
              company: { select: { name: true } },
            },
            orderBy: { created_at: "desc" },
            take: fetch,
          })
        : Promise.resolve([] as any[]),
      wantInvite
        ? prisma.jobInvitation.findMany({
            where: invWhere,
            include: {
              invitedBy: { select: { name: true } },
              job: { select: { title: true, company: { select: { name: true } } } },
              student: { include: { user: { select: { name: true } } } },
            },
            orderBy: { created_at: "desc" },
            take: fetch,
          })
        : Promise.resolve([] as any[]),
      wantPost ? prisma.job.count({ where: jobWhere }) : Promise.resolve(0),
      wantInvite ? prisma.jobInvitation.count({ where: invWhere }) : Promise.resolve(0),
    ]);

    total = cJobs + cInvites;
    for (const j of jobs as any[]) {
      rows.push({
        id: `job-${j.id}`,
        time: j.created_at.toISOString(),
        actorName: j.postedBy?.name ?? null,
        orgName: j.company?.name ?? null,
        activity: "Post Lowongan",
        detail: j.title,
        subDetail: null,
      });
    }
    for (const inv of invites as any[]) {
      rows.push({
        id: `inv-${inv.id}`,
        time: inv.created_at.toISOString(),
        actorName: inv.invitedBy?.name ?? null,
        orgName: inv.job?.company?.name ?? null,
        activity: "Kirim Undangan",
        detail: `${inv.student?.user?.name ?? "-"} (${inv.job?.title ?? "-"})`,
        subDetail: null,
      });
    }
  }

  rows.sort((a, b) => b.time.localeCompare(a.time));
  return { total, logs: rows.slice(opts.skip, opts.skip + opts.take) };
};

// ------------------------------------------------------------
// Log sistem terbaru (kartu "Log Aktivitas Terbaru" di dashboard).
// ------------------------------------------------------------
export const getRecentSystemLogs = async (limit: number) => {
  const take = limit;
  const [pendingCompanies, verifiedCompanies, rejectedCompanies, newUniversities] =
    await Promise.all([
      prisma.company.findMany({
        select: { id: true, name: true, created_at: true },
        orderBy: { created_at: "desc" },
        take,
      }),
      prisma.company.findMany({
        where: { verifiedAt: { not: null } },
        select: { id: true, name: true, verifiedAt: true },
        orderBy: { verifiedAt: "desc" },
        take,
      }),
      prisma.company.findMany({
        where: { rejectedAt: { not: null } },
        select: { id: true, name: true, rejectedAt: true },
        orderBy: { rejectedAt: "desc" },
        take,
      }),
      prisma.university.findMany({
        select: { id: true, name: true, created_at: true },
        orderBy: { created_at: "desc" },
        take,
      }),
    ]);

  type Log = { id: string; action: string; time: string; type: "info" | "warning" | "success" };
  const logs: Log[] = [
    ...pendingCompanies.map(
      (c: any): Log => ({
        id: `creg-${c.id}`,
        action: `Perusahaan ${c.name} mendaftar dan menunggu verifikasi`,
        time: c.created_at.toISOString(),
        type: "info",
      }),
    ),
    ...verifiedCompanies.map(
      (c: any): Log => ({
        id: `cver-${c.id}`,
        action: `Perusahaan ${c.name} berhasil diverifikasi`,
        time: c.verifiedAt!.toISOString(),
        type: "success",
      }),
    ),
    ...rejectedCompanies.map(
      (c: any): Log => ({
        id: `crej-${c.id}`,
        action: `Pendaftaran perusahaan ${c.name} ditolak`,
        time: c.rejectedAt!.toISOString(),
        type: "warning",
      }),
    ),
    ...newUniversities.map(
      (u: any): Log => ({
        id: `ureg-${u.id}`,
        action: `Universitas ${u.name} ditambahkan ke sistem`,
        time: u.created_at.toISOString(),
        type: "info",
      }),
    ),
  ];

  logs.sort((a, b) => b.time.localeCompare(a.time));
  return logs.slice(0, limit);
};

// ------------------------------------------------------------
// Master data: mata kuliah + CLO (lintas universitas).
// ------------------------------------------------------------
export const getMasterCourses = async (opts: { search?: string; skip: number; take: number }) => {
  const where: any = {};
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { university: { name: { contains: opts.search, mode: "insensitive" } } },
    ];
  }

  const [total, subjects] = await Promise.all([
    prisma.subject.count({ where }),
    prisma.subject.findMany({
      where,
      include: {
        university: { select: { id: true, name: true } },
        clos: { select: { id: true, code: true, text: true, skills: true } },
      },
      orderBy: { updated_at: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
  ]);

  const courses = subjects.map((s: any) => ({
    id: s.id,
    courseName: s.name,
    courseCode: s.code,
    sks: s.sks,
    semester: s.semester,
    universityName: s.university?.name ?? null,
    cloCount: s.clos.length,
    clos: s.clos.map((c: any, i: number) => ({
      id: c.id,
      name: c.code ?? `CLO ${i + 1}`,
      text: c.text,
      // CLO.skills disimpan sebagai string dipisah koma
      skills: c.skills
        ? String(c.skills).split(",").map((x: string) => x.trim()).filter(Boolean)
        : [],
    })),
    updatedAt: s.updated_at,
  }));

  return { total, courses };
};

// ------------------------------------------------------------
// Master data: kebutuhan industri (lowongan + persyaratan).
// ------------------------------------------------------------
export const getMasterIndustries = async (opts: {
  search?: string;
  skip: number;
  take: number;
}) => {
  const where: any = {};
  if (opts.search) {
    where.OR = [
      { title: { contains: opts.search, mode: "insensitive" } },
      { company: { name: { contains: opts.search, mode: "insensitive" } } },
    ];
  }

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        requirements: { select: { requirement: true, skills: true }, orderBy: { order: "asc" } },
      },
      orderBy: { updated_at: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
  ]);

  const industries = jobs.map((j: any) => {
    const skillSet = new Set<string>();
    for (const r of j.requirements) {
      for (const s of String(r.skills ?? "").split(",")) {
        const t = s.trim();
        if (t) skillSet.add(t);
      }
    }
    return {
      id: j.id,
      companyName: j.company?.name ?? "-",
      industry: j.company?.industry ?? null,
      position: j.title,
      responsibility: j.requirements[0]?.requirement ?? null,
      skills: Array.from(skillSet).slice(0, 8),
      updatedAt: j.updated_at,
    };
  });

  return { total, industries };
};

// ------------------------------------------------------------
// Statistik master data (kartu di dashboard Super Admin).
// ------------------------------------------------------------
export const getMasterDataStatsAdmin = async () => {
  const [majors, subjects, clos] = await Promise.all([
    prisma.student.findMany({
      where: { major: { not: null } },
      distinct: ["major"],
      select: { major: true },
    }),
    prisma.subject.count(),
    prisma.cLO.count(),
  ]);

  return { programStudi: majors.length, mataKuliah: subjects, clo: clos };
};