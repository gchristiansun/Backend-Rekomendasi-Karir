// ============================================================================
// DAFTAR MAHASISWA SINTETIS
// ----------------------------------------------------------------------------
// 40 mahasiswa tersebar di tiga universitas dengan angkatan, kemampuan, dan
// minat karier yang berbeda-beda. Kombinasi itulah yang membuat hasil
// rekomendasi & pemeringkatan kandidat tidak seragam.
//
// Delapan email pertama sengaja dipertahankan sama dengan seed lama
// (mahasiswa@student.com dan kawan-kawan) supaya kredensial demo yang sudah
// terbiasa dipakai tetap berfungsi.
// ============================================================================

/** Minat karier: menentukan skill manual, sertifikat, dan lowongan yang dilamar. */
export type Minat =
  | "backend"
  | "frontend"
  | "fullstack"
  | "mobile"
  | "data"
  | "ai"
  | "uiux"
  | "security"
  | "cloud"
  | "analyst"
  | "manajemen"
  | "qa";

/** Kemampuan akademik: dasar untuk rentang nilai mata kuliah & CLO. */
export type Kemampuan = "tinggi" | "sedang" | "rendah";

export interface StudentSeed {
  name: string;
  email: string;
  universityKey: "TELU" | "ITERA" | "UNSRI";
  entryYear: number;
  /** Semester berjalan. Mata kuliah yang sudah ditempuh = semester < nilai ini. */
  semester: number;
  gpa: number;
  kemampuan: Kemampuan;
  minat: Minat;
  bio: string;
  /** Default "active". */
  status?: "active" | "suspended" | "pending" | "deleted";
  /** Sudah lulus - mengisi kolom graduatedAt. */
  lulus?: boolean;
}

export const STUDENTS: StudentSeed[] = [
  // ======================= TELKOM UNIVERSITY (24 orang) =====================

  // --- Angkatan 2022, sudah lulus (semester 8, seluruh mata kuliah ditempuh) --
  {
    name: "Mahasiswa Utama",
    email: "mahasiswa@student.com",
    universityKey: "TELU",
    entryYear: 2022,
    semester: 8,
    gpa: 3.72,
    kemampuan: "tinggi",
    minat: "backend",
    bio: "Fresh graduate Sistem Informasi dengan fokus pada pengembangan layanan backend. Terbiasa membangun REST API dengan Node.js dan merancang basis data relasional. Pernah menjadi asisten praktikum Sistem Basis Data selama dua semester.",
    lulus: true,
  },
  {
    name: "Ahmad Fauzi",
    email: "ahmad@student.com",
    universityKey: "TELU",
    entryYear: 2022,
    semester: 8,
    gpa: 3.58,
    kemampuan: "tinggi",
    minat: "frontend",
    bio: "Lulusan Sistem Informasi yang menekuni pengembangan antarmuka web. Menguasai React dan TypeScript, serta terbiasa menerjemahkan rancangan Figma menjadi komponen yang dapat digunakan ulang.",
    lulus: true,
  },
  {
    name: "Siti Nurhaliza",
    email: "siti@student.com",
    universityKey: "TELU",
    entryYear: 2022,
    semester: 8,
    gpa: 3.81,
    kemampuan: "tinggi",
    minat: "data",
    bio: "Fresh graduate dengan minat kuat pada analisis data. Tugas akhir membahas segmentasi pelanggan menggunakan algoritma klasterisasi. Aktif mengikuti kompetisi analisis data tingkat nasional.",
    lulus: true,
  },
  {
    name: "Budi Santoso",
    email: "budi@student.com",
    universityKey: "TELU",
    entryYear: 2022,
    semester: 8,
    gpa: 3.45,
    kemampuan: "sedang",
    minat: "fullstack",
    bio: "Lulusan Sistem Informasi yang nyaman bekerja di sisi antarmuka maupun peladen. Pernah membangun sistem informasi koperasi kampus sebagai proyek mata kuliah Proyek Perangkat Lunak.",
    lulus: true,
  },

  // --- Angkatan 2023, semester 7 -------------------------------------------
  {
    name: "Dewi Lestari",
    email: "dewi@student.com",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.64,
    kemampuan: "tinggi",
    minat: "mobile",
    bio: "Mahasiswa semester tujuh yang fokus pada pengembangan aplikasi bergerak. Sudah merilis dua aplikasi Flutter sederhana ke Play Store sebagai proyek pribadi.",
  },
  {
    name: "Eko Prasetyo",
    email: "eko@student.com",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.12,
    kemampuan: "rendah",
    minat: "qa",
    bio: "Mahasiswa semester tujuh yang tertarik pada pengujian perangkat lunak. Sedang belajar menulis skenario pengujian otomatis dan mendokumentasikan temuan cacat secara rapi.",
  },
  {
    name: "Fitri Handayani",
    email: "fitri@student.com",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.55,
    kemampuan: "sedang",
    minat: "analyst",
    bio: "Menekuni analisis proses bisnis dan penyusunan dokumen kebutuhan sistem. Terbiasa memodelkan proses dengan notasi BPMN dan memfasilitasi diskusi antar pemangku kepentingan.",
  },
  {
    name: "Gilang Ramadhan",
    email: "gilang@student.com",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.68,
    kemampuan: "tinggi",
    minat: "cloud",
    bio: "Tertarik pada infrastruktur dan komputasi awan. Sedang mendalami kontainerisasi dengan Docker serta otomasi penerapan aplikasi ke peladen.",
  },
  {
    name: "Hana Maulida",
    email: "hana.maulida@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.77,
    kemampuan: "tinggi",
    minat: "uiux",
    bio: "Mahasiswa yang mendalami perancangan interaksi dan riset pengguna. Aktif sebagai desainer di unit kegiatan mahasiswa bidang teknologi kreatif.",
  },
  {
    name: "Irfan Maulana",
    email: "irfan.maulana@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.28,
    kemampuan: "sedang",
    minat: "security",
    bio: "Berminat pada keamanan sistem informasi. Rutin mengikuti kompetisi tangkap bendera tingkat kampus dan mempelajari dasar pengujian penetrasi.",
  },
  {
    name: "Jihan Aulia",
    email: "jihan.aulia@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.49,
    kemampuan: "sedang",
    minat: "manajemen",
    bio: "Aktif sebagai koordinator proyek pada beberapa tugas besar. Terbiasa menyusun rencana kerja, membagi tugas tim, dan memantau kemajuan lewat papan Kanban.",
  },
  {
    name: "Kevin Wijaya",
    email: "kevin.wijaya@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2023,
    semester: 7,
    gpa: 3.86,
    kemampuan: "tinggi",
    minat: "ai",
    bio: "Fokus pada kecerdasan artifisial, khususnya pemrosesan bahasa alami. Sedang mengerjakan penelitian klasifikasi teks untuk tugas akhir bersama dosen pembimbing.",
  },

  // --- Angkatan 2024, semester 5 -------------------------------------------
  {
    name: "Lia Puspitasari",
    email: "lia.puspitasari@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 3.41,
    kemampuan: "sedang",
    minat: "frontend",
    bio: "Mahasiswa semester lima yang sedang mendalami pengembangan antarmuka web dan penerapan design system agar tampilan aplikasi konsisten.",
  },
  {
    name: "Muhammad Rizky",
    email: "m.rizky@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 3.63,
    kemampuan: "tinggi",
    minat: "backend",
    bio: "Menekuni pengembangan layanan backend dan perancangan basis data. Aktif sebagai asisten praktikum mata kuliah Pemrograman Berorientasi Objek.",
  },
  {
    name: "Nadia Salsabila",
    email: "nadia.salsabila@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 3.55,
    kemampuan: "sedang",
    minat: "data",
    bio: "Tertarik pada pengolahan dan visualisasi data. Sering membantu unit kegiatan mahasiswa mengolah data survei kepuasan anggota.",
  },
  {
    name: "Oscar Pratama",
    email: "oscar.pratama@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 2.94,
    kemampuan: "rendah",
    minat: "mobile",
    bio: "Mahasiswa semester lima yang mulai mendalami pengembangan aplikasi bergerak. Sedang memperbaiki pemahaman dasar pemrograman lewat kursus daring.",
  },
  {
    name: "Putri Ayuningtyas",
    email: "putri.ayu@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 3.70,
    kemampuan: "tinggi",
    minat: "uiux",
    bio: "Mendalami riset pengguna dan pengujian kegunaan. Terbiasa menyusun prototipe interaktif di Figma untuk kebutuhan tugas besar.",
  },
  {
    name: "Rangga Saputra",
    email: "rangga.saputra@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 3.22,
    kemampuan: "sedang",
    minat: "fullstack",
    bio: "Senang membangun aplikasi web dari nol, mulai dari perancangan basis data sampai tampilan antarmukanya.",
  },
  {
    name: "Salsabila Rahma",
    email: "salsabila.rahma@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 3.48,
    kemampuan: "sedang",
    minat: "analyst",
    bio: "Berminat pada peran analis bisnis. Terbiasa mewawancarai pengguna dan menerjemahkan kebutuhan mereka menjadi dokumen spesifikasi.",
  },
  {
    name: "Taufik Hidayat",
    email: "taufik.hidayat@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2024,
    semester: 5,
    gpa: 3.05,
    kemampuan: "rendah",
    minat: "cloud",
    bio: "Sedang mempelajari dasar komputasi awan dan administrasi peladen berbasis Linux melalui pelatihan mandiri.",
    status: "suspended",
  },

  // --- Angkatan 2025, semester 3 -------------------------------------------
  {
    name: "Umi Kalsum",
    email: "umi.kalsum@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2025,
    semester: 3,
    gpa: 3.60,
    kemampuan: "tinggi",
    minat: "data",
    bio: "Mahasiswa semester tiga yang menyukai statistika dan pengolahan data. Aktif mengikuti pelatihan analisis data di laboratorium kampus.",
  },
  {
    name: "Vino Arifin",
    email: "vino.arifin@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2025,
    semester: 3,
    gpa: 3.18,
    kemampuan: "sedang",
    minat: "frontend",
    bio: "Baru mulai mendalami pengembangan web dan sedang membangun portofolio proyek pribadi berbasis HTML, CSS, dan JavaScript.",
  },
  {
    name: "Winda Oktaviani",
    email: "winda.oktaviani@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2025,
    semester: 3,
    gpa: 3.35,
    kemampuan: "sedang",
    minat: "manajemen",
    bio: "Aktif di kepanitiaan acara kampus dan tertarik pada manajemen proyek teknologi informasi.",
  },
  {
    name: "Yoga Permana",
    email: "yoga.permana@student.telkomuniversity.ac.id",
    universityKey: "TELU",
    entryYear: 2025,
    semester: 3,
    gpa: 2.86,
    kemampuan: "rendah",
    minat: "qa",
    bio: "Mahasiswa semester tiga yang sedang menyesuaikan diri dengan beban perkuliahan dan mulai tertarik pada pengujian perangkat lunak.",
    status: "pending",
  },

  // ================= INSTITUT TEKNOLOGI SUMATERA (10 orang) =================
  {
    name: "Zaki Abdurrahman",
    email: "zaki.abdurrahman@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2022,
    semester: 8,
    gpa: 3.66,
    kemampuan: "tinggi",
    minat: "backend",
    bio: "Lulusan Teknik Informatika dengan pengalaman membangun layanan backend dan sistem terdistribusi berbasis kontainer.",
    lulus: true,
  },
  {
    name: "Anisa Fitriani",
    email: "anisa.fitriani@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2022,
    semester: 8,
    gpa: 3.52,
    kemampuan: "sedang",
    minat: "ai",
    bio: "Fresh graduate Teknik Informatika dengan tugas akhir bertema prediksi curah hujan menggunakan pembelajaran mesin.",
    lulus: true,
  },
  {
    name: "Bayu Anggara",
    email: "bayu.anggara@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2023,
    semester: 7,
    gpa: 3.44,
    kemampuan: "sedang",
    minat: "security",
    bio: "Mahasiswa Teknik Informatika yang mendalami keamanan siber, khususnya kriptografi dan pengujian keamanan aplikasi web.",
  },
  {
    name: "Cindy Permatasari",
    email: "cindy.permatasari@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2023,
    semester: 7,
    gpa: 3.79,
    kemampuan: "tinggi",
    minat: "data",
    bio: "Fokus pada analitika data berskala besar. Pernah magang di dinas daerah untuk membangun dasbor pemantauan program pembangunan.",
  },
  {
    name: "Dimas Alfarizi",
    email: "dimas.alfarizi@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2023,
    semester: 7,
    gpa: 3.10,
    kemampuan: "rendah",
    minat: "frontend",
    bio: "Mahasiswa yang sedang membangun portofolio pengembangan antarmuka web sambil memperdalam dasar pemrograman.",
  },
  {
    name: "Elsa Nuraini",
    email: "elsa.nuraini@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2023,
    semester: 7,
    gpa: 3.57,
    kemampuan: "sedang",
    minat: "uiux",
    bio: "Menekuni interaksi manusia dan komputer. Terbiasa melakukan pengujian kegunaan pada prototipe aplikasi kampus.",
  },
  {
    name: "Farhan Alghifari",
    email: "farhan.alghifari@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2024,
    semester: 5,
    gpa: 3.33,
    kemampuan: "sedang",
    minat: "fullstack",
    bio: "Mahasiswa semester lima yang aktif mengerjakan proyek aplikasi web untuk kegiatan himpunan mahasiswa.",
  },
  {
    name: "Gita Ramadhani",
    email: "gita.ramadhani@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2024,
    semester: 5,
    gpa: 3.71,
    kemampuan: "tinggi",
    minat: "ai",
    bio: "Tertarik pada pembelajaran mesin dan pengolahan citra. Aktif dalam kelompok riset mahasiswa bidang kecerdasan artifisial.",
  },
  {
    name: "Hafiz Ramadhan",
    email: "hafiz.ramadhan@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2024,
    semester: 5,
    gpa: 2.98,
    kemampuan: "rendah",
    minat: "cloud",
    bio: "Sedang mempelajari administrasi peladen dan dasar komputasi awan melalui pelatihan daring.",
  },
  {
    name: "Intan Maharani",
    email: "intan.maharani@student.itera.ac.id",
    universityKey: "ITERA",
    entryYear: 2024,
    semester: 5,
    gpa: 3.46,
    kemampuan: "sedang",
    minat: "mobile",
    bio: "Mahasiswa yang menekuni pengembangan aplikasi bergerak dan sedang membangun aplikasi pendataan UMKM binaan kampus.",
  },

  // ==================== UNIVERSITAS SRIWIJAYA (6 orang) =====================
  {
    name: "Joko Susilo",
    email: "joko.susilo@student.unsri.ac.id",
    universityKey: "UNSRI",
    entryYear: 2022,
    semester: 8,
    gpa: 3.39,
    kemampuan: "sedang",
    minat: "analyst",
    bio: "Lulusan Sistem Informasi yang berpengalaman menganalisis proses bisnis pada proyek digitalisasi layanan pemerintahan daerah.",
    lulus: true,
  },
  {
    name: "Kartika Sari",
    email: "kartika.sari@student.unsri.ac.id",
    universityKey: "UNSRI",
    entryYear: 2023,
    semester: 7,
    gpa: 3.62,
    kemampuan: "tinggi",
    minat: "data",
    bio: "Menekuni analisis data dan sistem pendukung keputusan. Pernah menjadi asisten penelitian dosen untuk pengolahan data survei.",
  },
  {
    name: "Lukman Hakim",
    email: "lukman.hakim@student.unsri.ac.id",
    universityKey: "UNSRI",
    entryYear: 2023,
    semester: 7,
    gpa: 3.25,
    kemampuan: "sedang",
    minat: "manajemen",
    bio: "Aktif di organisasi kemahasiswaan dan tertarik pada tata kelola serta audit sistem informasi.",
  },
  {
    name: "Mira Anggraeni",
    email: "mira.anggraeni@student.unsri.ac.id",
    universityKey: "UNSRI",
    entryYear: 2023,
    semester: 7,
    gpa: 3.51,
    kemampuan: "sedang",
    minat: "backend",
    bio: "Mendalami pengembangan aplikasi web sisi peladen dan pengelolaan basis data pada proyek mata kuliah.",
  },
  {
    name: "Nanda Pratiwi",
    email: "nanda.pratiwi@student.unsri.ac.id",
    universityKey: "UNSRI",
    entryYear: 2024,
    semester: 5,
    gpa: 3.44,
    kemampuan: "sedang",
    minat: "frontend",
    bio: "Mahasiswa semester lima yang sedang membangun kemampuan pengembangan antarmuka web dan pemrograman Python.",
  },
  {
    name: "Oki Setiawan",
    email: "oki.setiawan@student.unsri.ac.id",
    universityKey: "UNSRI",
    entryYear: 2024,
    semester: 5,
    gpa: 2.79,
    kemampuan: "rendah",
    minat: "security",
    bio: "Akun uji coba yang dinonaktifkan pengelola kampus karena data pendaftaran tidak lengkap.",
    status: "deleted",
  },
];

// ----------------------------------------------------------------------------
// Skill tambahan yang dipilih mahasiswa secara mandiri, sesuai minat kariernya.
// Dicatat sebagai StudentSkill dengan source "manual".
// ----------------------------------------------------------------------------
export const SKILL_MINAT: Record<Minat, string[]> = {
  backend: ["Node.js", "Express", "PostgreSQL", "REST API", "Docker", "Git"],
  frontend: ["React", "TypeScript", "JavaScript", "Tailwind CSS", "Git"],
  fullstack: ["React", "Node.js", "TypeScript", "PostgreSQL", "Git", "REST API"],
  mobile: ["Flutter", "Dart", "Kotlin", "REST API", "UI/UX Design"],
  data: ["Python", "Pandas", "SQL", "Data Analysis", "Data Visualization", "Microsoft Excel"],
  ai: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "NLP"],
  uiux: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Design System"],
  security: ["Information Security", "Network Security", "Cryptography", "Penetration Testing", "Linux"],
  cloud: ["AWS", "Docker", "Kubernetes", "Linux", "Cloud Computing", "CI/CD"],
  analyst: ["Requirement Analysis", "BPMN", "Business Process Modeling", "UML", "Communication"],
  manajemen: ["Project Management", "Scrum", "Agile", "Jira", "Leadership", "Time Management"],
  qa: ["Software Testing", "Usability Testing", "Jira", "Critical Thinking"],
};

// ----------------------------------------------------------------------------
// Judul lowongan yang paling relevan dengan tiap minat. Dipakai untuk menentukan
// lamaran, favorit, dan undangan agar pola perilakunya masuk akal - bukan acak
// sepenuhnya - sehingga sinyal implisit untuk pelatihan model tetap bermakna.
// ----------------------------------------------------------------------------
export const LOWONGAN_MINAT: Record<Minat, string[]> = {
  backend: ["Backend Developer", "Fullstack Developer", "Software Engineer Intern"],
  frontend: ["Frontend Developer", "Fullstack Developer", "UI/UX Designer"],
  fullstack: ["Fullstack Developer", "Backend Developer", "Frontend Developer"],
  mobile: ["Mobile Developer (Flutter)", "Frontend Developer", "Software Engineer Intern"],
  data: ["Data Analyst", "Business Intelligence Developer", "Data Analyst Intern", "Data Engineer"],
  ai: ["Machine Learning Engineer", "Data Scientist", "Data Engineer"],
  uiux: ["UI/UX Designer", "Frontend Developer"],
  security: ["Information Security Analyst", "IT Auditor", "Cloud Engineer"],
  cloud: ["Cloud Engineer", "DevOps Engineer", "Backend Developer"],
  analyst: ["Business Analyst", "System Analyst", "IT Auditor"],
  manajemen: ["IT Project Manager", "Business Analyst", "IT Auditor"],
  qa: ["Quality Assurance Engineer", "Software Engineer Intern", "Backend Developer"],
};

// ----------------------------------------------------------------------------
// Sertifikat yang lazim dimiliki mahasiswa dengan minat tertentu.
// Nilainya adalah judul pada CERTIFICATE_TEMPLATES.
// ----------------------------------------------------------------------------
export const SERTIFIKAT_MINAT: Record<Minat, string[]> = {
  backend: ["Belajar Membuat Aplikasi Back-End untuk Pemula", "Oracle Database SQL Certified Associate"],
  frontend: ["Belajar Dasar Pemrograman Web", "UI/UX Design Bootcamp"],
  fullstack: ["Belajar Membuat Aplikasi Back-End untuk Pemula", "Belajar Dasar Pemrograman Web"],
  mobile: ["Flutter Development Bootcamp", "Belajar Dasar Pemrograman Web"],
  data: ["Google Data Analytics Professional Certificate", "Microsoft Office Specialist: Excel Expert"],
  ai: ["Machine Learning Specialization", "Google Data Analytics Professional Certificate"],
  uiux: ["UI/UX Design Bootcamp", "Digital Marketing Fundamentals"],
  security: ["Fundamental Cyber Security", "Cisco Certified Network Associate (CCNA)"],
  cloud: ["AWS Certified Cloud Practitioner", "Cisco Certified Network Associate (CCNA)"],
  analyst: ["Scrum Fundamentals Certified (SFC)", "Microsoft Office Specialist: Excel Expert"],
  manajemen: ["Scrum Fundamentals Certified (SFC)", "TOEFL ITP - Skor 567"],
  qa: ["Scrum Fundamentals Certified (SFC)", "Belajar Dasar Pemrograman Web"],
};
