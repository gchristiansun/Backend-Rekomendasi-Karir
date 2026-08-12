// ============================================================================
// KATALOG DATA MASTER SINTETIS
// ----------------------------------------------------------------------------
// Berisi definisi statis: skill, universitas, perusahaan, lowongan, kursus,
// sertifikat, dan daftar mahasiswa. Dipakai oleh prisma/seed.ts.
//
// Semua nilai di sini dibuat konsisten satu sama lain: skill yang dipakai
// lowongan/sertifikat/mata kuliah SELALU ada di SKILL_CATALOG, dan perusahaan
// yang punya lowongan SELALU berstatus verified (mengikuti aturan
// requireVerifiedCompany di backend).
// ============================================================================

// ----------------------------------------------------------------------------
// BERKAS SUPABASE
// URL di bawah menunjuk berkas yang memang sudah ada di bucket publik proyek
// ini, sehingga tombol "lihat dokumen" / "unduh sertifikat" benar-benar bisa
// dibuka saat demo, bukan tautan mati.
// ----------------------------------------------------------------------------
const SB = "https://dalskppkopqwrrgtfmjt.supabase.co/storage/v1/object/public";

const LOGO = [
  `${SB}/company-logos/01KWG3VK0D2C7JKZ8XPR0PWNC5/1785135293173-afbffb6b-d539-4891-bc74-93c87eb307c1.jpg`,
  `${SB}/company-logos/01KXGWKQH7GF5DQKCYJTVZAKJW/1785125299863-64e321b9-026a-4956-9398-4567e6e03c64.jpg`,
  `${SB}/company-logos/01KXH0EDJEN6QNMK02A8BHPX76/1785385712316-ce4ce59a-a108-464a-bb03-5d362d6148d1.jpg`,
];

const IZIN = [
  `${SB}/company-documents/izin-usaha/1786352273672-eb102227-2c03-4a10-b7ac-8d7e9e708cc8.pdf`,
  `${SB}/company-documents/izin-usaha/1784052044413-c1e6ac8d-0c08-413b-82bb-c8ff6acb8072.pdf`,
  `${SB}/company-documents/izin-usaha/1784056066157-fe9b68d9-0cf8-4260-b76a-4c2208921f4e.pdf`,
  `${SB}/company-documents/izin-usaha/1786347438422-0087a147-d79e-433a-8856-b58ec35f3ce2.pdf`,
];

const SURAT = [
  `${SB}/company-documents/surat-resmi/1786352258915-942e69e4-5e5d-413f-88f5-b15197cd51c6.pdf`,
  `${SB}/company-documents/surat-resmi/1784052045266-67fee59e-dfd6-473e-add4-ec3dccb00207.pdf`,
  `${SB}/company-documents/surat-resmi/1784056066870-b4c8d429-16c1-439d-98b0-ba01900be373.pdf`,
  `${SB}/company-documents/surat-resmi/1786486756976-4e06d8e8-cf07-4a11-bf5e-a49b0bdac4f3.pdf`,
];

// Berkas sertifikat mahasiswa. Bucket "certificates" bersifat privat, sehingga
// untuk data dummy dipakai berkas PDF publik yang pasti bisa dibuka.
export const CERT_FILE = IZIN[1];

// ----------------------------------------------------------------------------
// SKILL MASTER
// ----------------------------------------------------------------------------
export interface SkillSeed {
  name: string;
  category: string;
}

export const SKILL_CATALOG: SkillSeed[] = [
  // Bahasa pemrograman
  { name: "JavaScript", category: "Bahasa Pemrograman" },
  { name: "TypeScript", category: "Bahasa Pemrograman" },
  { name: "Python", category: "Bahasa Pemrograman" },
  { name: "Java", category: "Bahasa Pemrograman" },
  { name: "PHP", category: "Bahasa Pemrograman" },
  { name: "Kotlin", category: "Bahasa Pemrograman" },
  { name: "Dart", category: "Bahasa Pemrograman" },
  { name: "Go", category: "Bahasa Pemrograman" },
  { name: "R", category: "Bahasa Pemrograman" },
  { name: "SQL", category: "Bahasa Pemrograman" },

  // Framework & library
  { name: "React", category: "Framework & Library" },
  { name: "Next.js", category: "Framework & Library" },
  { name: "Node.js", category: "Framework & Library" },
  { name: "Express", category: "Framework & Library" },
  { name: "Laravel", category: "Framework & Library" },
  { name: "Spring Boot", category: "Framework & Library" },
  { name: "Flutter", category: "Framework & Library" },
  { name: "Vue.js", category: "Framework & Library" },
  { name: "Tailwind CSS", category: "Framework & Library" },

  // Basis data
  { name: "PostgreSQL", category: "Basis Data" },
  { name: "MySQL", category: "Basis Data" },
  { name: "MongoDB", category: "Basis Data" },
  { name: "Redis", category: "Basis Data" },
  { name: "Data Modeling", category: "Basis Data" },
  { name: "ETL", category: "Basis Data" },
  { name: "Data Warehouse", category: "Basis Data" },

  // DevOps & infrastruktur
  { name: "Docker", category: "DevOps & Infrastruktur" },
  { name: "Kubernetes", category: "DevOps & Infrastruktur" },
  { name: "Git", category: "DevOps & Infrastruktur" },
  { name: "CI/CD", category: "DevOps & Infrastruktur" },
  { name: "Linux", category: "DevOps & Infrastruktur" },
  { name: "AWS", category: "DevOps & Infrastruktur" },
  { name: "Google Cloud", category: "DevOps & Infrastruktur" },
  { name: "Nginx", category: "DevOps & Infrastruktur" },
  { name: "REST API", category: "DevOps & Infrastruktur" },
  { name: "GraphQL", category: "DevOps & Infrastruktur" },
  { name: "Cloud Computing", category: "DevOps & Infrastruktur" },

  // Rekayasa perangkat lunak
  { name: "Software Testing", category: "Rekayasa Perangkat Lunak" },
  { name: "Clean Code", category: "Rekayasa Perangkat Lunak" },
  { name: "Design Pattern", category: "Rekayasa Perangkat Lunak" },
  { name: "UML", category: "Rekayasa Perangkat Lunak" },

  // Data & AI
  { name: "Machine Learning", category: "Data & AI" },
  { name: "Deep Learning", category: "Data & AI" },
  { name: "Data Analysis", category: "Data & AI" },
  { name: "Data Visualization", category: "Data & AI" },
  { name: "Pandas", category: "Data & AI" },
  { name: "TensorFlow", category: "Data & AI" },
  { name: "NLP", category: "Data & AI" },
  { name: "Business Intelligence", category: "Data & AI" },
  { name: "Power BI", category: "Data & AI" },
  { name: "Tableau", category: "Data & AI" },
  { name: "Statistika", category: "Data & AI" },

  // Desain & UX
  { name: "UI/UX Design", category: "Desain & UX" },
  { name: "Figma", category: "Desain & UX" },
  { name: "Wireframing", category: "Desain & UX" },
  { name: "Prototyping", category: "Desain & UX" },
  { name: "User Research", category: "Desain & UX" },
  { name: "Usability Testing", category: "Desain & UX" },
  { name: "Design System", category: "Desain & UX" },

  // Analisis & proses bisnis
  { name: "Business Process Modeling", category: "Analisis & Proses Bisnis" },
  { name: "BPMN", category: "Analisis & Proses Bisnis" },
  { name: "Requirement Analysis", category: "Analisis & Proses Bisnis" },
  { name: "System Analysis", category: "Analisis & Proses Bisnis" },
  { name: "Enterprise Architecture", category: "Analisis & Proses Bisnis" },
  { name: "TOGAF", category: "Analisis & Proses Bisnis" },
  { name: "ERP", category: "Analisis & Proses Bisnis" },
  { name: "CRM", category: "Analisis & Proses Bisnis" },
  { name: "Supply Chain Management", category: "Analisis & Proses Bisnis" },

  // Manajemen proyek & tata kelola
  { name: "Project Management", category: "Manajemen & Tata Kelola" },
  { name: "Agile", category: "Manajemen & Tata Kelola" },
  { name: "Scrum", category: "Manajemen & Tata Kelola" },
  { name: "Jira", category: "Manajemen & Tata Kelola" },
  { name: "Risk Management", category: "Manajemen & Tata Kelola" },
  { name: "IT Governance", category: "Manajemen & Tata Kelola" },
  { name: "COBIT", category: "Manajemen & Tata Kelola" },

  // Keamanan & jaringan
  { name: "Information Security", category: "Keamanan & Jaringan" },
  { name: "Network Security", category: "Keamanan & Jaringan" },
  { name: "Cryptography", category: "Keamanan & Jaringan" },
  { name: "Penetration Testing", category: "Keamanan & Jaringan" },
  { name: "Computer Network", category: "Keamanan & Jaringan" },
  { name: "TCP/IP", category: "Keamanan & Jaringan" },
  { name: "Cisco", category: "Keamanan & Jaringan" },

  // Soft skill
  { name: "Problem Solving", category: "Soft Skill" },
  { name: "Communication", category: "Soft Skill" },
  { name: "Teamwork", category: "Soft Skill" },
  { name: "Leadership", category: "Soft Skill" },
  { name: "Critical Thinking", category: "Soft Skill" },
  { name: "Public Speaking", category: "Soft Skill" },
  { name: "Time Management", category: "Soft Skill" },
  { name: "Adaptability", category: "Soft Skill" },

  // Perkantoran
  { name: "Microsoft Excel", category: "Perkantoran" },
  { name: "Microsoft Word", category: "Perkantoran" },
  { name: "Microsoft PowerPoint", category: "Perkantoran" },
  { name: "Google Workspace", category: "Perkantoran" },
];

// ----------------------------------------------------------------------------
// UNIVERSITAS + akun Admin Kampus & Kaprodi
// ----------------------------------------------------------------------------
export interface UniversitySeed {
  key: "TELU" | "ITERA" | "UNSRI";
  name: string;
  code: string;
  address: string;
  city: string;
  website: string;
  admin: { name: string; email: string; phone: string; nip: string };
  kaprodi: { name: string; email: string; phone: string; nip: string };
  faculty: string;
  major: string;
  nimPrefix: string;
}

export const UNIVERSITIES: UniversitySeed[] = [
  {
    key: "TELU",
    name: "Telkom University",
    code: "TELU",
    address: "Jl. Telekomunikasi No. 1, Terusan Buahbatu, Bojongsoang",
    city: "Kabupaten Bandung",
    website: "https://telkomuniversity.ac.id",
    admin: {
      name: "Admin Kampus Tel-U",
      email: "kampus@telkom.ac.id",
      phone: "082116540011",
      nip: "19780512 200501 1 001",
    },
    kaprodi: {
      name: "Dr. Rahmat Hidayat, S.Kom., M.T.",
      email: "kaprodi@telkom.ac.id",
      phone: "082116540022",
      nip: "19820914 200812 1 002",
    },
    faculty: "Fakultas Rekayasa Industri",
    major: "Sistem Informasi",
    nimPrefix: "1202",
  },
  {
    key: "ITERA",
    name: "Institut Teknologi Sumatera",
    code: "ITERA",
    address: "Jl. Terusan Ryacudu, Way Huwi, Jati Agung",
    city: "Lampung Selatan",
    website: "https://itera.ac.id",
    admin: {
      name: "Admin Kampus ITERA",
      email: "kampus@itera.ac.id",
      phone: "081273450011",
      nip: "19850220 201012 2 003",
    },
    kaprodi: {
      name: "Dian Puspita Sari, S.T., M.Kom.",
      email: "kaprodi@itera.ac.id",
      phone: "081273450022",
      nip: "19880730 201404 2 004",
    },
    faculty: "Fakultas Teknologi Industri",
    major: "Teknik Informatika",
    nimPrefix: "1211",
  },
  {
    key: "UNSRI",
    name: "Universitas Sriwijaya",
    code: "UNSRI",
    address: "Jl. Raya Palembang - Prabumulih KM. 32, Indralaya",
    city: "Ogan Ilir",
    website: "https://unsri.ac.id",
    admin: {
      name: "Admin Kampus Unsri",
      email: "kampus@unsri.ac.id",
      phone: "081367890011",
      nip: "19800417 200604 1 005",
    },
    kaprodi: {
      name: "Ir. Bambang Wijaya, M.Kom.",
      email: "kaprodi@unsri.ac.id",
      phone: "081367890022",
      nip: "19790203 200501 1 006",
    },
    faculty: "Fakultas Ilmu Komputer",
    major: "Sistem Informasi",
    nimPrefix: "0902",
  },
];

// ----------------------------------------------------------------------------
// PERUSAHAAN + akun Direktur & HRD
// Status sengaja dibuat bervariasi supaya alur verifikasi Super Admin
// (menunggu / disetujui / ditolak) bisa diuji tanpa membuat data baru.
// ----------------------------------------------------------------------------
export interface CompanySeed {
  key: string;
  name: string;
  industry: string;
  description: string;
  website: string;
  logoUrl: string | null;
  size: string;
  address: string;
  nib: string;
  izinUsahaUrl: string;
  suratResmiUrl: string;
  status: "verified" | "pending" | "rejected";
  /** Berapa hari lalu perusahaan mendaftar. */
  daftarHariLalu: number;
  /** Berapa hari lalu diverifikasi / ditolak (hanya untuk verified & rejected). */
  putusanHariLalu?: number;
  rejectionReason?: string;
  direktur: { name: string; email: string; phone: string; nip: string };
  hrd: { name: string; email: string; phone: string; nip: string };
}

export const COMPANIES: CompanySeed[] = [
  {
    key: "TECHCORP",
    name: "TechCorp Indonesia",
    industry: "Teknologi Informasi",
    description:
      "Software house yang membangun produk digital untuk sektor ritel, kesehatan, dan pendidikan. Berdiri sejak 2015 dengan tim engineering di Jakarta dan Bandung.",
    website: "https://techcorp.co.id",
    logoUrl: LOGO[0],
    size: "201–500 Karyawan",
    address: "Gedung Cyber 2 Lantai 15, Jl. H. R. Rasuna Said Blok X-5, Jakarta Selatan",
    nib: "8120012345678",
    izinUsahaUrl: IZIN[0],
    suratResmiUrl: SURAT[0],
    status: "verified",
    daftarHariLalu: 180,
    putusanHariLalu: 176,
    direktur: {
      name: "Budi Setiawan",
      email: "direktur@techcorp.com",
      phone: "081234567801",
      nip: "TC-DIR-001",
    },
    hrd: {
      name: "Sari Anggraini",
      email: "hrd@techcorp.com",
      phone: "081234567802",
      nip: "TC-HRD-014",
    },
  },
  {
    key: "DATAVIZ",
    name: "DataViz Analytics",
    industry: "Data & Analitik",
    description:
      "Konsultan data analitik yang membantu perusahaan membangun data warehouse, dashboard eksekutif, dan model prediktif berbasis machine learning.",
    website: "https://dataviz.id",
    logoUrl: LOGO[1],
    size: "51–200 Karyawan",
    address: "Jl. Ir. H. Juanda No. 108, Coblong, Kota Bandung",
    nib: "8120023456789",
    izinUsahaUrl: IZIN[1],
    suratResmiUrl: SURAT[1],
    status: "verified",
    daftarHariLalu: 150,
    putusanHariLalu: 147,
    direktur: {
      name: "Andi Nugroho",
      email: "direktur@dataviz.com",
      phone: "081234567803",
      nip: "DV-DIR-001",
    },
    hrd: {
      name: "Maya Rosalina",
      email: "hrd@dataviz.com",
      phone: "081234567804",
      nip: "DV-HRD-007",
    },
  },
  {
    key: "NUSAFIN",
    name: "Nusantara Fintech Group",
    industry: "Keuangan & Fintech",
    description:
      "Penyedia layanan keuangan digital berizin OJK: dompet elektronik, pembayaran tagihan, dan pembiayaan produktif untuk UMKM di seluruh Indonesia.",
    website: "https://nusantarafintech.co.id",
    logoUrl: LOGO[2],
    size: "501–1000 Karyawan",
    address: "Menara Astra Lantai 32, Jl. Jend. Sudirman Kav. 5-6, Jakarta Pusat",
    nib: "8120034567890",
    izinUsahaUrl: IZIN[2],
    suratResmiUrl: SURAT[2],
    status: "verified",
    daftarHariLalu: 95,
    putusanHariLalu: 92,
    direktur: {
      name: "Rina Kartika",
      email: "direktur@nusantarafintech.co.id",
      phone: "081234567805",
      nip: "NF-DIR-001",
    },
    hrd: {
      name: "Doni Prasetya",
      email: "hrd@nusantarafintech.co.id",
      phone: "081234567806",
      nip: "NF-HRD-021",
    },
  },
  {
    key: "SRIWIJAYA",
    name: "Sriwijaya Digital Solusi",
    industry: "Konsultan Teknologi Informasi",
    description:
      "Konsultan TI regional Sumatera Selatan yang mengerjakan sistem informasi pemerintahan daerah dan digitalisasi UMKM.",
    website: "https://sriwijayadigital.co.id",
    logoUrl: null,
    size: "1–50 Karyawan",
    address: "Jl. Basuki Rahmat No. 45, Ilir Timur I, Palembang",
    nib: "8120045678901",
    izinUsahaUrl: IZIN[3],
    suratResmiUrl: SURAT[3],
    status: "pending",
    daftarHariLalu: 6,
    direktur: {
      name: "Hendra Gunawan",
      email: "direktur@sriwijayadigital.co.id",
      phone: "081234567807",
      nip: "SDS-DIR-001",
    },
    hrd: {
      name: "Lestari Ayu",
      email: "hrd@sriwijayadigital.co.id",
      phone: "081234567808",
      nip: "SDS-HRD-003",
    },
  },
  {
    key: "ANDALAS",
    name: "Andalas Logistik Nusantara",
    industry: "Logistik & Rantai Pasok",
    description:
      "Perusahaan logistik dan pergudangan yang sedang membangun sistem pelacakan pengiriman berbasis web dan aplikasi bergerak.",
    website: "https://andalaslogistik.co.id",
    logoUrl: null,
    size: "201–500 Karyawan",
    address: "Jl. Soekarno Hatta No. 88, Rajabasa, Bandar Lampung",
    nib: "8120056789012",
    izinUsahaUrl: IZIN[0],
    suratResmiUrl: SURAT[0],
    status: "pending",
    daftarHariLalu: 2,
    direktur: {
      name: "Fajar Ramadhan",
      email: "direktur@andalaslogistik.co.id",
      phone: "081234567809",
      nip: "ALN-DIR-001",
    },
    hrd: {
      name: "Wulan Safitri",
      email: "hrd@andalaslogistik.co.id",
      phone: "081234567810",
      nip: "ALN-HRD-009",
    },
  },
  {
    key: "BERKAH",
    name: "CV Berkah Teknologi",
    industry: "Teknologi Informasi",
    description: "Penyedia jasa perakitan dan perawatan perangkat keras komputer.",
    website: "https://berkahteknologi.com",
    logoUrl: null,
    size: "1–50 Karyawan",
    address: "Jl. Zainal Abidin Pagar Alam No. 12, Kedaton, Bandar Lampung",
    nib: "8120067890123",
    izinUsahaUrl: IZIN[1],
    suratResmiUrl: SURAT[1],
    status: "rejected",
    daftarHariLalu: 21,
    putusanHariLalu: 18,
    rejectionReason:
      "Dokumen izin usaha yang diunggah sudah kedaluwarsa dan nama pada NIB tidak sama dengan nama perusahaan yang didaftarkan. Silakan unggah ulang NIB serta akta perusahaan yang masih berlaku.",
    direktur: {
      name: "Agus Salim",
      email: "direktur@berkahteknologi.com",
      phone: "081234567811",
      nip: "BT-DIR-001",
    },
    hrd: {
      name: "Nur Aini",
      email: "hrd@berkahteknologi.com",
      phone: "081234567812",
      nip: "BT-HRD-002",
    },
  },
];

// ----------------------------------------------------------------------------
// LOWONGAN
// requirements: tiap baris = satu tanggung jawab + keahlian yang dipakai.
// Teks inilah yang di-embedding dan dicocokkan dengan CLO mahasiswa.
// ----------------------------------------------------------------------------
export interface JobSeed {
  companyKey: string;
  /** "direktur" | "hrd" - siapa yang memposting */
  postedBy: "direktur" | "hrd";
  title: string;
  department: string;
  location: string;
  type: "fulltime" | "parttime" | "internship" | "contract";
  status: "active" | "closed" | "draft";
  salaryMin: number;
  salaryMax: number;
  /** Berapa hari lalu lowongan mulai tayang. */
  tayangHariLalu: number;
  /** Berapa hari dari sekarang batas lamaran (negatif = sudah lewat). */
  deadlineHariLagi: number;
  /** [nama skill, bobot] untuk pencocokan berbasis aturan. */
  skills: [string, number][];
  requirements: { text: string; skills: string[] }[];
}

export const JOBS: JobSeed[] = [
  // ---------------------------- TechCorp Indonesia --------------------------
  {
    companyKey: "TECHCORP",
    postedBy: "hrd",
    title: "Backend Developer",
    department: "Technology",
    location: "Jakarta Selatan",
    type: "fulltime",
    status: "active",
    salaryMin: 8000000,
    salaryMax: 14000000,
    tayangHariLalu: 24,
    deadlineHariLagi: 21,
    skills: [
      ["Node.js", 3],
      ["Express", 2],
      ["PostgreSQL", 3],
      ["REST API", 3],
      ["Docker", 2],
      ["Git", 1],
    ],
    requirements: [
      {
        text: "Merancang dan mengembangkan REST API menggunakan Node.js dan Express untuk melayani aplikasi web maupun aplikasi bergerak.",
        skills: ["Node.js", "Express", "REST API"],
      },
      {
        text: "Merancang struktur basis data relasional, menulis kueri SQL yang efisien, serta menjaga integritas data pada PostgreSQL.",
        skills: ["PostgreSQL", "SQL", "Data Modeling"],
      },
      {
        text: "Melakukan kontainerisasi layanan dengan Docker dan menjalankan proses integrasi berkelanjutan agar penerapan ke server berjalan otomatis.",
        skills: ["Docker", "CI/CD", "Linux"],
      },
      {
        text: "Menulis pengujian unit dan pengujian integrasi untuk memastikan setiap layanan berjalan sesuai spesifikasi sebelum dirilis.",
        skills: ["Software Testing", "Clean Code"],
      },
    ],
  },
  {
    companyKey: "TECHCORP",
    postedBy: "hrd",
    title: "Frontend Developer",
    department: "Technology",
    location: "Kota Bandung",
    type: "fulltime",
    status: "active",
    salaryMin: 7000000,
    salaryMax: 12000000,
    tayangHariLalu: 20,
    deadlineHariLagi: 25,
    skills: [
      ["React", 3],
      ["TypeScript", 3],
      ["JavaScript", 2],
      ["Tailwind CSS", 2],
      ["UI/UX Design", 1],
    ],
    requirements: [
      {
        text: "Membangun antarmuka web yang responsif dan mudah digunakan menggunakan React dan TypeScript sesuai rancangan desainer.",
        skills: ["React", "TypeScript", "Tailwind CSS"],
      },
      {
        text: "Mengintegrasikan antarmuka dengan REST API serta menangani status pemuatan, kesalahan, dan validasi masukan pengguna.",
        skills: ["REST API", "JavaScript"],
      },
      {
        text: "Menerapkan kaidah user experience dan aksesibilitas pada tampilan aplikasi agar nyaman digunakan berbagai kalangan pengguna.",
        skills: ["UI/UX Design", "Usability Testing"],
      },
    ],
  },
  {
    companyKey: "TECHCORP",
    postedBy: "hrd",
    title: "Fullstack Developer",
    department: "Technology",
    location: "Remote",
    type: "fulltime",
    status: "active",
    salaryMin: 10000000,
    salaryMax: 16000000,
    tayangHariLalu: 17,
    deadlineHariLagi: 28,
    skills: [
      ["React", 3],
      ["Node.js", 3],
      ["PostgreSQL", 2],
      ["TypeScript", 2],
      ["Git", 2],
      ["REST API", 2],
    ],
    requirements: [
      {
        text: "Mengembangkan aplikasi web menyeluruh dari antarmuka pengguna hingga layanan di sisi peladen menggunakan React dan Node.js.",
        skills: ["React", "Node.js", "TypeScript"],
      },
      {
        text: "Mengelola basis data aplikasi, mulai dari perancangan skema, migrasi, sampai optimasi kueri.",
        skills: ["PostgreSQL", "SQL", "Data Modeling"],
      },
      {
        text: "Berkolaborasi dalam tim menggunakan Git dan alur kerja berbasis Scrum, termasuk mengikuti sprint planning dan retrospective.",
        skills: ["Git", "Scrum", "Teamwork"],
      },
      {
        text: "Mengidentifikasi dan memperbaiki masalah pada sistem yang sudah berjalan berdasarkan laporan pengguna dan catatan galat.",
        skills: ["Problem Solving", "Clean Code"],
      },
    ],
  },
  {
    companyKey: "TECHCORP",
    postedBy: "direktur",
    title: "Mobile Developer (Flutter)",
    department: "Technology",
    location: "Jakarta Selatan",
    type: "fulltime",
    status: "active",
    salaryMin: 9000000,
    salaryMax: 15000000,
    tayangHariLalu: 13,
    deadlineHariLagi: 32,
    skills: [
      ["Flutter", 3],
      ["Dart", 3],
      ["Kotlin", 2],
      ["REST API", 2],
      ["UI/UX Design", 1],
    ],
    requirements: [
      {
        text: "Merancang dan membangun aplikasi bergerak lintas platform menggunakan Flutter beserta tampilan antarmukanya.",
        skills: ["Flutter", "Dart", "UI/UX Design"],
      },
      {
        text: "Menghubungkan aplikasi bergerak dengan layanan REST API dan menangani penyimpanan data lokal pada perangkat.",
        skills: ["REST API", "Problem Solving"],
      },
      {
        text: "Melakukan pengujian aplikasi pada beragam ukuran layar dan versi sistem operasi sebelum diunggah ke toko aplikasi.",
        skills: ["Software Testing", "Kotlin"],
      },
    ],
  },
  {
    companyKey: "TECHCORP",
    postedBy: "hrd",
    title: "Quality Assurance Engineer",
    department: "Technology",
    location: "Jakarta Selatan",
    type: "fulltime",
    status: "active",
    salaryMin: 7000000,
    salaryMax: 11000000,
    tayangHariLalu: 10,
    deadlineHariLagi: 35,
    skills: [
      ["Software Testing", 3],
      ["Usability Testing", 2],
      ["Jira", 2],
      ["CI/CD", 1],
      ["Critical Thinking", 2],
    ],
    requirements: [
      {
        text: "Menyusun rencana dan skenario pengujian fungsional maupun non-fungsional berdasarkan dokumen kebutuhan sistem.",
        skills: ["Software Testing", "Requirement Analysis"],
      },
      {
        text: "Menjalankan pengujian regresi secara otomatis pada jalur integrasi berkelanjutan setiap kali ada perubahan kode.",
        skills: ["CI/CD", "Software Testing"],
      },
      {
        text: "Mendokumentasikan temuan cacat perangkat lunak secara rinci dan menindaklanjutinya bersama tim pengembang.",
        skills: ["Jira", "Communication", "Critical Thinking"],
      },
    ],
  },
  {
    companyKey: "TECHCORP",
    postedBy: "direktur",
    title: "DevOps Engineer",
    department: "Technology",
    location: "Remote",
    type: "contract",
    status: "active",
    salaryMin: 12000000,
    salaryMax: 20000000,
    tayangHariLalu: 8,
    deadlineHariLagi: 38,
    skills: [
      ["Docker", 3],
      ["Kubernetes", 3],
      ["AWS", 3],
      ["CI/CD", 3],
      ["Linux", 2],
      ["Nginx", 1],
    ],
    requirements: [
      {
        text: "Mengelola infrastruktur komputasi awan beserta layanan pendukungnya agar tersedia, aman, dan hemat biaya.",
        skills: ["AWS", "Cloud Computing", "Linux"],
      },
      {
        text: "Membangun dan memelihara jalur integrasi serta penerapan berkelanjutan untuk seluruh layanan perusahaan.",
        skills: ["CI/CD", "Docker", "Kubernetes"],
      },
      {
        text: "Memantau kinerja sistem, menyiapkan peringatan dini, dan menangani gangguan layanan pada lingkungan produksi.",
        skills: ["Linux", "Nginx", "Problem Solving"],
      },
    ],
  },
  {
    companyKey: "TECHCORP",
    postedBy: "hrd",
    title: "UI/UX Designer",
    department: "Design",
    location: "Kota Bandung",
    type: "fulltime",
    status: "closed",
    salaryMin: 8000000,
    salaryMax: 13000000,
    tayangHariLalu: 60,
    deadlineHariLagi: -12,
    skills: [
      ["Figma", 3],
      ["UI/UX Design", 3],
      ["User Research", 2],
      ["Prototyping", 2],
      ["Design System", 2],
    ],
    requirements: [
      {
        text: "Melakukan riset pengguna dan menyintesis hasilnya menjadi kebutuhan rancangan yang siap dikerjakan.",
        skills: ["User Research", "Requirement Analysis"],
      },
      {
        text: "Membuat wireframe dan prototipe interaktif menggunakan Figma, termasuk penerapan component dan design system.",
        skills: ["Figma", "Prototyping", "Design System"],
      },
      {
        text: "Menguji kegunaan prototipe bersama pengguna nyata lalu memperbaiki rancangan berdasarkan temuan pengujian.",
        skills: ["Usability Testing", "UI/UX Design"],
      },
    ],
  },
  {
    companyKey: "TECHCORP",
    postedBy: "hrd",
    title: "Software Engineer Intern",
    department: "Technology",
    location: "Jakarta Selatan",
    type: "internship",
    status: "active",
    salaryMin: 1500000,
    salaryMax: 2500000,
    tayangHariLalu: 5,
    deadlineHariLagi: 40,
    skills: [
      ["JavaScript", 2],
      ["Git", 2],
      ["Problem Solving", 2],
      ["Teamwork", 1],
    ],
    requirements: [
      {
        text: "Membantu tim pengembang membuat fitur sederhana pada aplikasi web dengan bimbingan mentor.",
        skills: ["JavaScript", "Problem Solving"],
      },
      {
        text: "Mempelajari dasar pemrograman dan algoritma serta menerapkannya untuk menyelesaikan tugas harian.",
        skills: ["Problem Solving", "Critical Thinking"],
      },
      {
        text: "Menggunakan sistem kendali versi Git untuk berkolaborasi dengan anggota tim lain.",
        skills: ["Git", "Teamwork"],
      },
    ],
  },

  // ---------------------------- DataViz Analytics ---------------------------
  {
    companyKey: "DATAVIZ",
    postedBy: "hrd",
    title: "Data Analyst",
    department: "Data",
    location: "Jakarta Selatan",
    type: "fulltime",
    status: "active",
    salaryMin: 8000000,
    salaryMax: 13000000,
    tayangHariLalu: 22,
    deadlineHariLagi: 18,
    skills: [
      ["Data Analysis", 3],
      ["SQL", 3],
      ["Microsoft Excel", 2],
      ["Data Visualization", 2],
      ["Statistika", 2],
    ],
    requirements: [
      {
        text: "Melakukan eksplorasi data sesuai jenis data dan kebutuhan informasi, termasuk statistik deskriptif dan pembersihan data.",
        skills: ["Data Analysis", "Statistika", "Pandas"],
      },
      {
        text: "Menyusun kueri SQL untuk mengambil dan menggabungkan data dari beberapa tabel pada gudang data perusahaan.",
        skills: ["SQL", "Data Warehouse"],
      },
      {
        text: "Menyajikan dan menginterpretasikan data dalam bentuk visualisasi serta laporan yang mudah dipahami manajemen.",
        skills: ["Data Visualization", "Communication", "Microsoft Excel"],
      },
    ],
  },
  {
    companyKey: "DATAVIZ",
    postedBy: "hrd",
    title: "Data Scientist",
    department: "Data",
    location: "Remote",
    type: "fulltime",
    status: "active",
    salaryMin: 12000000,
    salaryMax: 20000000,
    tayangHariLalu: 19,
    deadlineHariLagi: 26,
    skills: [
      ["Python", 3],
      ["Machine Learning", 3],
      ["Data Analysis", 3],
      ["Pandas", 2],
      ["Statistika", 2],
    ],
    requirements: [
      {
        text: "Menerapkan metode penambangan data menggunakan Python untuk menghasilkan solusi pada kasus bisnis nyata.",
        skills: ["Python", "Machine Learning", "Pandas"],
      },
      {
        text: "Membangun model pembelajaran mesin terbimbing maupun tak terbimbing lalu mengevaluasi akurasinya.",
        skills: ["Machine Learning", "Statistika"],
      },
      {
        text: "Membangun model statistika untuk menganalisis, memprediksi, dan mendukung pengambilan keputusan bisnis.",
        skills: ["Statistika", "Data Analysis"],
      },
      {
        text: "Mengomunikasikan hasil pemodelan kepada pemangku kepentingan non-teknis melalui presentasi dan dokumentasi.",
        skills: ["Communication", "Public Speaking", "Data Visualization"],
      },
    ],
  },
  {
    companyKey: "DATAVIZ",
    postedBy: "direktur",
    title: "Machine Learning Engineer",
    department: "Data",
    location: "Jakarta Selatan",
    type: "fulltime",
    status: "active",
    salaryMin: 13000000,
    salaryMax: 22000000,
    tayangHariLalu: 15,
    deadlineHariLagi: 30,
    skills: [
      ["Machine Learning", 3],
      ["Deep Learning", 3],
      ["Python", 3],
      ["TensorFlow", 2],
      ["NLP", 2],
      ["Docker", 1],
    ],
    requirements: [
      {
        text: "Menguasai dasar jaringan syaraf tiruan dan menerapkannya untuk membangun model pembelajaran mendalam.",
        skills: ["Deep Learning", "TensorFlow"],
      },
      {
        text: "Membuat aplikasi berbasis kecerdasan buatan mulai dari penyiapan data, pelatihan model, sampai penyajian layanan prediksi.",
        skills: ["Machine Learning", "Python", "NLP"],
      },
      {
        text: "Menerapkan model ke lingkungan produksi dalam bentuk layanan terkontainer yang dapat diskalakan.",
        skills: ["Docker", "Cloud Computing"],
      },
    ],
  },
  {
    companyKey: "DATAVIZ",
    postedBy: "hrd",
    title: "Business Intelligence Developer",
    department: "Data",
    location: "Kota Bandung",
    type: "fulltime",
    status: "active",
    salaryMin: 9000000,
    salaryMax: 15000000,
    tayangHariLalu: 11,
    deadlineHariLagi: 24,
    skills: [
      ["Business Intelligence", 3],
      ["Data Warehouse", 3],
      ["ETL", 3],
      ["Power BI", 2],
      ["SQL", 2],
    ],
    requirements: [
      {
        text: "Menganalisis dan mengolah sumber data untuk pembangunan gudang data, termasuk merancang skema bintang dan proses ETL.",
        skills: ["Data Warehouse", "ETL", "Data Modeling"],
      },
      {
        text: "Merancang sistem informasi yang mendukung organisasi menjadi data-driven melalui dasbor dan laporan analitik.",
        skills: ["Business Intelligence", "Power BI"],
      },
      {
        text: "Memastikan kualitas dan konsistensi data yang disajikan pada dasbor eksekutif setiap periode pelaporan.",
        skills: ["SQL", "Data Analysis", "Critical Thinking"],
      },
    ],
  },
  {
    companyKey: "DATAVIZ",
    postedBy: "hrd",
    title: "Data Engineer",
    department: "Data",
    location: "Jakarta Selatan",
    type: "fulltime",
    status: "draft",
    salaryMin: 11000000,
    salaryMax: 18000000,
    tayangHariLalu: 3,
    deadlineHariLagi: 45,
    skills: [
      ["ETL", 3],
      ["Python", 2],
      ["PostgreSQL", 2],
      ["Docker", 2],
      ["Data Warehouse", 3],
    ],
    requirements: [
      {
        text: "Membangun dan memelihara alur pemindahan data dari berbagai sumber ke gudang data perusahaan.",
        skills: ["ETL", "Python", "Data Warehouse"],
      },
      {
        text: "Mengelola sistem manajemen basis data serta menjaga performa kueri pada volume data besar.",
        skills: ["PostgreSQL", "SQL"],
      },
    ],
  },
  {
    companyKey: "DATAVIZ",
    postedBy: "hrd",
    title: "Data Analyst Intern",
    department: "Data",
    location: "Kota Bandung",
    type: "internship",
    status: "active",
    salaryMin: 1500000,
    salaryMax: 2000000,
    tayangHariLalu: 6,
    deadlineHariLagi: 34,
    skills: [
      ["Microsoft Excel", 2],
      ["Data Analysis", 2],
      ["SQL", 1],
      ["Statistika", 1],
    ],
    requirements: [
      {
        text: "Membantu merapikan dan membersihkan kumpulan data mentah sebelum diolah tim analis.",
        skills: ["Data Analysis", "Microsoft Excel"],
      },
      {
        text: "Menghitung dan menyajikan statistik deskriptif sederhana untuk kebutuhan laporan bulanan.",
        skills: ["Statistika", "Data Visualization"],
      },
    ],
  },

  // ------------------------ Nusantara Fintech Group -------------------------
  {
    companyKey: "NUSAFIN",
    postedBy: "hrd",
    title: "Business Analyst",
    department: "Business",
    location: "Jakarta Pusat",
    type: "fulltime",
    status: "active",
    salaryMin: 9000000,
    salaryMax: 15000000,
    tayangHariLalu: 21,
    deadlineHariLagi: 20,
    skills: [
      ["Requirement Analysis", 3],
      ["Business Process Modeling", 3],
      ["BPMN", 2],
      ["UML", 2],
      ["Communication", 2],
    ],
    requirements: [
      {
        text: "Menggali kebutuhan pengguna melalui wawancara dan observasi, lalu menuangkannya menjadi dokumen kebutuhan sistem.",
        skills: ["Requirement Analysis", "Communication"],
      },
      {
        text: "Membuat model proses bisnis tingkat dasar maupun lanjut menggunakan notasi BPMN untuk menggambarkan proses berjalan dan usulan.",
        skills: ["BPMN", "Business Process Modeling"],
      },
      {
        text: "Menyusun pemodelan berorientasi objek seperti use case dan sequence diagram sebagai jembatan ke tim pengembang.",
        skills: ["UML", "System Analysis"],
      },
      {
        text: "Memfasilitasi diskusi antara pemangku kepentingan bisnis dan tim teknis agar solusi yang dibangun tepat sasaran.",
        skills: ["Communication", "Teamwork", "Critical Thinking"],
      },
    ],
  },
  {
    companyKey: "NUSAFIN",
    postedBy: "direktur",
    title: "IT Project Manager",
    department: "Technology",
    location: "Jakarta Pusat",
    type: "fulltime",
    status: "active",
    salaryMin: 15000000,
    salaryMax: 25000000,
    tayangHariLalu: 18,
    deadlineHariLagi: 22,
    skills: [
      ["Project Management", 3],
      ["Agile", 3],
      ["Scrum", 3],
      ["Jira", 2],
      ["Risk Management", 2],
      ["Leadership", 2],
    ],
    requirements: [
      {
        text: "Menyusun perencanaan proyek sistem informasi mulai dari lingkup, jadwal, anggaran, sampai rencana mitigasi risiko.",
        skills: ["Project Management", "Risk Management"],
      },
      {
        text: "Menerapkan pengelolaan proyek berbasis agile dengan kerangka kerja Scrum beserta seluruh aktivitas sprint-nya.",
        skills: ["Agile", "Scrum", "Jira"],
      },
      {
        text: "Memimpin tim lintas fungsi, membagi tugas, dan memastikan setiap anggota berkontribusi sesuai perannya.",
        skills: ["Leadership", "Teamwork", "Time Management"],
      },
      {
        text: "Melaporkan kemajuan proyek secara berkala kepada manajemen dalam bentuk dokumen dan presentasi profesional.",
        skills: ["Communication", "Public Speaking"],
      },
    ],
  },
  {
    companyKey: "NUSAFIN",
    postedBy: "hrd",
    title: "Information Security Analyst",
    department: "Technology",
    location: "Jakarta Pusat",
    type: "fulltime",
    status: "active",
    salaryMin: 12000000,
    salaryMax: 20000000,
    tayangHariLalu: 14,
    deadlineHariLagi: 27,
    skills: [
      ["Information Security", 3],
      ["Network Security", 3],
      ["Cryptography", 2],
      ["Penetration Testing", 2],
      ["Risk Management", 2],
    ],
    requirements: [
      {
        text: "Mengidentifikasi kerentanan dan ancaman keamanan sistem informasi serta menyusun rekomendasi penanganannya.",
        skills: ["Information Security", "Risk Management"],
      },
      {
        text: "Menerapkan teknik dan perangkat lunak terkini untuk mengamankan data dan layanan keuangan digital perusahaan.",
        skills: ["Network Security", "Cryptography"],
      },
      {
        text: "Melakukan pengujian penetrasi berkala pada aplikasi dan infrastruktur, lalu melaporkan temuannya.",
        skills: ["Penetration Testing", "Computer Network"],
      },
    ],
  },
  {
    companyKey: "NUSAFIN",
    postedBy: "hrd",
    title: "IT Auditor",
    department: "Finance",
    location: "Jakarta Pusat",
    type: "fulltime",
    status: "active",
    salaryMin: 10000000,
    salaryMax: 16000000,
    tayangHariLalu: 9,
    deadlineHariLagi: 29,
    skills: [
      ["IT Governance", 3],
      ["COBIT", 3],
      ["Risk Management", 2],
      ["Information Security", 2],
      ["Communication", 1],
    ],
    requirements: [
      {
        text: "Melakukan asesmen dan analisis kesenjangan penerapan tata kelola teknologi informasi berdasarkan kerangka kerja industri.",
        skills: ["IT Governance", "COBIT"],
      },
      {
        text: "Menentukan lingkup dan tujuan audit prioritas berdasarkan faktor rancangan serta profil risiko organisasi.",
        skills: ["Risk Management", "Critical Thinking"],
      },
      {
        text: "Menyusun laporan audit yang terstruktur beserta rekomendasi perbaikan bagi manajemen.",
        skills: ["Communication", "Microsoft Word"],
      },
    ],
  },
  {
    companyKey: "NUSAFIN",
    postedBy: "hrd",
    title: "System Analyst",
    department: "Technology",
    location: "Palembang",
    type: "fulltime",
    status: "closed",
    salaryMin: 9000000,
    salaryMax: 14000000,
    tayangHariLalu: 70,
    deadlineHariLagi: -25,
    skills: [
      ["System Analysis", 3],
      ["Requirement Analysis", 3],
      ["UML", 2],
      ["Data Modeling", 2],
      ["ERP", 1],
    ],
    requirements: [
      {
        text: "Mengidentifikasi kebutuhan sistem informasi pada konteks enterprise melalui analisis proses bisnis berjalan.",
        skills: ["System Analysis", "Requirement Analysis"],
      },
      {
        text: "Menerjemahkan kebutuhan bisnis menjadi rancangan sistem berupa pemodelan objek dan struktur data.",
        skills: ["UML", "Data Modeling"],
      },
    ],
  },
  {
    companyKey: "NUSAFIN",
    postedBy: "direktur",
    title: "Cloud Engineer",
    department: "Technology",
    location: "Remote",
    type: "parttime",
    status: "active",
    salaryMin: 10000000,
    salaryMax: 17000000,
    tayangHariLalu: 4,
    deadlineHariLagi: 33,
    skills: [
      ["Cloud Computing", 3],
      ["AWS", 3],
      ["Google Cloud", 2],
      ["Kubernetes", 2],
      ["Linux", 2],
    ],
    requirements: [
      {
        text: "Mengidentifikasi arsitektur dan infrastruktur komputasi awan yang sesuai dengan kebutuhan serta anggaran perusahaan.",
        skills: ["Cloud Computing", "AWS"],
      },
      {
        text: "Menganalisis masalah inti komputasi awan meliputi infrastruktur, layanan, dan keamanannya, lalu menyusun rekomendasi solusi.",
        skills: ["Cloud Computing", "Google Cloud", "Information Security"],
      },
      {
        text: "Mengelola klaster kontainer dan otomasi penskalaan layanan pada lingkungan produksi.",
        skills: ["Kubernetes", "Linux"],
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// KURSUS DARING (rekomendasi peningkatan kompetensi)
// ----------------------------------------------------------------------------
export const ONLINE_COURSES: {
  title: string;
  provider: string;
  url: string;
  level: string;
  description: string;
  skills: string[];
}[] = [
  {
    title: "Belajar Membuat Aplikasi Back-End untuk Pemula",
    provider: "Dicoding",
    url: "https://www.dicoding.com/academies/261",
    level: "beginner",
    description:
      "Membangun RESTful API dengan Node.js dan Express, mulai dari routing, validasi, hingga penerapan ke peladen.",
    skills: ["Node.js", "Express", "REST API"],
  },
  {
    title: "React - The Complete Guide",
    provider: "Udemy",
    url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
    level: "intermediate",
    description:
      "Pengembangan antarmuka web modern dengan React, hooks, manajemen status, dan TypeScript.",
    skills: ["React", "TypeScript", "JavaScript"],
  },
  {
    title: "Machine Learning Specialization",
    provider: "Coursera",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    level: "intermediate",
    description:
      "Dasar pembelajaran mesin terbimbing dan tak terbimbing beserta praktik implementasinya menggunakan Python.",
    skills: ["Machine Learning", "Python", "Statistika"],
  },
  {
    title: "Google Data Analytics Professional Certificate",
    provider: "Coursera",
    url: "https://www.coursera.org/professional-certificates/google-data-analytics",
    level: "beginner",
    description:
      "Alur kerja analis data: pembersihan data, analisis dengan SQL dan spreadsheet, sampai visualisasi hasil.",
    skills: ["Data Analysis", "SQL", "Data Visualization", "Microsoft Excel"],
  },
  {
    title: "PostgreSQL untuk Pengembang Aplikasi",
    provider: "Dicoding",
    url: "https://www.dicoding.com/academies/postgresql",
    level: "intermediate",
    description:
      "Perancangan skema relasional, penulisan kueri lanjutan, indeks, dan optimasi performa PostgreSQL.",
    skills: ["PostgreSQL", "SQL", "Data Modeling"],
  },
  {
    title: "Docker & Kubernetes: The Practical Guide",
    provider: "Udemy",
    url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
    level: "advanced",
    description:
      "Kontainerisasi aplikasi dengan Docker dan orkestrasi layanan menggunakan Kubernetes di lingkungan produksi.",
    skills: ["Docker", "Kubernetes", "CI/CD"],
  },
  {
    title: "Belajar Dasar UX Design",
    provider: "Dicoding",
    url: "https://www.dicoding.com/academies/ux-design",
    level: "beginner",
    description:
      "Proses design thinking, riset pengguna, pembuatan wireframe, hingga pengujian kegunaan prototipe.",
    skills: ["UI/UX Design", "User Research", "Wireframing", "Usability Testing"],
  },
  {
    title: "Figma UI/UX Design Essentials",
    provider: "Udemy",
    url: "https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/",
    level: "beginner",
    description:
      "Penguasaan Figma: component, variant, autolayout, dan penyusunan design system yang konsisten.",
    skills: ["Figma", "Design System", "Prototyping"],
  },
  {
    title: "AWS Certified Cloud Practitioner Essentials",
    provider: "AWS Skill Builder",
    url: "https://explore.skillbuilder.aws/learn",
    level: "beginner",
    description:
      "Konsep dasar komputasi awan, layanan inti AWS, model harga, serta praktik keamanan di awan.",
    skills: ["AWS", "Cloud Computing", "Information Security"],
  },
  {
    title: "Manajemen Proyek dengan Scrum",
    provider: "MySkill",
    url: "https://myskill.id/course/scrum",
    level: "intermediate",
    description:
      "Peran, artefak, dan aktivitas dalam kerangka kerja Scrum beserta praktik pengelolaan backlog dan sprint.",
    skills: ["Scrum", "Agile", "Project Management", "Jira"],
  },
  {
    title: "Business Intelligence dengan Power BI",
    provider: "MySkill",
    url: "https://myskill.id/course/power-bi",
    level: "intermediate",
    description:
      "Pemodelan data, DAX, dan pembuatan dasbor interaktif untuk kebutuhan pelaporan manajemen.",
    skills: ["Power BI", "Business Intelligence", "Data Visualization"],
  },
  {
    title: "Keamanan Siber untuk Pemula",
    provider: "Cisco Networking Academy",
    url: "https://www.netacad.com/courses/cybersecurity",
    level: "beginner",
    description:
      "Pengenalan ancaman siber, prinsip keamanan jaringan, kriptografi dasar, dan praktik perlindungan data.",
    skills: ["Information Security", "Network Security", "Cryptography"],
  },
];

// ----------------------------------------------------------------------------
// TEMPLAT SERTIFIKAT MAHASISWA
// ----------------------------------------------------------------------------
export const CERTIFICATE_TEMPLATES: {
  title: string;
  issuer: string;
  skills: string[];
}[] = [
  {
    title: "Belajar Membuat Aplikasi Back-End untuk Pemula",
    issuer: "Dicoding Indonesia",
    skills: ["Node.js", "Express", "REST API"],
  },
  {
    title: "Belajar Dasar Pemrograman Web",
    issuer: "Dicoding Indonesia",
    skills: ["JavaScript", "PHP"],
  },
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    skills: ["AWS", "Cloud Computing"],
  },
  {
    title: "Google Data Analytics Professional Certificate",
    issuer: "Google via Coursera",
    skills: ["Data Analysis", "SQL", "Data Visualization"],
  },
  {
    title: "Machine Learning Specialization",
    issuer: "DeepLearning.AI via Coursera",
    skills: ["Machine Learning", "Python"],
  },
  {
    title: "Cisco Certified Network Associate (CCNA)",
    issuer: "Cisco Networking Academy",
    skills: ["Computer Network", "TCP/IP", "Cisco"],
  },
  {
    title: "Scrum Fundamentals Certified (SFC)",
    issuer: "SCRUMstudy",
    skills: ["Scrum", "Agile", "Project Management"],
  },
  {
    title: "UI/UX Design Bootcamp",
    issuer: "Purwadhika Digital Technology School",
    skills: ["UI/UX Design", "Figma", "Prototyping"],
  },
  {
    title: "Oracle Database SQL Certified Associate",
    issuer: "Oracle University",
    skills: ["SQL", "Data Modeling"],
  },
  {
    title: "Microsoft Office Specialist: Excel Expert",
    issuer: "Microsoft",
    skills: ["Microsoft Excel", "Data Analysis"],
  },
  {
    title: "TOEFL ITP - Skor 567",
    issuer: "ETS via Lembaga Bahasa Kampus",
    skills: ["Communication"],
  },
  {
    title: "Flutter Development Bootcamp",
    issuer: "Hacktiv8",
    skills: ["Flutter", "Dart"],
  },
  {
    title: "Fundamental Cyber Security",
    issuer: "Badan Siber dan Sandi Negara",
    skills: ["Information Security", "Network Security"],
  },
  {
    title: "Digital Marketing Fundamentals",
    issuer: "Google Digital Garage",
    skills: ["Communication", "Data Analysis"],
  },
];
