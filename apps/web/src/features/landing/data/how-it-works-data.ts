export interface EngineInputNode {
  id: string;
  label: string;
  category: string;
  iconName: "book" | "award" | "headphones" | "check" | "briefcase" | "mic";
}

export interface EngineOutputRow {
  tag: string;
  content: string;
  badge: string;
  tagColor: string;
}

export const ENGINE_INPUT_NODES: EngineInputNode[] = [
  { id: "career", label: "Meeting & Interview Kerja", category: "Skenario Karir", iconName: "briefcase" },
  { id: "daily", label: "Percakapan Santai Sehari-hari", category: "Small Talk", iconName: "headphones" },
  { id: "spontaneous", label: "Latihan Bicara Bebas Cemas", category: "Praktik Suara", iconName: "mic" },
  { id: "grammar", label: "Koreksi Grammar Sambil Ngomong", category: "Feedback Instan", iconName: "check" },
  { id: "cambridge", label: "Materi Bertahap A1 s.d. C2", category: "Silabus Cambridge", iconName: "book" },
  { id: "cefr", label: "Sertifikasi Resmi Terakreditasi", category: "Tolak Ukur", iconName: "award" },
];

export const ENGINE_OUTPUT_ROWS: EngineOutputRow[] = [
  {
    tag: "Topik Latihan",
    content: "Meeting & Negosiasi Kerja",
    badge: "15 Menit",
    tagColor: "bg-blue-100 text-blue-900",
  },
  {
    tag: "Kelancaran",
    content: "Skor 92% (Spontan & Percaya Diri)",
    badge: "Akurasi Tinggi",
    tagColor: "bg-emerald-100 text-emerald-900",
  },
  {
    tag: "Catatan Ramah",
    content: "Gunakan 'look forward to' (bukan 'for')",
    badge: "Koreksi Halus",
    tagColor: "bg-amber-100 text-amber-900",
  },
  {
    tag: "Level Anda",
    content: "Naik Menuju B2 Upper Intermediate",
    badge: "Cambridge CEFR",
    tagColor: "bg-purple-100 text-purple-900",
  },
  {
    tag: "Sesi Berikutnya",
    content: "Latihan Presentasi Singkat 5 Menit",
    badge: "Rekomendasi",
    tagColor: "bg-rose-100 text-rose-900",
  },
];

export interface HowItWorksStep {
  id: string;
  number: string;
  stepLabel: string;
  title: string;
  subtitle: string;
  description: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: "placement-test",
    number: "01",
    stepLabel: "Langkah 1",
    title: "Placement Test Adaptif",
    subtitle: "Ukur Kemampuan Awal Anda",
    description: "Evaluasi kecakapan berbicara awal (A1–C2) dalam 10 menit.",
  },
  {
    id: "speaking-practice",
    number: "02",
    stepLabel: "Langkah 2",
    title: "Praktik Speaking Real-Time",
    subtitle: "Latihan Bebas Cemas 24/7",
    description: "Bicara langsung dua arah bersama Mr. Khoirul AI.",
  },
  {
    id: "certification",
    number: "03",
    stepLabel: "Langkah 3",
    title: "Evaluasi & Sertifikasi Resmi",
    subtitle: "Standar Cambridge Terakreditasi",
    description: "Dapatkan sertifikat resmi terakreditasi BAN PAUD & PNF.",
  },
];
