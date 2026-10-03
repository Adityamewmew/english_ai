import { db } from "./index";
import { curriculumLevels, curriculumModules, moduleSections } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runSeedLevelModules() {
  console.log("Memulai seeding Kurikulum Level & Modul Progresif...");

  const dataFiles = [
    // Official Client Curriculum extracted from client PDFs
    "data/client_curriculum/level_a1_all_sublevels.json",
    "data/client_curriculum/level_a2_all_sublevels.json",
    "data/client_curriculum/level_b1_all_sublevels.json",
    "data/client_curriculum/level_b2_all_sublevels.json",
    "data/client_curriculum/level_c1_modules.json",
    "data/client_curriculum/level_c2_modules.json",
  ];

  const SUB_LEVELS = [
    // A1 (3 sub-levels - 13 units each: 12 modules + 1 graduation exam)
    { id: "A1.1", cefr: "A1", title: "A1.1 - Starter Foundations", description: "Fondasi identitas diri, kata ganti, dan percakapan dasar.", orderIndex: 1, unitRange: [1, 13] as [number, number] },
    { id: "A1.2", cefr: "A1", title: "A1.2 - Daily Logistics & Practical Actions", description: "Aktivitas harian, arah, transaksi belanja, kafe, transportasi, dan kesehatan.", orderIndex: 2, unitRange: [1, 13] as [number, number] },
    { id: "A1.3", cefr: "A1", title: "A1.3 - Experiences, Comparisons & Intentions", description: "Komparasi, memori liburan, rencana masa depan, dan jembatan ke A2.", orderIndex: 3, unitRange: [1, 13] as [number, number] },
    // A2 (3 sub-levels - 13 units each: 12 modules + 1 graduation exam)
    { id: "A2.1", cefr: "A2", title: "A2.1 - Elementary Actions", description: "Waktu luang, transaksi belanja, kebutuhan pangan, dan relasi keluarga.", orderIndex: 4, unitRange: [1, 13] as [number, number] },
    { id: "A2.2", cefr: "A2", title: "A2.2 - Social Dynamics, Work & Everyday Life", description: "Profesi, belanja, transportasi, resep makanan, opini film, dan gaya hidup.", orderIndex: 5, unitRange: [1, 13] as [number, number] },
    { id: "A2.3", cefr: "A2", title: "A2.3 - World Explorations, Stories & Bridge to B1", description: "Kondisi alam, kebiasaan digital, storytelling, phrasal verbs, dan jembatan ke B1.", orderIndex: 6, unitRange: [1, 13] as [number, number] },
    // B1 (3 sub-levels - 13 units each: 12 modules + 1 graduation exam)
    { id: "B1.1", cefr: "B1", title: "B1.1 - Intermediate Foundations", description: "Kepribadian, metode belajar, media sosial, musik, dan pengkondisian dasar.", orderIndex: 7, unitRange: [1, 13] as [number, number] },
    { id: "B1.2", cefr: "B1", title: "B1.2 - Intermediate Fluency & Global Work", description: "Komunikasi profesional, negosiasi, perjalanan, ragam tenses, dan advokasi konsumen.", orderIndex: 8, unitRange: [1, 13] as [number, number] },
    { id: "B1.3", cefr: "B1", title: "B1.3 - Critical Perspectives & Bridge to B2", description: "Literasi media, pengkondisian lanjutan, isu global, debat diplomatik, dan jembatan ke B2.", orderIndex: 9, unitRange: [1, 13] as [number, number] },
    // B2 (3 sub-levels - 13 units each: 12 modules + 1 graduation exam)
    { id: "B2.1", cefr: "B2", title: "B2.1 - Vantage Foundations", description: "Rencana hidup, narasi masa lalu, dan pengkondisian lanjutan.", orderIndex: 10, unitRange: [1, 13] as [number, number] },
    { id: "B2.2", cefr: "B2", title: "B2.2 - Advanced Professional & Academic Fluency", description: "Etika bisnis, negosiasi, kausatif, inversi, klausa partisipel, dan riset akademik.", orderIndex: 11, unitRange: [1, 13] as [number, number] },
    { id: "B2.3", cefr: "B2", title: "B2.3 - Strategic Debate & Bridge to C1", description: "Tata kota, ekonomi perilaku, diplomasi krisis, cleft sentences, dan jembatan ke C1.", orderIndex: 12, unitRange: [1, 13] as [number, number] },
    // C1 (6 sub-levels)
    { id: "C1.1", cefr: "C1", title: "C1.1 - Survival & Journeys", description: "Ketahanan hidup dan petualangan eksplorasi.", orderIndex: 13, unitRange: [1, 2] as [number, number] },
    { id: "C1.2", cefr: "C1", title: "C1.2 - Innovation & Thinking", description: "Generasi masa depan dan pemikiran lateral kreatif.", orderIndex: 14, unitRange: [3, 4] as [number, number] },
    { id: "C1.3", cefr: "C1", title: "C1.3 - Technology & Community", description: "Dinamika layar digital dan rekonsiliasi sosial.", orderIndex: 15, unitRange: [5, 6] as [number, number] },
    { id: "C1.4", cefr: "C1", title: "C1.4 - Mindset & Structure", description: "Optimisme masa depan dan pengorganisasian ide.", orderIndex: 16, unitRange: [7, 8] as [number, number] },
    { id: "C1.5", cefr: "C1", title: "C1.5 - Personal Mastery & Media", description: "Pengembangan diri dan struktur pemberitaan publik.", orderIndex: 17, unitRange: [9, 10] as [number, number] },
    { id: "C1.6", cefr: "C1", title: "C1.6 - Cosmos & Deep Discovery", description: "Penjelajahan antariksa dan penemuan makna mendalam.", orderIndex: 18, unitRange: [11, 12] as [number, number] },
    // C2 (6 sub-levels)
    { id: "C2.1", cefr: "C2", title: "C2.1 - Psychology & Sleep", description: "Dinamika kekeluargaan dan misteri bawah sadar tidur.", orderIndex: 19, unitRange: [1, 2] as [number, number] },
    { id: "C2.2", cefr: "C2", title: "C2.2 - Probability & Rhetorical Wit", description: "Probabilitas keberuntungan dan retorika humor tingkat tinggi.", orderIndex: 20, unitRange: [3, 4] as [number, number] },
    { id: "C2.3", cefr: "C2", title: "C2.3 - Extreme Risk & Biographies", description: "Sensasi bahaya ekstrem dan biografi tokoh bersejarah.", orderIndex: 21, unitRange: [5, 6] as [number, number] },
    { id: "C2.4", cefr: "C2", title: "C2.4 - Aesthetics & Cryptography", description: "Persepsi keindahan dan penguraian kode bahasa rahasia.", orderIndex: 22, unitRange: [7, 8] as [number, number] },
    { id: "C2.5", cefr: "C2", title: "C2.5 - Ethics & Academic Thought", description: "Keadilan sosial dan filsafat pembelajaran seumur hidup.", orderIndex: 23, unitRange: [9, 10] as [number, number] },
    { id: "C2.6", cefr: "C2", title: "C2.6 - Modern Era & Heroism", description: "Dunia abad 21 dan esensi kepahlawanan sejati.", orderIndex: 24, unitRange: [11, 12] as [number, number] },
  ];

  // 1. Seed Progressive Sub-Levels
  for (const sl of SUB_LEVELS) {
    await db
      .insert(curriculumLevels)
      .values({
        id: sl.id,
        cefr: sl.cefr,
        title: sl.title,
        description: sl.description,
        orderIndex: sl.orderIndex,
      })
      .onConflictDoUpdate({
        target: curriculumLevels.id,
        set: {
          cefr: sl.cefr,
          title: sl.title,
          description: sl.description,
          orderIndex: sl.orderIndex,
        },
      });
  }
  console.log(`✓ ${SUB_LEVELS.length} Sub-Level (A1.1 s/d C2.6) berhasil disimpan.`);

  // Clean Slate: Hapus level lama yang bukan sub-level (misal A1, A2, dll)
  for (const legacyId of ["A1", "A2", "B1", "B2", "C1", "C2", "B1.4", "B2.4"]) {
    await db.delete(curriculumLevels).where(eq(curriculumLevels.id, legacyId));
  }
  // Hapus modul A1 lama (A1-M01 s/d A1-M12)
  for (let i = 1; i <= 12; i++) {
    const legacyModId = `A1-M${i.toString().padStart(2, "0")}`;
    await db.delete(moduleSections).where(eq(moduleSections.moduleId, legacyModId));
    await db.delete(curriculumModules).where(eq(curriculumModules.id, legacyModId));
  }
  // Hapus modul A2 lama (A2-M01 s/d A2-M12)
  for (let i = 1; i <= 12; i++) {
    const legacyModId = `A2-M${i.toString().padStart(2, "0")}`;
    await db.delete(moduleSections).where(eq(moduleSections.moduleId, legacyModId));
    await db.delete(curriculumModules).where(eq(curriculumModules.id, legacyModId));
  }
  // Hapus modul B1 lama (B1-M01 s/d B1-M12)
  for (let i = 1; i <= 12; i++) {
    const legacyModId = `B1-M${i.toString().padStart(2, "0")}`;
    await db.delete(moduleSections).where(eq(moduleSections.moduleId, legacyModId));
    await db.delete(curriculumModules).where(eq(curriculumModules.id, legacyModId));
  }
  // Hapus modul B2 lama (B2-M01 s/d B2-M12)
  for (let i = 1; i <= 12; i++) {
    const legacyModId = `B2-M${i.toString().padStart(2, "0")}`;
    await db.delete(moduleSections).where(eq(moduleSections.moduleId, legacyModId));
    await db.delete(curriculumModules).where(eq(curriculumModules.id, legacyModId));
  }

  for (const relPath of dataFiles) {
    const dataPath = path.resolve(import.meta.dir, "../../../../", relPath);
    if (!fs.existsSync(dataPath)) continue;

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const parsed = JSON.parse(rawData);
    const cefr = parsed.level?.cefr || parsed.cefr;

    // 2. Seed Modules & Sections
    const modules = parsed.modules;
    for (const m of modules) {
      const subLevel = SUB_LEVELS.find(
        (sl) => sl.id === m.levelId || (sl.cefr === cefr && m.orderIndex >= sl.unitRange[0] && m.orderIndex <= sl.unitRange[1])
      );
      const assignedLevelId = m.levelId || (subLevel ? subLevel.id : "A1.1");
      const isSubLevelExam = m.isExam !== undefined ? m.isExam : (subLevel ? m.orderIndex === subLevel.unitRange[1] : false);
      const passingScore = m.passingScore || (isSubLevelExam ? 75 : 70);

      await db
        .insert(curriculumModules)
        .values({
          id: m.id,
          levelId: assignedLevelId,
          title: m.title,
          cefr: m.cefr || cefr,
          group: subLevel?.title || m.group || "Core Units",
          objective: m.objective,
          complexity: m.complexity || "medium",
          estimatedMinutes: m.estimatedMinutes || 15,
          isExam: isSubLevelExam,
          passingScore: passingScore,
          orderIndex: m.orderIndex || 1,
        })
        .onConflictDoUpdate({
          target: curriculumModules.id,
          set: {
            levelId: assignedLevelId,
            title: m.title,
            cefr: m.cefr || cefr,
            group: subLevel?.title || m.group || "Core Units",
            objective: m.objective,
            complexity: m.complexity || "medium",
            estimatedMinutes: m.estimatedMinutes || 15,
            isExam: isSubLevelExam,
            passingScore: passingScore,
            orderIndex: m.orderIndex || 1,
          },
        });

      // Clear existing sections for clean slate
      await db.delete(moduleSections).where(eq(moduleSections.moduleId, m.id));

      // Handle New Object-style sections
      if (m.sections && !Array.isArray(m.sections) && typeof m.sections === "object") {
        const sectionDefs = [
          {
            type: "theory",
            title: "Teori & Tata Bahasa (Theory & Grammar)",
            content: m.sections.theory || {},
          },
          {
            type: "vocab",
            title: "Kosakata Kunci (Key Vocabulary)",
            content: { items: m.sections.vocab || [] },
          },
          {
            type: "dialogue",
            title: "Percakapan Kontekstual (Contextual Dialogue)",
            content: m.sections.dialogue || { context: "", lines: [] },
          },
          {
            type: "practice",
            title: "Praktikum Berbicara (Speaking Lab)",
            content: {
              roleplay: m.sections.speakingLab || { context: "", roles: ["Mr. Khoirul", "You"], turns: [] },
              drills: [],
              challenge: { scenario: m.sections.speakingLab?.context || "" },
            },
          },
          {
            type: "quiz",
            title: "Kuis Evaluasi (Evaluation Quiz)",
            content: {
              questions: Array.isArray(m.sections.quiz)
                ? m.sections.quiz.map((q: any, qIdx: number) => ({
                    id: q.id || `${m.id}-Q${qIdx + 1}`,
                    ...q,
                  }))
                : [],
            },
          },
        ];

        for (let i = 0; i < sectionDefs.length; i++) {
          const sec = sectionDefs[i];
          await db.insert(moduleSections).values({
            id: `${m.id}-SEC-${i + 1}`,
            moduleId: m.id,
            sectionType: sec.type,
            title: sec.title,
            content: sec.content,
            orderIndex: i + 1,
          });
        }
        console.log(`  ✓ Modul ${m.id}: ${m.title} (5 sections resmi) tersimpan.`);
      }
      // Handle Legacy Array-style sections
      else if (m.sections && Array.isArray(m.sections)) {
        for (let i = 0; i < m.sections.length; i++) {
          const sec = m.sections[i];
          await db.insert(moduleSections).values({
            id: `${m.id}-SEC-${i + 1}`,
            moduleId: m.id,
            sectionType: sec.sectionType,
            title: sec.title,
            content: sec.content,
            orderIndex: i + 1,
          });
        }
        console.log(`  ✓ Modul ${m.id}: ${m.title} (${m.sections.length} sections) tersimpan.`);
      }
    }
  }

  console.log("Seeding Kurikulum sukses tuntas.");
  process.exit(0);
}

runSeedLevelModules().catch((err) => {
  console.error("Gagal seeding modul level:", err);
  process.exit(1);
});
