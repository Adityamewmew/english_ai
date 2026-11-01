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
    title: "WhatsApp Konsultasi",
    label: "Respon Tercepat (< 15 Menit)",
    value: "0813-3671-2345",
    description: "Konsultasi program belajar, jadwal kelas, biaya kursus, dan aktivasi akun EDDY'S AI.",
    actionText: "Chat WhatsApp Resmi",
    actionHref: "https://wa.me/6281336712345?text=Halo%20Admin%20Eddy's%20English%20Jember,%20saya%20ingin%20konsultasi%20program%20kursus%20dan%20jadwal",
    isPrimary: true,
  },
  {
    id: "phone",
    title: "Hotline Kantor",
    label: "Jam Operasional Kerja",
    value: "0813-3671-2345",
    description: "Hubungi langsung staf administrasi kami untuk informasi dan konfirmasi kunjungan.",
    actionText: "Hubungi Hotline",
    actionHref: "tel:+6281336712345",
  },
  {
    id: "email",
    title: "Email Administrasi",
    label: "Kerjasama & Corporate",
    value: "eddysjember@gmail.com",
    description: "Pengajuan proposal In-House Training instansi, sponsorship, dan kemitraan akademik.",
    actionText: "Kirim Pesan Email",
    actionHref: "mailto:eddysjember@gmail.com?subject=Inquiry%20Kemitraan%20Eddy's%20English",
  },
];

export const EDDYS_JEMBER_BRANCHES: BranchLocation[] = [
  {
    id: "tawangmangu",
    name: "Gedung Pusat Pembelajaran Eddy's English",
    shortName: "Jl. Tawang Mangu No. 190",
    category: "Pusat Pembelajaran & Ujian Resmi",
    tagline: "Sekolah Bahasa Inggris, Lab AI Speaking & Persiapan TOEFL / IELTS / TOEIC",
    rating: 4.8,
    isMainOffice: true,
    address: "Jl. Tawang Mangu No. 190, Tegalgede, Sumbersari",
    district: "Kec. Sumbersari",
    city: "Kabupaten Jember",
    postalCode: "68126",
    phone: "0813-3671-2345",
    whatsapp: "6281336712345",
    operatingHours: {
      weekdays: "08.00 – 20.00 WIB",
      saturday: "09.00 – 17.00 WIB",
      sunday: "Tutup (Layanan Online via WhatsApp)",
    },
    landmark: "Kawasan strategis Sumbersari, mudah dijangkau dari berbagai area kota Jember",
    mapsUrl: "https://maps.app.goo.gl/4iNqPsktWSP76GCd9",
    embedMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.3253594288194!2d113.7292315!3d-8.1699393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd695edcc8ec73b%3A0x8adb4ae32180d5d7!2sEddy%27s%20English%20Jember!5e0!3m2!1sid!2sid!4v1730419200000!5m2!1sid!2sid",
    services: [
      "Sekolah Bahasa Inggris & Kelas Tatap Muka Interaktif",
      "Speaking Intensive & English Conversation Club",
      "Persiapan Ujian Resmi TOEFL ITP, IELTS, & TOEIC",
      "Diagnostic Test CEFR & Konsultasi Kurikulum Gratis",
    ],
  },
];

export const CONTACT_FAQS = [
  {
    question: "Apakah bisa berkunjung langsung ke kantor tanpa membuat janji temu?",
    answer:
      "Bisa. Anda dapat langsung mengunjungi gedung kami di Jl. Tawang Mangu No. 190, Tegalgede, Sumbersari pada jam operasional (Senin–Jumat 08.00–20.00 WIB, Sabtu 09.00–17.00 WIB) untuk konsultasi program atau informasi pendaftaran.",
  },
  {
    question: "Bagaimana alur tes penempatan level (Placement Test) jika ingin mendaftar?",
    answer:
      "Anda dapat langsung mengikuti tes diagnostik awal di gedung Jl. Tawang Mangu No. 190 secara gratis selama 10–15 menit, atau mengikuti tes CEFR online kami terlebih dahulu melalui website ini.",
  },
  {
    question: "Apakah program EDDY'S AI terintegrasi dengan kelas offline?",
    answer:
      "Ya. Peserta kursus offline di Eddy's English mendapatkan fasilitas pendamping platform tutor AI Mr. Khoirul untuk latihan berbicara harian di rumah, sehingga kemahiran dan kelancaran berbicara berkembang jauh lebih cepat.",
  },
  {
    question: "Untuk program Corporate / In-House Training instansi, bagaimana prosedurnya?",
    answer:
      "Silakan menghubungi kami melalui email eddysjember@gmail.com atau WhatsApp resmi di 0813-3671-2345. Tim konsultan kurikulum kami akan merancang silabus dan jadwal pelatihan yang disesuaikan dengan kebutuhan korporat atau instansi Anda.",
  },
];
