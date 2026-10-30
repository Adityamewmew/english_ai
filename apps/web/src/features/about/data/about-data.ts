export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export interface AboutDocumentationPhoto {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  image: string;
}

export const ABOUT_TIMELINE: TimelineMilestone[] = [
  {
    year: "1980",
    title: "Awal Mula Pendirian",
    description:
      "Didirikan oleh mendiang Bapak Eddy Wartana sebagai bimbingan belajar bahasa Inggris rumahan di Jember, dengan dedikasi mencerdaskan generasi muda.",
  },
  {
    year: "1988",
    title: "Pelopor British English di Jawa Timur",
    description:
      "Setelah menyelesaikan studi di Bell College, Bapak Eddy Wartana mengintegrasikan standar pengajaran British English dengan kurikulum nasional.",
  },
  {
    year: "2015",
    title: "Badan Hukum Yayasan Eddys Edukasi Mandiri",
    description:
      "Bertransformasi menjadi lembaga berbadan hukum resmi dan mulai mengadopsi kerangka pengajaran berstandar internasional Cambridge.",
  },
  {
    year: "2019",
    title: "Akreditasi Resmi BAN PAUD & PNF",
    description:
      "Meraih Akreditasi B resmi dari Badan Akreditasi Nasional Pendidikan Non-formal, menjamin mutu mutu tata kelola dan kurikulum.",
  },
  {
    year: "2020",
    title: "Ekspansi Corporate & Cabang Tabalong",
    description:
      "Membuka cabang di Tabalong (Kalimantan Selatan) serta mendirikan EDDY'S Training Centre untuk pelatihan intensif karyawan BUMN dan industri.",
  },
  {
    year: "2026",
    title: "Kelahiran Platform EDDY'S AI",
    description:
      "Mentransformasikan rekam jejak 40+ tahun dan pedagogi Mr. Khoirul Anwar ke dalam platform AI interaktif yang dapat diakses 24/7 di seluruh dunia.",
  },
];

export const ABOUT_DOCUMENTATION_PHOTOS: AboutDocumentationPhoto[] = [
  {
    id: "corporate",
    title: "Corporate Training & Business Speaking Class",
    category: "Pelatihan Perusahaan",
    location: "Jember & Jawa Timur",
    description:
      "Program pelatihan komunikasi profesional dirancang khusus untuk kebutuhan instansi perbankan, energi, tambang, dan telekomunikasi.",
    image: "/about/corporate-training.webp",
  },
  {
    id: "tourism-workshop",
    title: "Tourism International Conference & Workshop",
    category: "Konferensi & Kemitraan",
    location: "Jawa Timur",
    description:
      "Mr. Khoirul Anwar, M.Pd. menerima sertifikat resmi atas kontribusi dalam standarisasi komunikasi bahasa Inggris industri.",
    image: "/about/workshop-tourism.webp",
  },
  {
    id: "teacher-workshop",
    title: "Workshop Deep Learning in English Teaching",
    category: "Pemberdayaan Guru",
    location: "Kabupaten Bondowoso",
    description:
      "Pelatihan metodologi pengajaran aktif bersama MGMP Bahasa Inggris untuk meningkatkan kompetensi para pendidik sekolah.",
    image: "/about/teacher-workshop.webp",
  },
  {
    id: "student-community",
    title: "Komunitas Belajar & TOEFL Training",
    category: "Pelajar & Mahasiswa",
    location: "EDDY'S Training Centre",
    description:
      "Bimbingan terstruktur bagi pelajar SMA dan mahasiswa dalam mempersiapkan ujian resmi TOEFL, IELTS, serta studi ke luar negeri.",
    image: "/about/student-community.webp",
  },
];

export const ABOUT_VISION_MISSION = {
  vision:
    "Menjadi yayasan pendidikan non-formal yang memiliki andil nyata dalam kemajuan sumber daya manusia Indonesia melalui standardisasi internasional.",
  missions: [
    "Membekali peserta didik dengan keterampilan berbahasa Inggris tingkat dasar hingga mahir secara intensif melalui integrasi kurikulum nasional dan Cambridge.",
    "Mengembangkan sistem manajemen yayasan yang akuntabel dan metode pengajaran yang adaptif terhadap perkembangan teknologi.",
    "Menjalin kemitraan lokal, regional, nasional, dan internasional secara berkesinambungan.",
  ],
};

export const ABOUT_METRICS = [
  {
    value: "1980",
    label: "Tahun Berdiri",
    sublabel: "40+ tahun rekam jejak pendidikan",
  },
  {
    value: "Akreditasi B",
    label: "BAN PAUD & PNF",
    sublabel: "Standar resmi Kemendikbud",
  },
  {
    value: "Cambridge",
    label: "Curriculum Track",
    sublabel: "Standar CEFR A1 hingga C2",
  },
  {
    value: "100+",
    label: "Mitra Korporasi",
    sublabel: "BUMN, perbankan, & sekolah mitra",
  },
];

