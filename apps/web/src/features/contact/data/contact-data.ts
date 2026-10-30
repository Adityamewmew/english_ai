export interface BranchLocation {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  isMainOffice?: boolean;
  rating?: number;
  category: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  operatingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  landmark: string;
  mapsUrl: string;
  embedMapsUrl: string;
  services: string[];
}

export interface QuickContactChannel {
  id: string;
  title: string;
  label: string;
  value: string;
  description: string;
  actionText: string;
  actionHref: string;
  isPrimary?: boolean;
}

export const EDDYS_QUICK_CHANNELS: QuickContactChannel[] = [
  {
    id: "whatsapp",
    title: "WhatsApp Customer Service",
    label: "Respon Cepat",
    value: "0813-3671-2345",
    description: "Konsultasi jadwal kelas, biaya kursus, dan aktivasi akun EDDY'S AI.",
    actionText: "Chat WhatsApp Sekarang",
    actionHref: "https://wa.me/6281336712345?text=Halo%20Admin%20Eddy's%20English%20Jember,%20saya%20ingin%20tanya%20informasi%20program%20kursus",
    isPrimary: true,
  },
  {
    id: "phone",
    title: "Telepon Kantor",
    label: "Layanan Jam Kerja",
    value: "0813-3671-2345",
    description: "Hubungi langsung hotline resmi Eddy's English Jember.",
    actionText: "Hubungi Telepon",
    actionHref: "tel:+6281336712345",
  },
  {
    id: "email",
    title: "Email Resmi",
    label: "Kerjasama & Corporate",
    value: "eddysjember@gmail.com",
    description: "Pengajuan proposal In-House Training corporate, sponsorship, & kemitraan.",
    actionText: "Kirim Email",
    actionHref: "mailto:eddysjember@gmail.com?subject=Inquiry%20Kemitraan%20Eddy's%20English",
  },
];

export const EDDYS_JEMBER_BRANCHES: BranchLocation[] = [
  {
    id: "kalimantan",
    name: "Eddys English Jember — Jl. Kalimantan No. 77",
    shortName: "Jl. Kalimantan No. 77",
    category: "Sekolah Bahasa Inggris",
    tagline: "Pusat Kelas Kursus & Belajar Siswa / Mahasiswa",
    rating: 4.0,
    address: "Jl. Kalimantan No. 77, Krajan Timur, Sumbersari",
    district: "Kec. Sumbersari",
    city: "Kabupaten Jember",
    postalCode: "68121",
    phone: "0813-3671-2345",
    whatsapp: "6281336712345",
    operatingHours: {
      weekdays: "08.00 – 20.00 WIB",
      saturday: "Buka pukul 09.00 – 17.00 WIB",
      sunday: "Tutup (Konsultasi via WA)",
    },
    landmark: "Kawasan Kampus Universitas Jember (UNEJ), akses mudah dekat Bundaran Jawa",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eddys+English+Jember+Jl+Kalimantan+No+77",
    embedMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.378942006764!2d113.71457497576597!3d-8.164387491866388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd695b28a9b2075%3A0xc3cf9365c197779f!2sJl.%20Kalimantan%20No.77%2C%20Krajan%20Timur%2C%20Sumbersari%2C%20Kec.%20Sumbersari%2C%20Kabupaten%20Jember%2C%20Jawa%20Timur%2068121!5e0!3m2!1sid!2sid!4v1730311000000!5m2!1sid!2sid",
    services: [
      "Sekolah Bahasa Inggris & Kelas Offline",
      "Speaking Intensive & Conversation Club",
      "Persiapan Ujian Resmi TOEFL / IELTS",
      "Tes Penempatan CEFR & Konsultasi Gratis",
    ],
  },
  {
    id: "tidar",
    name: "Eddy's English Jember — Jl. Tidar",
    shortName: "Jl. Tidar",
    category: "Kantor Perusahaan",
    tagline: "Kantor Perusahaan & Manajemen Pelatihan",
    isMainOffice: true,
    rating: 4.8,
    address: "Jl. Tidar, Keling, Sumbersari",
    district: "Kec. Sumbersari",
    city: "Kabupaten Jember",
    postalCode: "68121",
    phone: "0813-3671-2345",
    whatsapp: "6281336712345",
    operatingHours: {
      weekdays: "08.00 – 20.00 WIB",
      saturday: "Buka pukul 09.00 – 17.00 WIB",
      sunday: "Tutup (Konsultasi via WA)",
    },
    landmark: "Kawasan Tidar Sumbersari, mudah dijangkau dari pusat kota & area pendidikan",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eddy's+English+Jember+Jl+Tidar",
    embedMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.278385311409!2d113.72251407576609!3d-8.174360691856754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd695cf649391ab%3A0xe54b971a8ea6c79a!2sJl.%20Tidar%2C%20Sumbersari%2C%20Kec.%20Sumbersari%2C%20Kabupaten%20Jember%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1730311000001!5m2!1sid!2sid",
    services: [
      "Kantor Perusahaan & Manajemen Yayasan",
      "In-House Training & Kerjasama Corporate BUMN",
      "Workshop & Pelatihan Pengajar Bahasa Inggris",
      "Layanan Administrasi & Legalitas Lembaga",
    ],
  },
];

export const CONTACT_FAQS = [
  {
    question: "Apakah bisa datang langsung ke kantor tanpa membuat janji?",
    answer:
      "Bisa. Anda dapat langsung mengunjungi lokasi kami di Jl. Kalimantan No. 77 (Sekolah Bahasa Inggris) atau Jl. Tidar (Kantor Perusahaan) selama jam operasional kerja (Senin–Jumat 08.00–20.00 WIB, Sabtu mulai pukul 09.00 WIB).",
  },
  {
    question: "Bagaimana cara melakukan tes penempatan level jika mendaftar offline?",
    answer:
      "Anda bisa langsung mengikuti tes diagnostik awal di Jl. Kalimantan No. 77 secara gratis dalam waktu 10–15 menit, atau mengikuti tes CEFR online kami terlebih dahulu melalui website ini.",
  },
  {
    question: "Apakah program EDDY'S AI terintegrasi dengan kelas offline?",
    answer:
      "Ya! Peserta kursus offline di Eddy's English mendapatkan akses ke platform tutor AI Mr. Khoirul untuk latihan berbicara harian di rumah, sehingga refleks speaking berkembang jauh lebih cepat.",
  },
  {
    question: "Untuk program Corporate / In-House Training, ke mana kami harus menghubungi?",
    answer:
      "Silakan menghubungi kantor Jl. Tidar via email ke eddysjember@gmail.com atau chat WhatsApp 0813-3671-2345. Tim divisi pelatihan korporat kami siap menyusun modul sesuai kebutuhan instansi Anda.",
  },
];
