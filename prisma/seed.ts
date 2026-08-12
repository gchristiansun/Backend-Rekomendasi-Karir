/// <reference types="node" />
// ============================================================================
// SEED DATA SINTETIS - Sistem Rekomendasi Karir
// ----------------------------------------------------------------------------
// Membangun ulang seluruh data dummy untuk lima kelompok pengguna:
// Super Admin, Admin Kampus (+ Kaprodi), Perusahaan (+ HRD), dan Mahasiswa.
//
// AMAN UNTUK DATA ASLI:
//   48 Subject dan 164 CLO yang sudah ada di database TIDAK dihapus. Embedding
//   CLO hasil AI service dipertahankan apa adanya; seed hanya melengkapi kolom
//   yang masih kosong (kode, SKS, semester, bobot, keahlian).
//
// Jalankan:  npm run seed
// Prasyarat opsional: ai-service di http://localhost:8000 supaya CLO baru dan
// persyaratan lowongan langsung punya embedding. Tanpa itu seed tetap jalan,
// tinggal susulkan dengan: npx ts-node src/scripts/backfill-embeddings.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import {
  SKILL_CATALOG,
  UNIVERSITIES,
  COMPANIES,
  JOBS,
  ONLINE_COURSES,
  CERTIFICATE_TEMPLATES,
  CERT_FILE,
} from "./seed-data/catalog";
import { SUBJECT_META, EXTRA_SUBJECTS } from "./seed-data/curriculum";
import {
  STUDENTS,
  SKILL_MINAT,
  LOWONGAN_MINAT,
  SERTIFIKAT_MINAT,
  type Kemampuan,
} from "./seed-data/students";

const prisma = new PrismaClient();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

// ============================================================================
// UTILITAS
// ============================================================================

// Pengacak deterministik: hasil seed selalu sama setiap dijalankan, sehingga
// tangkapan layar, catatan pengujian, dan hasil rekomendasi tetap bisa diacu.
let benih = 20260812;
const acak = (): number => {
  benih |= 0;
  benih = (benih + 0x6d2b79f5) | 0;
  let t = Math.imul(benih ^ (benih >>> 15), 1 | benih);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const angka = (min: number, max: number): number => Math.floor(acak() * (max - min + 1)) + min;
const salahSatu = <T>(arr: T[]): T => arr[Math.floor(acak() * arr.length)];
const kocok = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const beberapa = <T>(arr: T[], n: number): T[] => kocok(arr).slice(0, Math.min(n, arr.length));

const SEKARANG = new Date();
/** Tanggal n hari yang lalu, dengan jam-menit acak agar log tidak seragam. */
const hariLalu = (n: number, jamAcak = true): Date => {
  const d = new Date(SEKARANG);
  d.setDate(d.getDate() - n);
  if (jamAcak) d.setHours(angka(7, 21), angka(0, 59), angka(0, 59), 0);
  return d;
};
const hariLagi = (n: number): Date => hariLalu(-n, false);

const jepit = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

/** Nilai huruf mengikuti skala yang dipakai utils/semanticMatching.ts. */
const nilaiHuruf = (skor: number): string => {
  if (skor >= 85) return "A";
  if (skor >= 80) return "AB";
  if (skor >= 75) return "B";
  if (skor >= 70) return "BC";
  if (skor >= 60) return "C";
  if (skor >= 50) return "D";
  return "E";
};

/** Rentang nilai mata kuliah menurut kemampuan akademik mahasiswa. */
const RENTANG_NILAI: Record<Kemampuan, [number, number]> = {
  tinggi: [80, 96],
  sedang: [68, 88],
  rendah: [52, 76],
};

const hashToken = (mentah: string): string =>
  crypto.createHash("sha256").update(mentah).digest("hex");

// ----------------------------------------------------------------------------
// EMBEDDING
// Vektor dipakai mesin pencocokan semantik (CLO mahasiswa vs tanggung jawab
// lowongan). Bila ai-service mati, seed tetap lanjut tanpa vektor.
// ----------------------------------------------------------------------------
let aiHidup = true;

const cekAiService = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { dimension?: number };
    console.log(`   ✓ ai-service aktif (dimensi vektor: ${data.dimension})`);
    return true;
  } catch {
    return false;
  }
};

const embedBanyak = async (teks: string[]): Promise<(string | null)[]> => {
  if (!aiHidup || teks.length === 0) return teks.map(() => null);

  const hasil: (string | null)[] = [];
  const BATCH = 16;
  for (let i = 0; i < teks.length; i += BATCH) {
    const potongan = teks.slice(i, i + BATCH);
    try {
      const res = await fetch(`${AI_SERVICE_URL}/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: potongan }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { embeddings: number[][] };
      for (const v of data.embeddings) hasil.push(JSON.stringify(v));
    } catch (err: any) {
      console.warn(`   ⚠ embedding gagal (${err?.message}); sisanya dikosongkan`);
      aiHidup = false;
      while (hasil.length < teks.length) hasil.push(null);
      return hasil;
    }
    process.stdout.write(`\r   … embedding ${Math.min(i + BATCH, teks.length)}/${teks.length}`);
  }
  process.stdout.write("\n");
  return hasil;
};

// ============================================================================
// PROGRAM UTAMA
// ============================================================================
async function main() {
  console.log("\n🌱 SEED DATA SINTETIS - Sistem Rekomendasi Karir\n" + "═".repeat(64));

  console.log("\n🔌 Memeriksa ai-service...");
  aiHidup = await cekAiService();
  if (!aiHidup) {
    console.log("   ⚠ ai-service tidak aktif. CLO & persyaratan baru dibuat tanpa embedding.");
  }

  // ==========================================================================
  // 1. BERSIHKAN DATA DUMMY LAMA
  //    Urut dari tabel anak ke induk. Subject & CLO ASLI tidak disentuh;
  //    yang dihapus hanya mata kuliah sintetis buatan seed sebelumnya.
  // ==========================================================================
  console.log("\n🧹 Membersihkan data dummy lama...");
  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.recoveryEmailToken.deleteMany();
  await prisma.jobInvitation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobFavorite.deleteMany();
  await prisma.jobView.deleteMany();
  await prisma.certificateSkill.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.jobRequirement.deleteMany();
  await prisma.job.deleteMany();
  await prisma.cLOGrade.deleteMany();
  await prisma.subjectTaken.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.subjectSkill.deleteMany();
  await prisma.onlineCourseSkill.deleteMany();
  await prisma.onlineCourse.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.universityMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();

  // Mata kuliah sintetis dari seed sebelumnya (CLO-nya ikut terhapus via cascade)
  const namaSintetis = EXTRA_SUBJECTS.map((s) => s.name);
  const sintetisTerhapus = await prisma.subject.deleteMany({
    where: { name: { in: namaSintetis } },
  });

  // Universitas dihapus terakhir; Subject.universityId otomatis jadi null
  // (onDelete: SetNull) lalu dipasang ulang di langkah berikutnya.
  await prisma.university.deleteMany();
  console.log(
    `   ✓ Data dummy dibersihkan (${sintetisTerhapus.count} matkul sintetis lama dihapus, Subject & CLO asli aman)`,
  );

  // ==========================================================================
  // 2. UNIVERSITAS + AKUN ADMIN KAMPUS & KAPRODI
  // ==========================================================================
  console.log("\n🏛️  Membuat universitas & akun kampus...");
  const sandiKampus = bcrypt.hashSync("kampus123", 10);
  const sandiKaprodi = bcrypt.hashSync("kaprodi123", 10);

  const univId: Record<string, string> = {};
  const adminKampusId: Record<string, string> = {};

  for (const u of UNIVERSITIES) {
    const uni = await prisma.university.create({
      data: {
        name: u.name,
        code: u.code,
        address: u.address,
        city: u.city,
        website: u.website,
        created_at: hariLalu(angka(200, 300)),
      },
    });
    univId[u.key] = uni.id;

    const admin = await prisma.user.create({
      data: {
        name: u.admin.name,
        email: u.admin.email,
        phone: u.admin.phone,
        password: sandiKampus,
        role: "university",
        status: "active",
        recoveryEmail: u.admin.email.replace("@", ".recovery@"),
        recoveryEmailVerifiedAt: hariLalu(angka(30, 120)),
        lastLoginAt: hariLalu(angka(0, 5)),
        created_at: hariLalu(angka(200, 300)),
        universityMember: {
          create: { universityId: uni.id, position: "admin_kampus", nip: u.admin.nip },
        },
      },
    });
    adminKampusId[u.key] = admin.id;

    await prisma.user.create({
      data: {
        name: u.kaprodi.name,
        email: u.kaprodi.email,
        phone: u.kaprodi.phone,
        password: sandiKaprodi,
        role: "university_staff",
        status: "active",
        lastLoginAt: hariLalu(angka(0, 12)),
        created_at: hariLalu(angka(180, 260)),
        universityMember: {
          create: { universityId: uni.id, position: "kaprodi", nip: u.kaprodi.nip },
        },
      },
    });
  }
  console.log(`   ✓ ${UNIVERSITIES.length} universitas + ${UNIVERSITIES.length * 2} akun kampus`);

  // ==========================================================================
  // 3. SUPER ADMIN
  // ==========================================================================
  const superAdmin = await prisma.user.create({
    data: {
      name: "Admin Utama",
      email: "admin@sistem.com",
      phone: "081100000001",
      password: bcrypt.hashSync("admin123", 10),
      role: "admin",
      status: "active",
      recoveryEmail: "admin.recovery@sistem.com",
      recoveryEmailVerifiedAt: hariLalu(150),
      lastLoginAt: hariLalu(0),
      created_at: hariLalu(320),
    },
  });
  console.log("   ✓ Akun Super Admin dibuat");

  // ==========================================================================
  // 4. MELENGKAPI 48 MATA KULIAH ASLI (kode, SKS, semester, RPS)
  //    Seluruhnya dihubungkan ke Telkom University sesuai asal kurikulumnya.
  // ==========================================================================
  console.log("\n📚 Melengkapi mata kuliah asli...");
  const teluId = univId["TELU"];
  const subjekAsli = await prisma.subject.findMany({
    where: { name: { notIn: namaSintetis } },
    select: { id: true, name: true },
  });

  let terisi = 0;
  const tanpaMeta: string[] = [];
  for (const s of subjekAsli) {
    const meta = SUBJECT_META[s.name];
    if (!meta) {
      // Mata kuliah di luar daftar tetap dihubungkan ke kampus, kolom lain dibiarkan.
      tanpaMeta.push(s.name);
      await prisma.subject.update({ where: { id: s.id }, data: { universityId: teluId } });
      continue;
    }
    await prisma.subject.update({
      where: { id: s.id },
      data: {
        universityId: teluId,
        code: meta.code,
        sks: meta.sks,
        semester: meta.semester,
        rps: `https://kurikulum.telkomuniversity.ac.id/rps/${meta.code.toLowerCase()}.pdf`,
      },
    });
    terisi += 1;
  }
  console.log(`   ✓ ${terisi} mata kuliah dilengkapi kode/SKS/semester/RPS`);
  if (tanpaMeta.length > 0) {
    console.log(`   ⚠ ${tanpaMeta.length} matkul belum ada di SUBJECT_META: ${tanpaMeta.join(", ")}`);
  }

  // --- Bobot & keahlian tiap CLO asli ---------------------------------------
  const semuaSubjekAsli = await prisma.subject.findMany({
    where: { name: { notIn: namaSintetis } },
    select: { id: true, name: true, clos: { select: { id: true }, orderBy: { code: "asc" } } },
  });

  let cloTerisi = 0;
  for (const s of semuaSubjekAsli) {
    const meta = SUBJECT_META[s.name];
    if (!meta || s.clos.length === 0) continue;

    // Bobot dibagi rata; sisa pembagian ditambahkan ke CLO pertama agar total 100.
    const dasar = Math.floor(100 / s.clos.length);
    const sisa = 100 - dasar * s.clos.length;

    for (let i = 0; i < s.clos.length; i++) {
      // Tiap CLO mengambil dua keahlian dari daftar mata kuliahnya secara bergilir,
      // sehingga seluruh keahlian matkul terwakili dan tidak menumpuk di satu CLO.
      const skills = [
        meta.skills[i % meta.skills.length],
        meta.skills[(i + 1) % meta.skills.length],
      ];
      await prisma.cLO.update({
        where: { id: s.clos[i].id },
        data: {
          weight: dasar + (i === 0 ? sisa : 0),
          skills: Array.from(new Set(skills)).join(","),
        },
      });
      cloTerisi += 1;
    }
  }
  console.log(`   ✓ ${cloTerisi} CLO asli dilengkapi bobot & keahlian (embedding tidak diubah)`);

  // ==========================================================================
  // 5. MATA KULIAH SINTETIS UNTUK ITERA & UNSRI
  // ==========================================================================
  console.log("\n📗 Membuat mata kuliah sintetis (ITERA & Unsri)...");
  const teksClo = EXTRA_SUBJECTS.flatMap((s) => s.clos.map((c) => c.paraphrase));
  const vektorClo = await embedBanyak(teksClo);

  let idxClo = 0;
  for (const s of EXTRA_SUBJECTS) {
    await prisma.subject.create({
      data: {
        universityId: univId[s.universityKey],
        code: s.code,
        name: s.name,
        sks: s.sks,
        semester: s.semester,
        rps: `https://kurikulum.kampus.ac.id/rps/${s.code.toLowerCase()}.pdf`,
        clos: {
          create: s.clos.map((c, i) => {
            const dasar = Math.floor(100 / s.clos.length);
            const sisa = 100 - dasar * s.clos.length;
            return {
              code: c.code,
              text: c.text,
              paraphrase: c.paraphrase,
              embedding: vektorClo[idxClo++],
              weight: dasar + (i === 0 ? sisa : 0),
              skills: [s.skills[i % s.skills.length], s.skills[(i + 1) % s.skills.length]]
                .filter((v, j, a) => a.indexOf(v) === j)
                .join(","),
            };
          }),
        },
      },
    });
  }
  console.log(
    `   ✓ ${EXTRA_SUBJECTS.length} mata kuliah + ${teksClo.length} CLO baru` +
      (aiHidup ? " (dengan embedding)" : " (tanpa embedding)"),
  );

  // ==========================================================================
  // 6. SKILL MASTER
  // ==========================================================================
  console.log("\n🛠️  Membuat skill master...");
  await prisma.skill.createMany({ data: SKILL_CATALOG });
  const semuaSkill = await prisma.skill.findMany({ select: { id: true, name: true } });
  const skillId: Record<string, string> = {};
  for (const s of semuaSkill) skillId[s.name] = s.id;
  console.log(`   ✓ ${semuaSkill.length} skill (semua berkategori)`);

  /** Ambil id skill; melempar bila ada salah ketik di katalog. */
  const idSkill = (nama: string): string => {
    const id = skillId[nama];
    if (!id) throw new Error(`Skill "${nama}" tidak ada di SKILL_CATALOG`);
    return id;
  };

  // --- Keahlian mata kuliah (SubjectSkill) ----------------------------------
  const subjekSkillRows: { subjectId: string; skillId: string }[] = [];
  for (const s of semuaSubjekAsli) {
    const meta = SUBJECT_META[s.name];
    if (!meta) continue;
    for (const nama of meta.skills) subjekSkillRows.push({ subjectId: s.id, skillId: idSkill(nama) });
  }
  const subjekSintetis = await prisma.subject.findMany({
    where: { name: { in: namaSintetis } },
    select: { id: true, name: true },
  });
  for (const s of subjekSintetis) {
    const def = EXTRA_SUBJECTS.find((e) => e.name === s.name)!;
    for (const nama of def.skills) subjekSkillRows.push({ subjectId: s.id, skillId: idSkill(nama) });
  }
  await prisma.subjectSkill.createMany({ data: subjekSkillRows, skipDuplicates: true });
  console.log(`   ✓ ${subjekSkillRows.length} kaitan mata kuliah–skill`);

  // ==========================================================================
  // 7. PERUSAHAAN + DIREKTUR + HRD
  // ==========================================================================
  console.log("\n🏢 Membuat perusahaan & akun perusahaan...");
  const sandiDirektur = bcrypt.hashSync("direktur123", 10);
  const sandiHrd = bcrypt.hashSync("hrd123", 10);

  const perusahaanId: Record<string, string> = {};
  const direkturId: Record<string, string> = {};
  const hrdId: Record<string, string> = {};

  for (const c of COMPANIES) {
    const daftar = hariLalu(c.daftarHariLalu);
    const putusan = c.putusanHariLalu !== undefined ? hariLalu(c.putusanHariLalu) : null;

    const perusahaan = await prisma.company.create({
      data: {
        name: c.name,
        industry: c.industry,
        description: c.description,
        website: c.website,
        logoUrl: c.logoUrl,
        size: c.size,
        address: c.address,
        nib: c.nib,
        izinUsahaUrl: c.izinUsahaUrl,
        suratResmiUrl: c.suratResmiUrl,
        status: c.status,
        verifiedAt: c.status === "verified" ? putusan : null,
        rejectedAt: c.status === "rejected" ? putusan : null,
        rejectionReason: c.status === "rejected" ? c.rejectionReason : null,
        created_at: daftar,
      },
    });
    perusahaanId[c.key] = perusahaan.id;

    const direktur = await prisma.user.create({
      data: {
        name: c.direktur.name,
        email: c.direktur.email,
        phone: c.direktur.phone,
        password: sandiDirektur,
        role: "company",
        status: "active",
        recoveryEmail: c.direktur.email.replace("@", ".recovery@"),
        recoveryEmailVerifiedAt: c.status === "verified" ? hariLalu(angka(30, 90)) : null,
        lastLoginAt: hariLalu(angka(0, 7)),
        created_at: daftar,
        companyMember: {
          create: { companyId: perusahaan.id, position: "direktur", nip: c.direktur.nip },
        },
      },
    });
    direkturId[c.key] = direktur.id;

    const hrd = await prisma.user.create({
      data: {
        name: c.hrd.name,
        email: c.hrd.email,
        phone: c.hrd.phone,
        password: sandiHrd,
        role: "company_staff",
        status: "active",
        lastLoginAt: hariLalu(angka(0, 4)),
        created_at: new Date(daftar.getTime() + 86_400_000),
        companyMember: {
          create: { companyId: perusahaan.id, position: "hrd", nip: c.hrd.nip },
        },
      },
    });
    hrdId[c.key] = hrd.id;
  }
  const jmlVerified = COMPANIES.filter((c) => c.status === "verified").length;
  console.log(
    `   ✓ ${COMPANIES.length} perusahaan (${jmlVerified} verified, ` +
      `${COMPANIES.filter((c) => c.status === "pending").length} pending, ` +
      `${COMPANIES.filter((c) => c.status === "rejected").length} rejected) + ${COMPANIES.length * 2} akun`,
  );

  // ==========================================================================
  // 8. LOWONGAN + SKILL + PERSYARATAN (dengan embedding)
  // ==========================================================================
  console.log("\n💼 Membuat lowongan...");
  const teksReq = JOBS.flatMap((j) => j.requirements.map((r) => r.text));
  const vektorReq = await embedBanyak(teksReq);

  const jobIdByTitle: Record<string, string> = {};
  const jobInfo: {
    id: string;
    title: string;
    companyKey: string;
    status: string;
    skills: [string, number][];
  }[] = [];

  let idxReq = 0;
  for (const j of JOBS) {
    const job = await prisma.job.create({
      data: {
        companyId: perusahaanId[j.companyKey],
        postedById: j.postedBy === "hrd" ? hrdId[j.companyKey] : direkturId[j.companyKey],
        title: j.title,
        department: j.department,
        location: j.location,
        type: j.type,
        status: j.status,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        postingDate: hariLalu(j.tayangHariLalu, false),
        deadline: hariLagi(j.deadlineHariLagi),
        created_at: hariLalu(j.tayangHariLalu),
        skills: {
          create: j.skills.map(([nama, bobot]) => ({ skillId: idSkill(nama), weight: bobot })),
        },
        requirements: {
          create: j.requirements.map((r, i) => ({
            requirement: r.text,
            skills: r.skills.join(","),
            order: i,
            embedding: vektorReq[idxReq++],
          })),
        },
      },
    });
    jobIdByTitle[j.title] = job.id;
    jobInfo.push({
      id: job.id,
      title: j.title,
      companyKey: j.companyKey,
      status: j.status,
      skills: j.skills,
    });
  }
  console.log(
    `   ✓ ${JOBS.length} lowongan, ${teksReq.length} persyaratan` +
      (aiHidup ? " (dengan embedding)" : " (tanpa embedding)"),
  );

  // ==========================================================================
  // 9. MAHASISWA + PROFIL
  // ==========================================================================
  console.log("\n🎓 Membuat mahasiswa...");
  const sandiMahasiswa = bcrypt.hashSync("mahasiswa123", 10);

  interface MhsRt {
    studentId: string;
    userId: string;
    /** Status akun yang sudah dinormalkan (STUDENTS.status boleh kosong). */
    status: string;
    seed: (typeof STUDENTS)[number];
    skillDimiliki: Set<string>; // nama skill
  }
  const mahasiswa: MhsRt[] = [];
  const urutNim: Record<string, number> = {};

  for (const st of STUDENTS) {
    const uni = UNIVERSITIES.find((u) => u.key === st.universityKey)!;
    const kunciNim = `${uni.key}-${st.entryYear}`;
    urutNim[kunciNim] = (urutNim[kunciNim] ?? 0) + 1;
    const nim = `${uni.nimPrefix}${String(st.entryYear).slice(2)}${String(urutNim[kunciNim]).padStart(3, "0")}`;

    const status = st.status ?? "active";
    const daftar = hariLalu(angka(120, 240));

    const user = await prisma.user.create({
      data: {
        name: st.name,
        email: st.email,
        phone: `08${angka(11, 89)}${angka(10000000, 99999999)}`,
        password: sandiMahasiswa,
        role: "student",
        status,
        // Sebagian mahasiswa sudah memasang email pemulihan; sisanya belum,
        // supaya alur verifikasi email pemulihan masih bisa dicoba.
        recoveryEmail: acak() < 0.35 ? st.email.replace(/@.*/, "") + ".backup@gmail.com" : null,
        recoveryEmailVerifiedAt: acak() < 0.25 ? hariLalu(angka(10, 90)) : null,
        lastLoginAt: status === "active" ? hariLalu(angka(0, 14)) : null,
        created_at: daftar,
        student: {
          create: {
            universityId: univId[st.universityKey],
            nim,
            major: uni.major,
            faculty: uni.faculty,
            semester: st.semester,
            gpa: st.gpa,
            bio: st.bio,
            entryYear: st.entryYear,
            graduatedAt: st.lulus ? hariLalu(angka(30, 90), false) : null,
            created_at: daftar,
          },
        },
      },
      include: { student: true },
    });

    mahasiswa.push({
      studentId: user.student!.id,
      userId: user.id,
      status,
      seed: st,
      skillDimiliki: new Set<string>(),
    });
  }
  console.log(`   ✓ ${mahasiswa.length} mahasiswa (${STUDENTS.filter((s) => s.lulus).length} alumni)`);

  // ==========================================================================
  // 10. RIWAYAT AKADEMIK: SubjectTaken + CLOGrade + skill dari mata kuliah
  // ==========================================================================
  console.log("\n📝 Mengisi nilai mata kuliah & CLO...");

  // Peta mata kuliah per universitas beserta CLO dan keahliannya.
  const subjekPerUniv = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      semester: true,
      universityId: true,
      clos: { select: { id: true } },
    },
  });

  const keahlianSubjek = (nama: string): string[] =>
    SUBJECT_META[nama]?.skills ?? EXTRA_SUBJECTS.find((e) => e.name === nama)?.skills ?? [];

  const barisTaken: {
    studentId: string;
    subjectId: string;
    score: number;
    grade: string;
    semester: number;
  }[] = [];
  const barisCloGrade: { studentId: string; cloId: string; score: number }[] = [];
  const barisStudentSkill: { studentId: string; skillId: string; source: string }[] = [];

  for (const m of mahasiswa) {
    const [min, max] = RENTANG_NILAI[m.seed.kemampuan];
    // Mata kuliah yang sudah ditempuh = semester lebih kecil dari semester berjalan.
    const diambil = subjekPerUniv.filter(
      (s) =>
        s.universityId === univId[m.seed.universityKey] &&
        s.semester !== null &&
        s.semester < m.seed.semester,
    );

    for (const s of diambil) {
      const skor = angka(min, max);
      barisTaken.push({
        studentId: m.studentId,
        subjectId: s.id,
        score: skor,
        grade: nilaiHuruf(skor),
        semester: s.semester!,
      });

      // Nilai per CLO bervariasi di sekitar nilai mata kuliahnya.
      for (const c of s.clos) {
        barisCloGrade.push({
          studentId: m.studentId,
          cloId: c.id,
          score: jepit(skor + angka(-7, 7), 40, 100),
        });
      }

      // Mata kuliah yang LULUS menyumbang keahlian ke profil mahasiswa.
      if (skor >= 60) {
        for (const nama of keahlianSubjek(s.name)) {
          if (!m.skillDimiliki.has(nama)) {
            m.skillDimiliki.add(nama);
            barisStudentSkill.push({
              studentId: m.studentId,
              skillId: idSkill(nama),
              source: "course",
            });
          }
        }
      }
    }
  }

  await prisma.subjectTaken.createMany({ data: barisTaken, skipDuplicates: true });
  await prisma.cLOGrade.createMany({ data: barisCloGrade, skipDuplicates: true });
  console.log(`   ✓ ${barisTaken.length} nilai mata kuliah, ${barisCloGrade.length} nilai CLO`);

  // ==========================================================================
  // 11. SERTIFIKAT + skill dari sertifikat
  // ==========================================================================
  console.log("\n📜 Membuat sertifikat mahasiswa...");
  let jmlSertifikat = 0;
  const sertifikatDisetujui: { studentId: string; judul: string }[] = [];

  for (const m of mahasiswa) {
    if (m.status === "deleted") continue;
    // Mahasiswa tingkat awal belum tentu punya sertifikat.
    const jumlah = m.seed.semester >= 7 ? angka(1, 3) : angka(0, 2);
    if (jumlah === 0) continue;

    const kandidat = [
      ...SERTIFIKAT_MINAT[m.seed.minat],
      ...beberapa(
        CERTIFICATE_TEMPLATES.map((c) => c.title),
        2,
      ),
    ];
    const dipilih = Array.from(new Set(kandidat)).slice(0, jumlah);

    for (const judul of dipilih) {
      const tmpl = CERTIFICATE_TEMPLATES.find((c) => c.title === judul)!;
      // Distribusi status: mayoritas disetujui, sisanya menunggu / ditolak,
      // supaya antrean verifikasi Admin Kampus tidak kosong.
      const undi = acak();
      const status = undi < 0.65 ? "approved" : undi < 0.88 ? "pending" : "rejected";
      const diunggah = hariLalu(angka(5, 120));
      const ditinjau = status === "pending" ? null : new Date(diunggah.getTime() + 86_400_000 * angka(1, 5));

      const cert = await prisma.certificate.create({
        data: {
          studentId: m.studentId,
          title: tmpl.title,
          issuer: tmpl.issuer,
          issuedAt: new Date(diunggah.getTime() - 86_400_000 * angka(30, 400)),
          credentialId: `${tmpl.issuer.slice(0, 3).toUpperCase()}-${angka(100000, 999999)}-${angka(10, 99)}`,
          fileUrl: CERT_FILE,
          fileType: "application/pdf",
          status,
          reviewedById: status === "pending" ? null : adminKampusId[m.seed.universityKey],
          reviewedAt: ditinjau,
          note:
            status === "approved"
              ? "Sertifikat terverifikasi. Nama penerima dan penerbit sesuai dengan data mahasiswa."
              : status === "rejected"
                ? "Berkas tidak terbaca dengan jelas dan tanggal terbit tidak tercantum. Silakan unggah ulang berkas asli."
                : null,
          created_at: diunggah,
          skills: { create: tmpl.skills.map((n) => ({ skillId: idSkill(n) })) },
        },
      });
      jmlSertifikat += 1;

      if (status === "approved") {
        sertifikatDisetujui.push({ studentId: m.studentId, judul: cert.title });
        for (const nama of tmpl.skills) {
          if (!m.skillDimiliki.has(nama)) {
            m.skillDimiliki.add(nama);
            barisStudentSkill.push({
              studentId: m.studentId,
              skillId: idSkill(nama),
              source: "certificate",
            });
          }
        }
      }
    }
  }
  console.log(`   ✓ ${jmlSertifikat} sertifikat (${sertifikatDisetujui.length} disetujui)`);

  // ==========================================================================
  // 12. SKILL MANDIRI (source: manual) sesuai minat karier
  // ==========================================================================
  for (const m of mahasiswa) {
    for (const nama of SKILL_MINAT[m.seed.minat]) {
      if (!m.skillDimiliki.has(nama)) {
        m.skillDimiliki.add(nama);
        barisStudentSkill.push({ studentId: m.studentId, skillId: idSkill(nama), source: "manual" });
      }
    }
  }
  await prisma.studentSkill.createMany({ data: barisStudentSkill, skipDuplicates: true });
  console.log(`   ✓ ${barisStudentSkill.length} skill mahasiswa (course / certificate / manual)`);

  // ==========================================================================
  // 13. LAMARAN
  // ==========================================================================
  console.log("\n📨 Membuat lamaran, favorit, dan riwayat penelusuran...");

  /** Skor kecocokan kasar: bobot skill lowongan yang dimiliki mahasiswa. */
  const hitungKecocokan = (m: MhsRt, job: (typeof jobInfo)[number]): number => {
    const total = job.skills.reduce((a, [, w]) => a + w, 0);
    const punya = job.skills.reduce((a, [n, w]) => a + (m.skillDimiliki.has(n) ? w : 0), 0);
    return jepit(Math.round((punya / total) * 100) + angka(-6, 6), 12, 98);
  };

  const lowonganTerbuka = jobInfo.filter((j) => j.status !== "draft");
  const pasanganLamaran = new Set<string>();
  const notifikasi: {
    userId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    created_at: Date;
  }[] = [];

  let jmlLamaran = 0;
  for (const m of mahasiswa) {
    if (m.status !== "active") continue;
    // Mahasiswa tingkat awal jarang melamar; tingkat akhir & alumni paling aktif.
    const jumlah = m.seed.semester >= 7 ? angka(2, 4) : m.seed.semester >= 5 ? angka(1, 3) : angka(0, 1);
    if (jumlah === 0) continue;

    const relevan = LOWONGAN_MINAT[m.seed.minat]
      .map((t) => lowonganTerbuka.find((j) => j.title === t))
      .filter((j): j is (typeof jobInfo)[number] => Boolean(j));
    const target = beberapa([...relevan, ...beberapa(lowonganTerbuka, 2)], jumlah);

    for (const job of target) {
      const kunci = `${job.id}|${m.studentId}`;
      if (pasanganLamaran.has(kunci)) continue;
      pasanganLamaran.add(kunci);

      const dikirim = hariLalu(angka(1, 40));
      const undi = acak();
      const status = undi < 0.34 ? "submitted" : undi < 0.62 ? "processing" : undi < 0.78 ? "accepted" : "rejected";
      const cocok = hitungKecocokan(m, job);

      await prisma.application.create({
        data: {
          jobId: job.id,
          studentId: m.studentId,
          status,
          matchSnapshot: cocok,
          hiddenFromRecommendation: status === "rejected" && acak() < 0.5,
          coverLetter:
            `Saya ${m.seed.name}, mahasiswa ${UNIVERSITIES.find((u) => u.key === m.seed.universityKey)!.major} ` +
            `semester ${m.seed.semester}. Saya tertarik pada posisi ${job.title} karena sejalan dengan minat dan ` +
            `mata kuliah yang saya tempuh. Saya terbiasa bekerja dalam tim dan siap belajar hal baru dengan cepat.`,
          created_at: dikirim,
          updated_at: status === "submitted" ? dikirim : new Date(dikirim.getTime() + 86_400_000 * angka(1, 7)),
        },
      });
      jmlLamaran += 1;

      // Notifikasi ke mahasiswa untuk lamaran yang sudah diproses.
      if (status !== "submitted") {
        const label =
          status === "accepted" ? "diterima" : status === "rejected" ? "ditolak" : "sedang diproses";
        notifikasi.push({
          userId: m.userId,
          title: `Status lamaran ${job.title}`,
          message: `Lamaran Anda untuk posisi ${job.title} ${label}.`,
          type: "application",
          isRead: acak() < 0.5,
          created_at: new Date(dikirim.getTime() + 86_400_000),
        });
      }
      // Notifikasi ke HRD perusahaan.
      notifikasi.push({
        userId: hrdId[job.companyKey],
        title: "Pelamar baru",
        message: `${m.seed.name} melamar posisi ${job.title}.`,
        type: "application",
        isRead: acak() < 0.6,
        created_at: dikirim,
      });
    }
  }

  // ==========================================================================
  // 14. FAVORIT & RIWAYAT PENELUSURAN (sinyal implisit)
  // ==========================================================================
  const barisFavorit: { studentId: string; jobId: string; created_at: Date }[] = [];
  const barisView: {
    studentId: string;
    jobId: string;
    source: string;
    durationMs: number;
    created_at: Date;
  }[] = [];
  const SUMBER_VIEW = ["detail", "detail", "detail", "list", "search", "recommendation", "recommendation"];

  for (const m of mahasiswa) {
    if (m.status !== "active") continue;

    const relevan = LOWONGAN_MINAT[m.seed.minat]
      .map((t) => lowonganTerbuka.find((j) => j.title === t))
      .filter((j): j is (typeof jobInfo)[number] => Boolean(j));

    // Favorit: hanya dari lowongan yang relevan dengan minatnya.
    for (const job of beberapa(relevan, angka(1, 3))) {
      barisFavorit.push({ studentId: m.studentId, jobId: job.id, created_at: hariLalu(angka(1, 30)) });
    }

    // Kunjungan: sebagian besar ke lowongan relevan, sisanya menjelajah bebas.
    const jumlahView = angka(8, 26);
    for (let i = 0; i < jumlahView; i++) {
      const job = acak() < 0.7 && relevan.length > 0 ? salahSatu(relevan) : salahSatu(lowonganTerbuka);
      barisView.push({
        studentId: m.studentId,
        jobId: job.id,
        source: salahSatu(SUMBER_VIEW),
        // Lowongan yang relevan cenderung dibaca lebih lama.
        durationMs: relevan.includes(job) ? angka(25_000, 300_000) : angka(3_000, 60_000),
        created_at: hariLalu(angka(0, 29)),
      });
    }
  }
  await prisma.jobFavorite.createMany({ data: barisFavorit, skipDuplicates: true });
  await prisma.jobView.createMany({ data: barisView, skipDuplicates: true });
  console.log(
    `   ✓ ${jmlLamaran} lamaran, ${barisFavorit.length} favorit, ${barisView.length} kunjungan lowongan`,
  );

  // ==========================================================================
  // 15. UNDANGAN MELAMAR
  //     Undangan yang DITERIMA otomatis melahirkan Application, sesuai aturan
  //     yang tertulis di schema.
  // ==========================================================================
  console.log("\n✉️  Membuat undangan melamar...");
  let jmlUndangan = 0;

  for (const c of COMPANIES.filter((x) => x.status === "verified")) {
    const lowonganPerusahaan = lowonganTerbuka.filter((j) => j.companyKey === c.key);

    for (const job of beberapa(lowonganPerusahaan, 3)) {
      // Kandidat = mahasiswa aktif dengan kecocokan tertinggi untuk lowongan ini.
      const kandidat = mahasiswa
        .filter((m) => m.status === "active" && !pasanganLamaran.has(`${job.id}|${m.studentId}`))
        .map((m) => ({ m, skor: hitungKecocokan(m, job) }))
        .sort((a, b) => b.skor - a.skor)
        .slice(0, 6);

      for (const { m } of beberapa(kandidat, angka(1, 3))) {
        const kunci = `${job.id}|${m.studentId}`;
        if (pasanganLamaran.has(kunci)) continue;

        const dikirim = hariLalu(angka(2, 35));
        const undi = acak();
        const status = undi < 0.35 ? "pending" : undi < 0.68 ? "accepted" : undi < 0.9 ? "declined" : "cancelled";
        const dijawab = status === "pending" ? null : new Date(dikirim.getTime() + 86_400_000 * angka(1, 6));

        await prisma.jobInvitation.create({
          data: {
            jobId: job.id,
            studentId: m.studentId,
            invitedById: hrdId[c.key],
            message:
              `Halo ${m.seed.name}, profil kompetensi Anda cocok dengan kebutuhan kami untuk posisi ${job.title} ` +
              `di ${c.name}. Kami mengundang Anda untuk melamar posisi ini.`,
            status,
            respondedAt: dijawab,
            created_at: dikirim,
            updated_at: dijawab ?? dikirim,
          },
        });
        jmlUndangan += 1;
        pasanganLamaran.add(kunci);

        notifikasi.push({
          userId: m.userId,
          title: `Undangan melamar dari ${c.name}`,
          message: `Anda diundang melamar posisi ${job.title}.`,
          type: "info",
          isRead: status !== "pending",
          created_at: dikirim,
        });

        // Undangan diterima -> lamaran ikut tercatat.
        if (status === "accepted") {
          await prisma.application.create({
            data: {
              jobId: job.id,
              studentId: m.studentId,
              status: acak() < 0.5 ? "submitted" : "processing",
              matchSnapshot: hitungKecocokan(m, job),
              coverLetter: `Terima kasih atas undangannya. Saya bersedia mengikuti proses seleksi untuk posisi ${job.title}.`,
              created_at: dijawab!,
              updated_at: dijawab!,
            },
          });
          jmlLamaran += 1;
        }
      }
    }
  }
  console.log(`   ✓ ${jmlUndangan} undangan (yang diterima ikut tercatat sebagai lamaran)`);

  // ==========================================================================
  // 16. KURSUS DARING
  // ==========================================================================
  for (const c of ONLINE_COURSES) {
    await prisma.onlineCourse.create({
      data: {
        title: c.title,
        provider: c.provider,
        url: c.url,
        level: c.level,
        description: c.description,
        created_at: hariLalu(angka(60, 300)),
        skills: { create: c.skills.map((n) => ({ skillId: idSkill(n) })) },
      },
    });
  }
  console.log(`\n📕 ${ONLINE_COURSES.length} kursus daring dibuat`);

  // ==========================================================================
  // 17. NOTIFIKASI SISTEM & KAMPUS
  // ==========================================================================
  // Super Admin: pendaftaran perusahaan yang menunggu verifikasi.
  for (const c of COMPANIES) {
    if (c.status === "pending") {
      notifikasi.push({
        userId: superAdmin.id,
        title: "Perusahaan menunggu verifikasi",
        message: `${c.name} mendaftar dan menunggu verifikasi berkas.`,
        type: "system",
        isRead: false,
        created_at: hariLalu(c.daftarHariLalu),
      });
    }
    // Direktur: hasil verifikasi berkas perusahaannya.
    if (c.status === "verified" || c.status === "rejected") {
      notifikasi.push({
        userId: direkturId[c.key],
        title: c.status === "verified" ? "Perusahaan terverifikasi" : "Pendaftaran ditolak",
        message:
          c.status === "verified"
            ? `${c.name} telah diverifikasi. Anda sudah dapat memasang lowongan.`
            : `Pendaftaran ${c.name} ditolak. ${c.rejectionReason}`,
        type: "system",
        isRead: acak() < 0.7,
        created_at: hariLalu(c.putusanHariLalu!),
      });
    }
  }

  // Admin Kampus: sertifikat baru yang menunggu verifikasi.
  const sertMenunggu = await prisma.certificate.findMany({
    where: { status: "pending" },
    select: { title: true, created_at: true, student: { select: { universityId: true, user: { select: { name: true } } } } },
  });
  for (const s of sertMenunggu) {
    const kunciUniv = UNIVERSITIES.find((u) => univId[u.key] === s.student.universityId)?.key;
    if (!kunciUniv) continue;
    notifikasi.push({
      userId: adminKampusId[kunciUniv],
      title: "Sertifikat menunggu verifikasi",
      message: `${s.student.user.name} mengunggah sertifikat "${s.title}".`,
      type: "certificate",
      isRead: false,
      created_at: s.created_at,
    });
  }

  // Mahasiswa: hasil peninjauan sertifikat yang disetujui.
  for (const m of mahasiswa) {
    const disetujui = sertifikatDisetujui.filter((s) => s.studentId === m.studentId);
    for (const s of disetujui) {
      notifikasi.push({
        userId: m.userId,
        title: "Sertifikat disetujui",
        message: `Sertifikat "${s.judul}" telah diverifikasi kampus dan skill-nya ditambahkan ke profil Anda.`,
        type: "certificate",
        isRead: acak() < 0.6,
        created_at: hariLalu(angka(1, 60)),
      });
    }
  }

  await prisma.notification.createMany({ data: notifikasi });
  console.log(`🔔 ${notifikasi.length} notifikasi dibuat`);

  // ==========================================================================
  // 18. TOKEN RESET SANDI & VERIFIKASI EMAIL PEMULIHAN
  //     Token disimpan sebagai hash; nilai mentahnya tidak pernah dipakai lagi,
  //     baris ini hanya untuk mengisi tabel agar tampilan/laporan tidak kosong.
  // ==========================================================================
  const targetToken = mahasiswa.filter((m) => m.status === "active").slice(0, 3);
  for (let i = 0; i < targetToken.length; i++) {
    const m = targetToken[i];
    const dibuat = hariLalu(angka(1, 20));
    await prisma.passwordResetToken.create({
      data: {
        userId: m.userId,
        tokenHash: hashToken(`reset-${m.userId}-${i}`),
        // Satu token masih berlaku, satu sudah dipakai, satu kedaluwarsa.
        expiresAt: i === 0 ? hariLagi(1) : new Date(dibuat.getTime() + 3_600_000),
        usedAt: i === 1 ? new Date(dibuat.getTime() + 600_000) : null,
        created_at: dibuat,
      },
    });
  }
  for (let i = 0; i < 2; i++) {
    const m = targetToken[i];
    const dibuat = hariLalu(angka(1, 10));
    await prisma.recoveryEmailToken.create({
      data: {
        userId: m.userId,
        email: `${m.seed.email.replace(/@.*/, "")}.backup@gmail.com`,
        tokenHash: hashToken(`recovery-${m.userId}-${i}`),
        expiresAt: i === 0 ? hariLagi(2) : new Date(dibuat.getTime() + 3_600_000),
        usedAt: i === 1 ? new Date(dibuat.getTime() + 900_000) : null,
        created_at: dibuat,
      },
    });
  }
  console.log(`🔑 ${targetToken.length} token reset sandi + 2 token email pemulihan`);

  // ==========================================================================
  // RINGKASAN
  // ==========================================================================
  const hitung = {
    user: await prisma.user.count(),
    universitas: await prisma.university.count(),
    mahasiswa: await prisma.student.count(),
    perusahaan: await prisma.company.count(),
    lowongan: await prisma.job.count(),
    persyaratan: await prisma.jobRequirement.count(),
    matkul: await prisma.subject.count(),
    clo: await prisma.cLO.count(),
    nilaiMatkul: await prisma.subjectTaken.count(),
    nilaiClo: await prisma.cLOGrade.count(),
    lamaran: await prisma.application.count(),
    undangan: await prisma.jobInvitation.count(),
    sertifikat: await prisma.certificate.count(),
    favorit: await prisma.jobFavorite.count(),
    kunjungan: await prisma.jobView.count(),
    notifikasi: await prisma.notification.count(),
    skill: await prisma.skill.count(),
  };

  console.log("\n" + "═".repeat(64));
  console.log("✅ SEEDING SELESAI");
  console.log("═".repeat(64));
  for (const [k, v] of Object.entries(hitung)) {
    console.log(`  ${k.padEnd(14)}: ${v}`);
  }

  console.log("\n" + "═".repeat(64));
  console.log("KREDENSIAL LOGIN");
  console.log("═".repeat(64));
  console.log("  Super Admin    : admin@sistem.com            / admin123");
  console.log("  Admin Kampus   : kampus@telkom.ac.id         / kampus123");
  console.log("                   kampus@itera.ac.id          / kampus123");
  console.log("                   kampus@unsri.ac.id          / kampus123");
  console.log("  Kaprodi        : kaprodi@telkom.ac.id        / kaprodi123");
  console.log("  Direktur       : direktur@techcorp.com       / direktur123");
  console.log("                   direktur@dataviz.com        / direktur123");
  console.log("  HRD            : hrd@techcorp.com            / hrd123");
  console.log("                   hrd@dataviz.com             / hrd123");
  console.log("  Mahasiswa      : mahasiswa@student.com       / mahasiswa123");
  console.log("                   ahmad@student.com           / mahasiswa123");
  console.log("                   (semua mahasiswa memakai sandi mahasiswa123)");
  console.log("═".repeat(64));

  if (!aiHidup) {
    console.log(
      "\n⚠ ai-service tidak aktif saat seeding. Jalankan ai-service lalu:\n" +
        "  npx ts-node src/scripts/backfill-embeddings.ts\n" +
        "  agar persyaratan lowongan punya embedding dan pencocokan semantik berfungsi.",
    );
  }
  console.log("");
}

main()
  .catch((e) => {
    console.error("\n❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
