// ============================================================================
// SEED DATA DUMMY - Sistem Rekomendasi Karir
// ----------------------------------------------------------------------------
// AMAN untuk data asli: TIDAK menghapus CLO, TIDAK menghapus Subject.
// Subject asli hanya di-update universityId-nya ke telu.
// Data dummy (user, company, job, dst) dihapus & dibuat ulang tiap seed.
// Jalankan: npx tsx prisma/seed.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// hash password (samakan dengan util password milikmu -> bcryptjs)
const hash = (plain: string) => bcrypt.hashSync(plain, 10);

async function main() {
  console.log("🌱 Mulai seeding data dummy...\n");

  // ==========================================================================
  // 1. BERSIHKAN DATA DUMMY (urut dari anak ke induk, hormati foreign key)
  //    CATATAN: CLO & Subject TIDAK dihapus.
  // ==========================================================================
  console.log("🧹 Membersihkan data dummy lama...");
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.certificateSkill.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.subjectTaken.deleteMany();
  await prisma.onlineCourseSkill.deleteMany();
  await prisma.onlineCourse.deleteMany();
  // SubjectSkill: hapus (Subject asli belum punya skill; ini hanya jaga-jaga)
  await prisma.subjectSkill.deleteMany();
  // hapus semua member & user & company & university dummy
  await prisma.companyMember.deleteMany();
  await prisma.universityMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  // Skill: hapus (akan dibuat ulang). Aman karena relasi skill sudah dihapus di atas.
  await prisma.skill.deleteMany();
  // University: hapus dummy. Subject.universityId akan jadi null otomatis (onDelete: SetNull),
  // lalu kita set ulang di bawah.
  await prisma.university.deleteMany();
  console.log("   ✓ Data dummy dibersihkan (CLO & Subject tetap aman)\n");

  // ==========================================================================
  // 2. UNIVERSITAS: telu
  // ==========================================================================
  console.log("🏛️  Membuat universitas telu...");
  const telu = await prisma.university.create({
    data: {
      name: "Telkom University",
      code: "TELU",
      address: "Bandung, Jawa Barat",
    },
  });
  console.log(`   ✓ Tel-U dibuat (id: ${telu.id})\n`);

  // Hubungkan SEMUA Subject asli ke telu (update universityId, tidak menghapus)
  const updatedSubjects = await prisma.subject.updateMany({
    data: { universityId: telu.id },
  });
  console.log(`🔗 ${updatedSubjects.count} Subject asli dihubungkan ke telu\n`);

  // ==========================================================================
  // 3. SKILL (master data skill umum industri)
  // ==========================================================================
  console.log("🛠️  Membuat skill...");
  const skillNames = [
    "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "PostgreSQL", "Python", "Docker", "Git", "REST API",
    "Machine Learning", "Data Analysis", "UI/UX Design", "Kotlin", "Flutter",
    "Problem Solving", "Communication", "Project Management",
  ];
  const skills: Record<string, string> = {}; // name -> id
  for (const name of skillNames) {
    const s = await prisma.skill.create({ data: { name } });
    skills[name] = s.id;
  }
  console.log(`   ✓ ${skillNames.length} skill dibuat\n`);

  // ==========================================================================
  // 4. AKUN DEFAULT (semua role)
  // ==========================================================================
  console.log("👤 Membuat akun default...");

  // 4a. Super Admin
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@sistem.com",
      password: hash("admin123"),
      role: "admin",
      status: "active",
    },
  });

  // 4b. Admin Kampus (Tel-U)
  await prisma.user.create({
    data: {
      name: "Admin Kampus Tel-U",
      email: "kampus@telkom.ac.id",
      password: hash("kampus123"),
      role: "university",
      status: "active",
      universityMember: {
        create: { position: "admin_kampus", universityId: telu.id },
      },
    },
  });

  // 4c. Kaprodi (telu)
  await prisma.user.create({
    data: {
      name: "Kaprodi Sistem Informasi",
      email: "kaprodi@telkom.ac.id",
      password: hash("kaprodi123"),
      role: "university_staff",
      status: "active",
      universityMember: {
        create: { position: "kaprodi", universityId: telu.id },
      },
    },
  });
  console.log("   ✓ Admin, Admin Kampus, Kaprodi dibuat");

  // ==========================================================================
  // 5. PERUSAHAAN (1 verified + 1 pending) + Direktur & HRD
  // ==========================================================================
  console.log("🏢 Membuat perusahaan...");

  // 5a. TechCorp (VERIFIED) + Direktur + HRD
  const techDirektur = await prisma.user.create({
    data: {
      name: "Budi Direktur",
      email: "direktur@techcorp.com",
      password: hash("direktur123"),
      role: "company",
      status: "active",
    },
  });
  const techcorp = await prisma.company.create({
    data: {
      name: "TechCorp Indonesia",
      industry: "Teknologi Informasi",
      description: "Perusahaan software house terkemuka.",
      status: "verified",
      verifiedAt: new Date(),
      members: {
        create: { userId: techDirektur.id, position: "direktur" },
      },
    },
  });
  // HRD TechCorp
  const techHrd = await prisma.user.create({
    data: {
      name: "Sari HRD",
      email: "hrd@techcorp.com",
      password: hash("hrd123"),
      role: "company_staff",
      status: "active",
      companyMember: {
        create: { companyId: techcorp.id, position: "hrd" },
      },
    },
  });

  // 5b. DataViz (PENDING - untuk tes verifikasi admin)
  const dvDirektur = await prisma.user.create({
    data: {
      name: "Andi Direktur",
      email: "direktur@dataviz.com",
      password: hash("direktur123"),
      role: "company",
      status: "active",
    },
  });
  await prisma.company.create({
    data: {
      name: "DataViz Analytics",
      industry: "Data & Analytics",
      status: "pending", // belum verified -> belum bisa posting lowongan
      members: { create: { userId: dvDirektur.id, position: "direktur" } },
    },
  });
  console.log("   ✓ TechCorp (verified) + DataViz (pending) dibuat\n");

  // ==========================================================================
  // 6. LOWONGAN (di TechCorp yang verified) + skill berbobot
  // ==========================================================================
  console.log("💼 Membuat lowongan...");
  const jobSeeds = [
    {
      title: "Backend Developer",
      description: "Membangun REST API dan integrasi sistem menggunakan Node.js.",
      location: "Jakarta", type: "fulltime",
      skills: [["Node.js", 3], ["Express", 2], ["PostgreSQL", 2], ["REST API", 2], ["Docker", 1]],
    },
    {
      title: "Frontend Developer",
      description: "Mengembangkan antarmuka web modern dengan React.",
      location: "Bandung", type: "fulltime",
      skills: [["React", 3], ["TypeScript", 2], ["JavaScript", 2], ["UI/UX Design", 1]],
    },
    {
      title: "Data Scientist",
      description: "Analisis data dan pemodelan machine learning.",
      location: "Remote", type: "fulltime",
      skills: [["Python", 3], ["Machine Learning", 3], ["Data Analysis", 2]],
    },
    {
      title: "Mobile Developer (Intern)",
      description: "Magang pengembangan aplikasi mobile dengan Kotlin/Flutter.",
      location: "Jakarta", type: "internship",
      skills: [["Kotlin", 2], ["Flutter", 2], ["Git", 1], ["Problem Solving", 1]],
    },
    {
      title: "Fullstack Developer",
      description: "Mengembangkan aplikasi web end-to-end.",
      location: "Remote", type: "fulltime",
      skills: [["React", 2], ["Node.js", 2], ["PostgreSQL", 2], ["TypeScript", 2], ["Git", 1]],
    },
  ];

  const createdJobs = [];
  for (const j of jobSeeds) {
    const job = await prisma.job.create({
      data: {
        companyId: techcorp.id,
        postedById: techHrd.id,
        title: j.title,
        description: j.description,
        location: j.location,
        type: j.type,
        status: "active",
        skills: {
          create: j.skills.map(([name, weight]) => ({
            skillId: skills[name as string],
            weight: weight as number,
          })),
        },
      },
    });
    createdJobs.push(job);
  }
  console.log(`   ✓ ${createdJobs.length} lowongan dibuat\n`);

  // ==========================================================================
  // 7. MAHASISWA DUMMY (skill bervariasi -> match score beda-beda)
  // ==========================================================================
  console.log("🎓 Membuat mahasiswa dummy...");
  const studentSeeds = [
    { name: "Mahasiswa Utama", email: "mahasiswa@student.com", nim: "123140001",
      skills: ["Node.js", "Express", "PostgreSQL", "REST API", "Git"] }, // cocok Backend
    { name: "Ahmad Fauzi", email: "ahmad@student.com", nim: "123140002",
      skills: ["React", "TypeScript", "JavaScript"] }, // cocok Frontend
    { name: "Siti Nurhaliza", email: "siti@student.com", nim: "123140003",
      skills: ["Python", "Machine Learning", "Data Analysis"] }, // cocok Data Scientist
    { name: "Budi Santoso", email: "budi@student.com", nim: "123140004",
      skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "Git"] }, // cocok Fullstack
    { name: "Dewi Lestari", email: "dewi@student.com", nim: "123140005",
      skills: ["Kotlin", "Flutter", "Git"] }, // cocok Mobile
    { name: "Eko Prasetyo", email: "eko@student.com", nim: "123140006",
      skills: ["JavaScript", "Git", "Problem Solving"] }, // cocok sebagian
    { name: "Fitri Handayani", email: "fitri@student.com", nim: "123140007",
      skills: ["Python", "Data Analysis", "Communication"] },
    { name: "Gilang Ramadhan", email: "gilang@student.com", nim: "123140008",
      skills: ["Docker", "PostgreSQL", "REST API", "Node.js"] },
  ];

  const createdStudents = [];
  for (const st of studentSeeds) {
    const user = await prisma.user.create({
      data: {
        name: st.name,
        email: st.email,
        password: hash("mahasiswa123"), // password default sama untuk semua dummy
        role: "student",
        status: "active",
        student: {
          create: {
            nim: st.nim,
            major: "Teknik Informatika",
            semester: 6,
            gpa: 3.5,
            universityId: telu.id,
            skills: {
              create: st.skills.map((name) => ({
                skillId: skills[name],
                source: "manual",
              })),
            },
          },
        },
      },
      include: { student: true },
    });
    createdStudents.push(user.student!);
  }
  console.log(`   ✓ ${createdStudents.length} mahasiswa dibuat\n`);

  // ==========================================================================
  // 8. LAMARAN DUMMY (biar ada data di modul application)
  // ==========================================================================
  console.log("📝 Membuat lamaran dummy...");
  // Mahasiswa Utama melamar Backend Developer
  await prisma.application.create({
    data: {
      jobId: createdJobs[0].id,
      studentId: createdStudents[0].id,
      status: "submitted",
      matchSnapshot: 90,
      coverLetter: "Saya tertarik dengan posisi ini.",
    },
  });
  // Ahmad melamar Frontend
  await prisma.application.create({
    data: {
      jobId: createdJobs[1].id,
      studentId: createdStudents[1].id,
      status: "processing",
      matchSnapshot: 78,
    },
  });
  console.log("   ✓ 2 lamaran dummy dibuat\n");

  // ==========================================================================
  // 9. ONLINE COURSE DUMMY (untuk rekomendasi kursus nanti)
  // ==========================================================================
  console.log("📚 Membuat online course dummy...");
  const courseSeeds = [
    { title: "Docker for Beginners", provider: "Udemy", level: "beginner", skills: ["Docker"] },
    { title: "Advanced React", provider: "Coursera", level: "intermediate", skills: ["React", "TypeScript"] },
    { title: "Machine Learning A-Z", provider: "Udemy", level: "intermediate", skills: ["Machine Learning", "Python"] },
    { title: "PostgreSQL Mastery", provider: "Dicoding", level: "intermediate", skills: ["PostgreSQL"] },
  ];
  for (const c of courseSeeds) {
    await prisma.onlineCourse.create({
      data: {
        title: c.title,
        provider: c.provider,
        level: c.level,
        skills: { create: c.skills.map((name) => ({ skillId: skills[name] })) },
      },
    });
  }
  console.log(`   ✓ ${courseSeeds.length} online course dibuat\n`);

  console.log("✅ SEEDING SELESAI!\n");
  console.log("═".repeat(50));
  console.log("KREDENSIAL LOGIN DEFAULT:");
  console.log("═".repeat(50));
  console.log("Super Admin    : admin@sistem.com / admin123");
  console.log("Admin Kampus   : kampus@telkom.ac.id / kampus123");
  console.log("Kaprodi        : kaprodi@telkom.ac.id / kaprodi123");
  console.log("Direktur       : direktur@techcorp.com / direktur123");
  console.log("HRD            : hrd@techcorp.com / hrd123");
  console.log("Mahasiswa      : mahasiswa@student.com / mahasiswa123");
  console.log("═".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });