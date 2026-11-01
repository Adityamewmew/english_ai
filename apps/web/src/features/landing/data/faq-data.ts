export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "beginner",
    question: "Apakah cocok untuk pemula tanpa dasar grammar?",
    answer:
      "Sangat cocok. Latihan dimulai bertahap dari level A1 dengan panduan dwibahasa yang ramah dan sabar tanpa dihakimi.",
  },
  {
    id: "certificate",
    question: "Bagaimana dengan keabsahan sertifikat di EDDY'S ENGLISH?",
    answer:
      "Sertifikat Eddy's diakui nasional karena sudah berijin resmi berbadan hukum, BAN PNF, serta ijin Dinas Pendidikan penyelenggara kursus Resmi. Untuk sertifikat TOEFL ITP, dan TOEIC diterbitkan oleh ETS (Educational Testing Service) Amerika.",
  },
  {
    id: "device",
    question: "Apakah bisa diakses langsung lewat smartphone (HP)?",
    answer:
      "Bisa. Berjalan lancar langsung di browser HP (Android & iOS) tanpa perlu mengunduh aplikasi tambahan.",
  },
  {
    id: "schedule_guarantee",
    question: "Berapa lama waktu latihan & bagaimana garansinya?",
    answer:
      "Cukup 15 menit/hari kapan saja (24/7). Dilengkapi garansi kepuasan 14 hari penuh pengembalian dana 100%.",
  },
];
