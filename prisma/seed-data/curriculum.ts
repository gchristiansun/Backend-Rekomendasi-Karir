// ============================================================================
// DATA KURIKULUM
// ----------------------------------------------------------------------------
// Dua bagian:
//   1. SUBJECT_META  - metadata (kode, SKS, semester, keahlian) untuk 48 mata
//      kuliah ASLI yang sudah ada di database beserta 164 CLO-nya. Baris-baris
//      itu TIDAK dibuat ulang oleh seed, hanya dilengkapi kolom kosongnya.
//   2. EXTRA_SUBJECTS - mata kuliah + CLO sintetis untuk ITERA dan Unsri,
//      supaya dasbor Admin Kampus kedua universitas itu tidak kosong dan
//      mahasiswanya tetap bisa dicocokkan secara semantik.
//
// Kunci pencocokan bagian 1 adalah NAMA mata kuliah (kolom unik di schema).
// ============================================================================

export interface SubjectMeta {
  code: string;
  sks: number;
  semester: number;
  /** Keahlian yang dibina mata kuliah ini; dibagikan ke CLO-nya secara berurutan. */
  skills: string[];
}

// ----------------------------------------------------------------------------
// 48 MATA KULIAH ASLI - Prodi Sistem Informasi, Telkom University
// Total 145 SKS tersebar di 8 semester.
// ----------------------------------------------------------------------------
export const SUBJECT_META: Record<string, SubjectMeta> = {
  // ------------------------------- Semester 1 -------------------------------
  "Pengantaran Sistem Informasi": {
    code: "SI1101",
    sks: 3,
    semester: 1,
    skills: ["System Analysis", "Cloud Computing", "Communication"],
  },
  "Algoritma dan Pemrograman": {
    code: "SI1102",
    sks: 4,
    semester: 1,
    skills: ["Python", "Problem Solving", "Critical Thinking"],
  },
  "Matematika untuk Sistem Informasi": {
    code: "SI1103",
    sks: 3,
    semester: 1,
    skills: ["Problem Solving", "Statistika", "Critical Thinking"],
  },
  "Bahasa Indonesia": {
    code: "UM1101",
    sks: 2,
    semester: 1,
    skills: ["Communication", "Microsoft Word", "Critical Thinking"],
  },
  Pancasila: {
    code: "UM1102",
    sks: 2,
    semester: 1,
    skills: ["Critical Thinking", "Communication", "Teamwork"],
  },
  "Internalisasi Budaya dan Pembentukan Karakter": {
    code: "UM1103",
    sks: 2,
    semester: 1,
    skills: ["Teamwork", "Adaptability", "Leadership"],
  },

  // ------------------------------- Semester 2 -------------------------------
  "Pemrograman Berorientasi Objek": {
    code: "SI1204",
    sks: 4,
    semester: 2,
    skills: ["Java", "UML", "Design Pattern", "Clean Code"],
  },
  "Matematika Diskrit": {
    code: "SI1205",
    sks: 3,
    semester: 2,
    skills: ["Problem Solving", "Critical Thinking"],
  },
  "Sistem Basis Data": {
    code: "SI1206",
    sks: 4,
    semester: 2,
    skills: ["SQL", "PostgreSQL", "MySQL", "Data Modeling", "MongoDB"],
  },
  "Bahasa Inggris": {
    code: "UM1204",
    sks: 2,
    semester: 2,
    skills: ["Communication", "Public Speaking", "Adaptability"],
  },
  "Design Thinking": {
    code: "SI1207",
    sks: 3,
    semester: 2,
    skills: ["User Research", "Prototyping", "Critical Thinking"],
  },
  "Probabilitas dan Statistik": {
    code: "SI1208",
    sks: 3,
    semester: 2,
    skills: ["Statistika", "Data Analysis", "R"],
  },

  // ------------------------------- Semester 3 -------------------------------
  "Sistem Operasi": {
    code: "SI2109",
    sks: 3,
    semester: 3,
    skills: ["Linux", "Problem Solving", "Computer Network"],
  },
  "Jaringan Komputer": {
    code: "SI2110",
    sks: 3,
    semester: 3,
    skills: ["Computer Network", "TCP/IP", "Cisco", "Network Security"],
  },
  "Pemodelan Proses Bisnis": {
    code: "SI2111",
    sks: 3,
    semester: 3,
    skills: ["BPMN", "Business Process Modeling", "Requirement Analysis", "Communication"],
  },
  "Analisis dan Perancangan Sistem Informasi": {
    code: "SI2112",
    sks: 4,
    semester: 3,
    skills: ["Requirement Analysis", "System Analysis", "UML", "Teamwork"],
  },
  "Statistika Industri": {
    code: "SI2113",
    sks: 3,
    semester: 3,
    skills: ["Statistika", "Data Analysis", "R", "Microsoft Excel"],
  },
  "Kepemimpinan dan Komunikasi Interpersonal": {
    code: "UM2105",
    sks: 2,
    semester: 3,
    skills: ["Leadership", "Communication", "Teamwork", "Public Speaking"],
  },

  // ------------------------------- Semester 4 -------------------------------
  "Pengembangan Aplikasi Website": {
    code: "SI2214",
    sks: 4,
    semester: 4,
    skills: ["PHP", "JavaScript", "Laravel", "MySQL", "Tailwind CSS"],
  },
  "Sistem Enterprise": {
    code: "SI2215",
    sks: 3,
    semester: 4,
    skills: ["ERP", "Business Process Modeling", "Supply Chain Management"],
  },
  "Manajemen Rantai Pasok": {
    code: "SI2216",
    sks: 3,
    semester: 4,
    skills: ["Supply Chain Management", "Data Analysis", "Microsoft Excel"],
  },
  "Perancangan Interaksi": {
    code: "SI2217",
    sks: 3,
    semester: 4,
    skills: ["UI/UX Design", "User Research", "Wireframing", "Usability Testing"],
  },
  "Penambangan Data": {
    code: "SI2218",
    sks: 3,
    semester: 4,
    skills: ["Data Analysis", "Machine Learning", "Python", "Pandas", "Data Visualization"],
  },
  "Manajemen Sumber Daya Manusia": {
    code: "SI2219",
    sks: 3,
    semester: 4,
    skills: ["Leadership", "Communication", "Time Management", "Microsoft Excel"],
  },

  // ------------------------------- Semester 5 -------------------------------
  "Arsitektur dan Pengembangan Backend": {
    code: "SI3120",
    sks: 4,
    semester: 5,
    skills: ["Node.js", "Express", "REST API", "Docker", "PostgreSQL"],
  },
  "Pengembangan Aplikasi Bergerak": {
    code: "SI3121",
    sks: 4,
    semester: 5,
    skills: ["Flutter", "Dart", "Kotlin", "UI/UX Design", "REST API"],
  },
  "Arsitektur Enterprise": {
    code: "SI3122",
    sks: 3,
    semester: 5,
    skills: ["Enterprise Architecture", "TOGAF", "Business Process Modeling"],
  },
  "Manajemen Proyek Sistem Informasi": {
    code: "SI3123",
    sks: 3,
    semester: 5,
    skills: ["Project Management", "Agile", "Scrum", "Jira", "Risk Management"],
  },
  "Data Warehouse & Business Intelligence": {
    code: "SI3124",
    sks: 3,
    semester: 5,
    skills: ["Data Warehouse", "Business Intelligence", "ETL", "SQL", "Power BI"],
  },
  Kewirausahaan: {
    code: "UM3106",
    sks: 2,
    semester: 5,
    skills: ["Leadership", "Communication", "Critical Thinking"],
  },

  // ------------------------------- Semester 6 -------------------------------
  "Proyek Perangkat Lunak": {
    code: "SI3225",
    sks: 4,
    semester: 6,
    skills: ["Agile", "Scrum", "Git", "Jira", "Software Testing"],
  },
  "Kecerdasan Artifisial dan Penerapannya": {
    code: "SI3226",
    sks: 3,
    semester: 6,
    skills: ["Machine Learning", "Deep Learning", "Python", "TensorFlow", "NLP"],
  },
  "Keamanan Sistem Informasi": {
    code: "SI3227",
    sks: 3,
    semester: 6,
    skills: ["Information Security", "Network Security", "Cryptography", "Penetration Testing"],
  },
  "Pengujian dan Implementasi Sistem": {
    code: "SI3228",
    sks: 3,
    semester: 6,
    skills: ["Software Testing", "Usability Testing", "CI/CD", "Risk Management"],
  },
  "Integrasi Aplikasi Enterprise": {
    code: "SI3229",
    sks: 3,
    semester: 6,
    skills: ["REST API", "GraphQL", "ERP", "System Analysis"],
  },
  "Tata Kelola dan Managemen Teknologi Informasi": {
    code: "SI3230",
    sks: 3,
    semester: 6,
    skills: ["IT Governance", "COBIT", "Risk Management", "Enterprise Architecture"],
  },
  "Pengembangan UI Lanjut": {
    code: "SI3231",
    sks: 3,
    semester: 6,
    skills: ["Figma", "UI/UX Design", "Design System", "Prototyping", "Usability Testing"],
  },

  // ------------------------------- Semester 7 -------------------------------
  "Kerja Praktek dan Pengabdian Masyarakat": {
    code: "SI4132",
    sks: 3,
    semester: 7,
    skills: ["Communication", "Time Management", "Problem Solving", "Adaptability"],
  },
  "Metode Penelitian Dan Penyusunan Karya Ilmiah": {
    code: "SI4133",
    sks: 3,
    semester: 7,
    skills: ["Data Analysis", "Critical Thinking", "Communication", "Statistika"],
  },
  "Komputasi Awan": {
    code: "SI4134",
    sks: 3,
    semester: 7,
    skills: ["Cloud Computing", "AWS", "Docker", "Kubernetes", "Linux"],
  },
  "Manajemen Data Enterprise": {
    code: "SI4135",
    sks: 3,
    semester: 7,
    skills: ["Data Modeling", "IT Governance", "SQL", "Data Warehouse"],
  },
  "Implementasi Arsitektur Enterprise": {
    code: "SI4136",
    sks: 3,
    semester: 7,
    skills: ["Enterprise Architecture", "ERP", "Project Management"],
  },
  "Sistem Manajemen Hubungan Pelanggan": {
    code: "SI4137",
    sks: 3,
    semester: 7,
    skills: ["CRM", "Data Analysis", "Business Intelligence", "Communication"],
  },
  "Adopsi Teknologi Informasi": {
    code: "SI4138",
    sks: 3,
    semester: 7,
    skills: ["Business Process Modeling", "Requirement Analysis", "Critical Thinking"],
  },
  "Etika Profesi": {
    code: "UM4107",
    sks: 2,
    semester: 7,
    skills: ["Information Security", "Critical Thinking", "Communication"],
  },

  // ------------------------------- Semester 8 -------------------------------
  "Capstone Design & Project": {
    code: "SI4239",
    sks: 4,
    semester: 8,
    skills: [
      "Project Management",
      "Teamwork",
      "System Analysis",
      "Problem Solving",
      "Public Speaking",
    ],
  },
  "Pemerintahan Elektronik dan Kota Cerdas": {
    code: "SI4240",
    sks: 3,
    semester: 8,
    skills: ["System Analysis", "Enterprise Architecture", "Critical Thinking"],
  },
  "Pelatihan dan Sertifikasi": {
    code: "SI4241",
    sks: 2,
    semester: 8,
    skills: ["Public Speaking", "Communication", "Time Management"],
  },
};

// ----------------------------------------------------------------------------
// MATA KULIAH SINTETIS (ITERA & Universitas Sriwijaya)
// Ditulis dengan gaya rumusan CLO yang sama dengan data asli supaya hasil
// embedding-nya sebanding saat dicocokkan dengan tanggung jawab lowongan.
// ----------------------------------------------------------------------------
export interface ExtraSubject {
  universityKey: "ITERA" | "UNSRI";
  code: string;
  name: string;
  sks: number;
  semester: number;
  skills: string[];
  clos: { code: string; text: string; paraphrase: string }[];
}

export const EXTRA_SUBJECTS: ExtraSubject[] = [
  // =========================== Institut Teknologi Sumatera ==================
  {
    universityKey: "ITERA",
    code: "IF2104",
    name: "Interaksi Manusia dan Komputer",
    sks: 3,
    semester: 3,
    skills: ["UI/UX Design", "User Research", "Usability Testing", "Wireframing"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan prinsip dasar interaksi manusia dan komputer beserta faktor manusia yang memengaruhinya.",
        paraphrase:
          "Mampu menjelaskan prinsip dasar interaksi manusia dan komputer, meliputi model mental pengguna, prinsip usability, serta faktor manusia yang memengaruhi perancangan antarmuka.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu merancang antarmuka pengguna berdasarkan hasil analisis kebutuhan pengguna.",
        paraphrase:
          "Mampu merancang antarmuka pengguna melalui identifikasi kebutuhan, pembuatan wireframe, dan penyusunan alur navigasi yang mudah dipahami pengguna.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu melakukan evaluasi kegunaan terhadap rancangan antarmuka yang telah dibuat.",
        paraphrase:
          "Mampu melakukan pengujian kegunaan pada prototipe antarmuka, menganalisis temuan pengujian, serta memperbaiki rancangan berdasarkan hasil evaluasi.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF2101",
    name: "Struktur Data dan Algoritma Lanjut",
    sks: 3,
    semester: 3,
    skills: ["Problem Solving", "Java", "Critical Thinking", "Clean Code"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan berbagai struktur data linier dan non-linier beserta karakteristiknya.",
        paraphrase:
          "Mampu menjelaskan struktur data linier dan non-linier seperti senarai berantai, tumpukan, antrean, pohon, dan graf, beserta karakteristik penggunaannya.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menganalisis kompleksitas algoritma untuk memilih solusi yang efisien.",
        paraphrase:
          "Mampu menganalisis kompleksitas waktu dan ruang suatu algoritma, serta membandingkan beberapa alternatif algoritma untuk memilih solusi paling efisien.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu mengimplementasikan struktur data dan algoritma untuk menyelesaikan permasalahan nyata.",
        paraphrase:
          "Mampu mengimplementasikan struktur data dan algoritma pencarian serta pengurutan dalam bahasa pemrograman untuk menyelesaikan permasalahan komputasi nyata.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF2102",
    name: "Rekayasa Perangkat Lunak",
    sks: 3,
    semester: 4,
    skills: ["UML", "Software Testing", "Agile", "Requirement Analysis", "Design Pattern"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan siklus hidup pengembangan perangkat lunak beserta model prosesnya.",
        paraphrase:
          "Mampu menjelaskan siklus hidup pengembangan perangkat lunak, membandingkan model waterfall, spiral, dan agile, serta menentukan model yang sesuai kebutuhan proyek.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu melakukan analisis kebutuhan dan menuangkannya ke dalam dokumen spesifikasi.",
        paraphrase:
          "Mampu menggali dan menganalisis kebutuhan perangkat lunak dari pemangku kepentingan, lalu menyusunnya menjadi dokumen spesifikasi kebutuhan yang terstruktur.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu merancang arsitektur perangkat lunak dan menguji hasil implementasinya.",
        paraphrase:
          "Mampu merancang arsitektur perangkat lunak menggunakan pemodelan berorientasi objek serta melakukan pengujian unit dan integrasi terhadap hasil implementasinya.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF2103",
    name: "Pemrograman Web Lanjut",
    sks: 3,
    semester: 4,
    skills: ["JavaScript", "React", "Node.js", "REST API", "Git"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan arsitektur aplikasi web modern beserta pembagian sisi klien dan peladen.",
        paraphrase:
          "Mampu menjelaskan arsitektur aplikasi web modern, membedakan tanggung jawab sisi klien dan sisi peladen, serta menjelaskan mekanisme komunikasi keduanya.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu membangun antarmuka web dinamis menggunakan pustaka komponen.",
        paraphrase:
          "Mampu membangun antarmuka web dinamis dan responsif menggunakan pustaka berbasis komponen serta mengelola status aplikasi di sisi klien.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu mengembangkan dan mengintegrasikan layanan web berbasis REST.",
        paraphrase:
          "Mampu mengembangkan layanan web berbasis REST, menangani autentikasi, serta mengintegrasikannya dengan antarmuka pengguna aplikasi web.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF3101",
    name: "Basis Data Lanjut",
    sks: 3,
    semester: 5,
    skills: ["SQL", "PostgreSQL", "MongoDB", "Data Modeling", "Redis"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu merancang basis data relasional yang ternormalisasi untuk kebutuhan enterprise.",
        paraphrase:
          "Mampu merancang skema basis data relasional yang ternormalisasi, menentukan kunci dan relasi antar tabel, serta menjaga integritas data pada skala enterprise.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menulis kueri lanjutan dan melakukan optimasi performa basis data.",
        paraphrase:
          "Mampu menulis kueri SQL lanjutan meliputi penggabungan tabel, subkueri, dan fungsi agregat, serta melakukan optimasi performa melalui indeks dan analisis rencana eksekusi.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu menjelaskan konsep basis data NoSQL dan menerapkannya pada kasus yang sesuai.",
        paraphrase:
          "Mampu menjelaskan konsep basis data NoSQL beserta jenis-jenisnya, dan menerapkannya untuk permasalahan yang tidak cocok ditangani basis data relasional.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF3102",
    name: "Pembelajaran Mesin",
    sks: 3,
    semester: 5,
    skills: ["Machine Learning", "Python", "Pandas", "Statistika", "Data Analysis"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan konsep dan jenis algoritma pembelajaran mesin.",
        paraphrase:
          "Mampu menjelaskan konsep dasar pembelajaran mesin beserta jenis algoritmanya, meliputi pembelajaran terbimbing, tak terbimbing, dan penguatan.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu melakukan praproses data dan rekayasa fitur sebelum pemodelan.",
        paraphrase:
          "Mampu melakukan praproses data meliputi pembersihan, penanganan data hilang, normalisasi, serta rekayasa fitur untuk meningkatkan kualitas model.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu membangun dan mengevaluasi model pembelajaran mesin menggunakan Python.",
        paraphrase:
          "Mampu membangun model pembelajaran mesin menggunakan Python serta mengevaluasi kinerjanya dengan metrik akurasi, presisi, recall, dan validasi silang.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF3103",
    name: "Grafika Komputer",
    sks: 3,
    semester: 6,
    skills: ["Problem Solving", "JavaScript", "Critical Thinking"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan konsep dasar grafika komputer dan sistem koordinat.",
        paraphrase:
          "Mampu menjelaskan konsep dasar grafika komputer meliputi sistem koordinat, primitif grafis, dan proses penggambaran objek pada layar.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menerapkan transformasi geometri pada objek dua dan tiga dimensi.",
        paraphrase:
          "Mampu menerapkan transformasi geometri berupa translasi, rotasi, penskalaan, dan proyeksi pada objek dua maupun tiga dimensi.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu membuat aplikasi visualisasi grafis sederhana.",
        paraphrase:
          "Mampu membuat aplikasi visualisasi grafis sederhana dengan menerapkan pencahayaan, pewarnaan, dan animasi objek secara interaktif.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF3104",
    name: "Sistem Terdistribusi",
    sks: 3,
    semester: 6,
    skills: ["Computer Network", "Docker", "Cloud Computing", "REST API", "Linux"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan arsitektur sistem terdistribusi beserta tantangannya.",
        paraphrase:
          "Mampu menjelaskan arsitektur sistem terdistribusi beserta tantangan ketersediaan, konsistensi, dan toleransi kegagalan yang menyertainya.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menerapkan mekanisme komunikasi antar proses pada sistem terdistribusi.",
        paraphrase:
          "Mampu menerapkan mekanisme komunikasi antar layanan menggunakan pemanggilan prosedur jarak jauh, antrean pesan, maupun layanan web berbasis REST.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu merancang layanan terdistribusi yang dapat diskalakan.",
        paraphrase:
          "Mampu merancang dan menerapkan layanan terdistribusi berbasis kontainer yang dapat diskalakan serta dipantau kinerjanya.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF4101",
    name: "Analitika Big Data",
    sks: 3,
    semester: 7,
    skills: ["Data Analysis", "ETL", "Data Warehouse", "Python", "Data Visualization"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan karakteristik big data dan ekosistem teknologinya.",
        paraphrase:
          "Mampu menjelaskan karakteristik big data meliputi volume, kecepatan, dan keragaman data, beserta ekosistem teknologi pengolahannya.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu membangun alur pengolahan data berskala besar.",
        paraphrase:
          "Mampu membangun alur pengolahan data berskala besar mulai dari pengumpulan, transformasi, hingga penyimpanan pada gudang data.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu menyajikan hasil analitik data besar dalam bentuk visualisasi yang informatif.",
        paraphrase:
          "Mampu menganalisis dan menyajikan hasil pengolahan data berskala besar dalam bentuk visualisasi serta laporan yang informatif bagi pengambil keputusan.",
      },
    ],
  },
  {
    universityKey: "ITERA",
    code: "IF4102",
    name: "Keamanan Siber",
    sks: 3,
    semester: 7,
    skills: ["Information Security", "Network Security", "Cryptography", "Penetration Testing"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu mengidentifikasi ancaman dan kerentanan pada sistem informasi.",
        paraphrase:
          "Mampu mengidentifikasi jenis ancaman, kerentanan, dan risiko keamanan pada sistem informasi beserta dampaknya bagi organisasi.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menerapkan teknik kriptografi untuk mengamankan data.",
        paraphrase:
          "Mampu menerapkan teknik kriptografi simetris dan asimetris beserta fungsi hash untuk menjaga kerahasiaan dan keutuhan data.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu melakukan pengujian keamanan dan menyusun rekomendasi perbaikan.",
        paraphrase:
          "Mampu melakukan pengujian penetrasi dasar pada aplikasi dan jaringan, lalu menyusun laporan temuan beserta rekomendasi perbaikannya.",
      },
    ],
  },

  // ============================ Universitas Sriwijaya =======================
  {
    universityKey: "UNSRI",
    code: "SIU1101",
    name: "Dasar Pemrograman Komputer",
    sks: 4,
    semester: 1,
    skills: ["Python", "Problem Solving", "Critical Thinking"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan konsep dasar pemrograman komputer dan cara kerjanya.",
        paraphrase:
          "Mampu menjelaskan konsep dasar pemrograman komputer meliputi variabel, tipe data, operator, dan alur eksekusi program.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menyusun algoritma untuk menyelesaikan masalah sederhana.",
        paraphrase:
          "Mampu menyusun algoritma menggunakan struktur pemilihan dan perulangan untuk menyelesaikan permasalahan komputasi sederhana.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu mengimplementasikan algoritma menjadi program yang berjalan benar.",
        paraphrase:
          "Mampu mengimplementasikan algoritma menjadi program dalam bahasa pemrograman tertentu serta melakukan penelusuran kesalahan pada program tersebut.",
      },
    ],
  },
  {
    universityKey: "UNSRI",
    code: "SIU2101",
    name: "Sistem Informasi Manajemen",
    sks: 3,
    semester: 3,
    skills: ["System Analysis", "Business Process Modeling", "ERP", "Communication"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan peran sistem informasi dalam mendukung fungsi manajemen organisasi.",
        paraphrase:
          "Mampu menjelaskan peran sistem informasi dalam mendukung fungsi perencanaan, pengorganisasian, dan pengendalian pada organisasi.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menganalisis kebutuhan informasi pada tiap tingkatan manajemen.",
        paraphrase:
          "Mampu menganalisis kebutuhan informasi pada tingkat operasional, taktis, dan strategis, serta memetakannya ke jenis sistem informasi yang sesuai.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu menyusun usulan penerapan sistem informasi pada suatu organisasi.",
        paraphrase:
          "Mampu menyusun usulan penerapan sistem informasi pada studi kasus organisasi beserta analisis manfaat dan risikonya.",
      },
    ],
  },
  {
    universityKey: "UNSRI",
    code: "SIU2102",
    name: "Manajemen Basis Data Terapan",
    sks: 3,
    semester: 4,
    skills: ["SQL", "MySQL", "Data Modeling", "PostgreSQL"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu merancang model data konseptual dan logis dari kebutuhan pengguna.",
        paraphrase:
          "Mampu merancang model data konseptual dan logis menggunakan diagram relasi entitas berdasarkan kebutuhan pengguna.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu mengimplementasikan rancangan basis data menggunakan perintah SQL.",
        paraphrase:
          "Mampu mengimplementasikan rancangan basis data menggunakan perintah definisi dan manipulasi data, termasuk pengelolaan hak akses pengguna.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu mengelola dan merawat basis data agar tetap andal.",
        paraphrase:
          "Mampu mengelola basis data meliputi pencadangan, pemulihan, serta pemantauan performa agar layanan tetap andal.",
      },
    ],
  },
  {
    universityKey: "UNSRI",
    code: "SIU3101",
    name: "Pemrograman Python untuk Data",
    sks: 3,
    semester: 5,
    skills: ["Python", "Pandas", "Data Analysis", "Data Visualization"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menggunakan pustaka Python untuk mengolah data tabular.",
        paraphrase:
          "Mampu menggunakan pustaka Python untuk membaca, menyaring, menggabungkan, dan meringkas data tabular dari berbagai sumber.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu melakukan eksplorasi dan pembersihan data.",
        paraphrase:
          "Mampu melakukan eksplorasi data menggunakan statistik deskriptif serta membersihkan data dari duplikasi, nilai hilang, dan pencilan.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu menyajikan hasil analisis data dalam bentuk visualisasi.",
        paraphrase:
          "Mampu menyajikan dan menginterpretasikan hasil analisis data dalam bentuk grafik yang tepat sesuai jenis data dan pesan yang ingin disampaikan.",
      },
    ],
  },
  {
    universityKey: "UNSRI",
    code: "SIU3102",
    name: "Jaringan Nirkabel dan Mobile",
    sks: 3,
    semester: 5,
    skills: ["Computer Network", "TCP/IP", "Network Security"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan prinsip kerja jaringan nirkabel dan komunikasi bergerak.",
        paraphrase:
          "Mampu menjelaskan prinsip kerja jaringan nirkabel meliputi media transmisi, standar protokol, dan arsitektur komunikasi bergerak.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu melakukan konfigurasi perangkat jaringan nirkabel.",
        paraphrase:
          "Mampu melakukan pengalamatan dan konfigurasi perangkat jaringan nirkabel dengan memperhatikan cakupan sinyal dan pembagian kanal.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu menerapkan mekanisme keamanan pada jaringan nirkabel.",
        paraphrase:
          "Mampu menerapkan mekanisme autentikasi dan enkripsi untuk mengamankan jaringan nirkabel dari akses tidak sah.",
      },
    ],
  },
  {
    universityKey: "UNSRI",
    code: "SIU3103",
    name: "E-Bisnis dan Perdagangan Elektronik",
    sks: 3,
    semester: 6,
    skills: ["CRM", "Business Process Modeling", "Data Analysis", "Communication"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan model bisnis digital dan perdagangan elektronik.",
        paraphrase:
          "Mampu menjelaskan berbagai model bisnis digital dan perdagangan elektronik beserta karakteristik pasar yang dilayaninya.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menganalisis proses bisnis pada platform perdagangan elektronik.",
        paraphrase:
          "Mampu menganalisis proses bisnis pada platform perdagangan elektronik mulai dari katalog produk, transaksi, hingga layanan purnajual.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu menyusun strategi pemasaran digital berbasis data pelanggan.",
        paraphrase:
          "Mampu menyusun strategi pemasaran digital dengan memanfaatkan segmentasi dan analisis perilaku pelanggan.",
      },
    ],
  },
  {
    universityKey: "UNSRI",
    code: "SIU4101",
    name: "Sistem Pendukung Keputusan",
    sks: 3,
    semester: 7,
    skills: ["Data Analysis", "Statistika", "Business Intelligence", "Critical Thinking"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan konsep dan komponen sistem pendukung keputusan.",
        paraphrase:
          "Mampu menjelaskan konsep sistem pendukung keputusan beserta komponen basis data, basis model, dan antarmuka penggunanya.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menerapkan metode pengambilan keputusan multikriteria.",
        paraphrase:
          "Mampu menerapkan metode pengambilan keputusan multikriteria untuk memeringkat alternatif berdasarkan bobot kriteria yang ditetapkan.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu membangun prototipe sistem pendukung keputusan untuk kasus nyata.",
        paraphrase:
          "Mampu membangun prototipe sistem pendukung keputusan pada studi kasus nyata serta menginterpretasikan hasil rekomendasinya.",
      },
    ],
  },
  {
    universityKey: "UNSRI",
    code: "SIU4102",
    name: "Audit Sistem Informasi",
    sks: 3,
    semester: 7,
    skills: ["IT Governance", "COBIT", "Risk Management", "Information Security"],
    clos: [
      {
        code: "CLO 1",
        text: "[CLO 1] Hasil: Mahasiswa mampu menjelaskan konsep audit sistem informasi dan kerangka kerjanya.",
        paraphrase:
          "Mampu menjelaskan konsep audit sistem informasi beserta kerangka kerja tata kelola teknologi informasi yang berlaku di industri.",
      },
      {
        code: "CLO 2",
        text: "[CLO 2] Hasil: Mahasiswa mampu menyusun program audit berdasarkan analisis risiko.",
        paraphrase:
          "Mampu menyusun program audit sistem informasi dengan menentukan lingkup, tujuan, dan prioritas berdasarkan analisis risiko organisasi.",
      },
      {
        code: "CLO 3",
        text: "[CLO 3] Hasil: Mahasiswa mampu menyusun laporan audit beserta rekomendasi perbaikan.",
        paraphrase:
          "Mampu melakukan asesmen kesenjangan penerapan kendali serta menyusun laporan audit beserta rekomendasi perbaikan bagi manajemen.",
      },
    ],
  },
];
