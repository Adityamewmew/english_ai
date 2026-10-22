import { db, client } from "./index";
import { courseClasses, TierPlansConfig } from "./schema";

export async function ensureTablesExist() {
  console.log("🛠️ Memeriksa dan memperbarui tabel course_classes, user_class_access & user_daily_ai_usage...");

  await client`
    CREATE TABLE IF NOT EXISTS course_classes (
      id VARCHAR(36) PRIMARY KEY,
      cefr VARCHAR(10) NOT NULL UNIQUE,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      original_price INTEGER,
      features JSONB,
      tier_plans JSONB,
      is_active BOOLEAN NOT NULL DEFAULT true,
      order_index INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await client`
    ALTER TABLE course_classes ADD COLUMN IF NOT EXISTS tier_plans JSONB;
  `;

  await client`
    CREATE TABLE IF NOT EXISTS user_class_access (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      cefr VARCHAR(10) NOT NULL,
      tier VARCHAR(20) NOT NULL DEFAULT 'basic',
      granted_by VARCHAR(50) NOT NULL DEFAULT 'admin',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await client`
    ALTER TABLE user_class_access ADD COLUMN IF NOT EXISTS tier VARCHAR(20) NOT NULL DEFAULT 'basic';
  `;

  await client`
    CREATE UNIQUE INDEX IF NOT EXISTS user_class_access_user_cefr_idx ON user_class_access (user_id, cefr);
  `;

  await client`
    CREATE TABLE IF NOT EXISTS user_daily_ai_usage (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      usage_date VARCHAR(10) NOT NULL,
      chat_count INTEGER NOT NULL DEFAULT 0,
      voice_seconds INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await client`
    CREATE UNIQUE INDEX IF NOT EXISTS user_daily_ai_usage_user_date_idx ON user_daily_ai_usage (user_id, usage_date);
  `;

  console.log("✅ Struktur tabel dan indeks siap.");
}

function createDefaultTierPlans(basePrice: number, baseOriginalPrice: number, cefr: string): TierPlansConfig {
  const basicPrice = Math.round(basePrice * 0.65 / 1000) * 1000;
  const basicOrigPrice = Math.round(baseOriginalPrice * 0.65 / 1000) * 1000;

  const proPrice = basePrice;
  const proOrigPrice = baseOriginalPrice;

  const ultraPrice = Math.round(basePrice * 1.65 / 1000) * 1000;
  const ultraOrigPrice = Math.round(baseOriginalPrice * 1.65 / 1000) * 1000;

  return {
    basic: {
      name: `Paket Basic (${cefr})`,
      price: basicPrice,
      originalPrice: basicOrigPrice,
      dailyChatLimit: 20,
      dailyVoiceMinutes: 5,
      features: [
        `Akses penuh seluruh modul kurikulum CEFR ${cefr}`,
        "20 pesan Chat AI Tutor per hari",
        "5 menit AI Voice Call percakapan per hari",
        "Kuis & ujian kompetensi level",
        `Sertifikat kelulusan resmi CEFR ${cefr}`,
      ],
    },
    pro: {
      name: `Paket Pro (${cefr})`,
      price: proPrice,
      originalPrice: proOrigPrice,
      dailyChatLimit: 100,
      dailyVoiceMinutes: 30,
      features: [
        `Akses penuh seluruh modul kurikulum CEFR ${cefr}`,
        "100 pesan Chat AI Tutor per hari",
        "30 menit AI Voice Call percakapan per hari",
        "Feedback koreksi grammar & pelafalan mendalam",
        "Prioritas respon AI tutor",
        `Sertifikat kelulusan resmi CEFR ${cefr}`,
      ],
    },
    ultra: {
      name: `Paket Ultra (${cefr})`,
      price: ultraPrice,
      originalPrice: ultraOrigPrice,
      dailyChatLimit: -1, // Unlimited
      dailyVoiceMinutes: 120,
      features: [
        `Akses penuh seluruh modul kurikulum CEFR ${cefr}`,
        "Unlimited Chat AI Tutor tanpa batas harian",
        "120 menit AI Voice Call percakapan per hari",
        "Analisis fonetik real-time & roleplay skenario bebas",
        "Prioritas respon AI tutor ultra-cepat",
        `Sertifikat kelulusan resmi CEFR ${cefr}`,
      ],
    },
  };
}

export const defaultCourseClasses = [
  {
    id: "class-a1",
    cefr: "A1",
    name: "Kelas Bahasa Inggris Dasar (CEFR A1)",
    description: "Paket akses penuh modul dasar, latihan percakapan speaking AI, kuis kompetensi, dan sertifikat kelulusan resmi CEFR A1.",
    price: 149000,
    originalPrice: 249000,
    features: [
      "Akses penuh 24/7 seluruh modul pembelajaran level A1",
      "Latihan speaking & pelafalan interaktif bersama tutor AI",
      "Kuis & evaluasi pemahaman real-time per sub-modul",
      "Sertifikat resmi kompetensi CEFR A1 setelah menyelesaikan kelas",
    ],
    tierPlans: createDefaultTierPlans(149000, 249000, "A1"),
    isActive: true,
    orderIndex: 1,
  },
  {
    id: "class-a2",
    cefr: "A2",
    name: "Kelas Bahasa Inggris Pra-Menengah (CEFR A2)",
    description: "Paket percakapan situasi nyata, tata bahasa praktis, latihan roleplay AI, dan sertifikat resmi CEFR A2.",
    price: 179000,
    originalPrice: 299000,
    features: [
      "Akses penuh seluruh modul pembelajaran level A2",
      "Latihan percakapan situasi nyata dengan AI voice tutor",
      "Kuis formatif & ujian akhir kelulusan level",
      "Sertifikat resmi kelulusan CEFR A2",
    ],
    tierPlans: createDefaultTierPlans(179000, 299000, "A2"),
    isActive: true,
    orderIndex: 2,
  },
  {
    id: "class-b1",
    cefr: "B1",
    name: "Kelas Bahasa Inggris Menengah (CEFR B1)",
    description: "Kuasai komunikasi aktif bahasa Inggris untuk kebutuhan kerja dan akademik bersama AI, modul intermediate, dan sertifikat B1.",
    price: 219000,
    originalPrice: 349000,
    features: [
      "Akses penuh seluruh modul intermediate level B1",
      "Latihan diskusi opini & skenario profesional bersama AI",
      "Evaluasi mendalam grammar, vocabulary, dan fluency",
      "Sertifikat resmi kelulusan CEFR B1",
    ],
    tierPlans: createDefaultTierPlans(219000, 349000, "B1"),
    isActive: true,
    orderIndex: 3,
  },
  {
    id: "class-b2",
    cefr: "B2",
    name: "Kelas Bahasa Inggris Lanjutan (CEFR B2)",
    description: "Tingkatkan kefasihan profesional dan pemikiran kritis dalam bahasa Inggris dengan studi kasus kompleks dan sertifikat B2.",
    price: 259000,
    originalPrice: 399000,
    features: [
      "Akses penuh seluruh modul upper-intermediate B2",
      "Simulasi presentasi bisnis & wawancara kerja AI",
      "Sertifikat resmi kelulusan CEFR B2",
    ],
    tierPlans: createDefaultTierPlans(259000, 399000, "B2"),
    isActive: true,
    orderIndex: 4,
  },
  {
    id: "class-c1",
    cefr: "C1",
    name: "Kelas Bahasa Inggris Mahir (CEFR C1)",
    description: "Kelancaran spontan dan pemahaman ekspresif tingkat tinggi untuk karir global dan studi internasional.",
    price: 299000,
    originalPrice: 499000,
    features: [
      "Akses penuh seluruh modul advanced level C1",
      "Analisis gaya bahasa & penulisan formal bersama AI",
      "Sertifikat resmi kelulusan CEFR C1",
    ],
    tierPlans: createDefaultTierPlans(299000, 499000, "C1"),
    isActive: true,
    orderIndex: 5,
  },
  {
    id: "class-c2",
    cefr: "C2",
    name: "Kelas Bahasa Inggris Master (CEFR C2)",
    description: "Tingkat penguasaan bahasa Inggris setara penutur asli untuk profesional dan akademisi kelas dunia.",
    price: 349000,
    originalPrice: 599000,
    features: [
      "Akses penuh seluruh modul master level C2",
      "Komunikasi kompleks tanpa hambatan bersama AI",
      "Sertifikat resmi kelulusan CEFR C2",
    ],
    tierPlans: createDefaultTierPlans(349000, 599000, "C2"),
    isActive: true,
    orderIndex: 6,
  },
];

export async function seedCourseClasses() {
  await ensureTablesExist();
  console.log("🏫 Memulai pembaruan master data kelas A1 - C2 dengan paket tier via Drizzle ORM...");
  for (const c of defaultCourseClasses) {
    await db
      .insert(courseClasses)
      .values(c)
      .onConflictDoUpdate({
        target: courseClasses.cefr,
        set: {
          name: c.name,
          description: c.description,
          price: c.price,
          originalPrice: c.originalPrice,
          features: c.features,
          tierPlans: c.tierPlans,
          isActive: c.isActive,
          orderIndex: c.orderIndex,
        },
      });
  }
  console.log("✅ 6 Master paket kelas (A1 - C2) dengan tier Basic, Pro, Ultra berhasil diinisialisasi.");
}

if (import.meta.main) {
  seedCourseClasses()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Gagal seeding kelas:", err);
      process.exit(1);
    });
}
