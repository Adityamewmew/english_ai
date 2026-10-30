export interface ChaosProblem {
  id: string;
  tag: string;
  title: string;
  note: string;
  type: "sticky" | "receipt" | "bubble" | "memo";
  rotation: string;
}

export const CHAOS_PROBLEMS: ChaosProblem[] = [
  {
    id: "freeze",
    tag: "Mental Block",
    title: "Di kepala lancar, pas buka mulut langsung 'nge-freeze'",
    note: "Hafal rumus tenses di buku, tapi lidah kaku dan takut salah grammar saat diajak berbicara langsung.",
    type: "sticky",
    rotation: "-rotate-2",
  },
  {
    id: "cost",
    tag: "Biaya & Waktu",
    title: "Les privat jutaan rupiah, waktu bicara cuma 5 menit",
    note: "Satu kelas diisi belasan murid. Waktu habis mendengarkan materi, kesempatan praktik ngomong hampir nol.",
    type: "receipt",
    rotation: "rotate-2",
  },
  {
    id: "judgment",
    tag: "Fear of Judgment",
    title: "Takut ditertawakan kalau aksen terdengar 'medok'",
    note: "Minder sebelum mencoba. Tidak ada ruang privat yang benar-benar aman untuk belajar dari kekeliruan.",
    type: "bubble",
    rotation: "-rotate-1",
  },
  {
    id: "schedule",
    tag: "Inkonsistensi",
    title: "Jadwal kaku, pulang kerja atau kuliah sudah lelah",
    note: "Semangat tinggi di awal minggu, tapi gugur di tengah jalan karena jadwal les fisik yang sulit disesuaikan.",
    type: "memo",
    rotation: "rotate-2",
  },
];

export const BENTO_CAMBRIDGE_LEVELS = [
  { level: "A1-A2", name: "Daily Essentials", desc: "Perkenalan & percakapan sehari-hari", active: true },
  { level: "B1-B2", name: "Professional Fluency", desc: "Diskusi kerja & negosiasi bisnis", active: true },
  { level: "C1-C2", name: "Mastery & Nuance", desc: "Presentasi global & debat mendalam", active: true },
];

