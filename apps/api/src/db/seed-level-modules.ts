import { db } from "./index";
import { curriculumLevels, curriculumModules, moduleSections } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runSeedLevelModules() {
  console.log("Memulai seeding Kurikulum Level & Modul Progresif...");

  const dataFiles = [
    // Official Client Curriculum extracted from client PDFs & AI generated sub-levels
    "data/client_curriculum/level_a1_all_sublevels.json",
    "data/client_curriculum/level_a2_all_sublevels.json",
    "data/client_curriculum/level_b1_all_sublevels.json",
    "data/client_curriculum/level_b2_all_sublevels.json",
    "data/client_curriculum/level_c1_all_sublevels.json",
    "data/client_curriculum/level_c2_all_sublevels.json",
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
    // C1 (3 sub-levels - 13 units each: 12 modules + 1 graduation exam)
    { id: "C1.1", cefr: "C1", title: "C1.1 - Advanced Academic & Operational Fluency", description: "Penguasaan struktur kalimat kompleks, wacana akademis, dan ekspresi tingkat tinggi.", orderIndex: 13, unitRange: [1, 13] as [number, number] },
    { id: "C1.2", cefr: "C1", title: "C1.2 - Strategic Oratory & Complex Syntax", description: "Hedging akademis, nominalisasi padat, esai diskursif, dan retorika publik persuasif.", orderIndex: 14, unitRange: [1, 13] as [number, number] },
    { id: "C1.3", cefr: "C1", title: "C1.3 - Critical Dialectics & Bridge to C2", description: "Analisis geopolitik, debat etika filosofis, inversi stilistik, dan jembatan ke C2.", orderIndex: 15, unitRange: [1, 13] as [number, number] },
    // C2 (3 sub-levels - 13 units each: 12 modules + 1 graduation exam)
    { id: "C2.1", cefr: "C2", title: "C2.1 - Mastery Foundations & Rhetorical Wit", description: "Fondasi kemahiran mutlak, psikologi naratif, clefts, dan retorika humor berbobot.", orderIndex: 16, unitRange: [1, 13] as [number, number] },
    { id: "C2.2", cefr: "C2", title: "C2.2 - Dialectical Precision & Semiotic Depth", description: "Semiotika tanda, yurisprudensi hukum, retorika klasik, dan dekonstruksi teks.", orderIndex: 17, unitRange: [1, 13] as [number, number] },
    { id: "C2.3", cefr: "C2", title: "C2.3 - Ultimate Native Fluency & Grandmastery", description: "Kefasihan berdaulat (sovereign fluency), hermeneutika tingkat tinggi, dan kemahiran paripurna.", orderIndex: 18, unitRange: [1, 13] as [number, number] },
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
  console.log(`✓ ${SUB_LEVELS.length} Sub-Level (A1.1 s/d C2.3) berhasil disimpan.`);

  // Clean Slate: Hapus level lama yang bukan sub-level resmi
  for (const legacyId of [
    "A1", "A2", "B1", "B2", "C1", "C2",
    "B1.4", "B2.4",
    "C1.4", "C1.5", "C1.6",
    "C2.4", "C2.5", "C2.6"
  ]) {
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
  // Hapus modul C1 & C2 lama (C1-M01 s/d C1-M12 & C2-M01 s/d C2-M12)
  for (let i = 1; i <= 12; i++) {
    const pad = i.toString().padStart(2, "0");
    await db.delete(moduleSections).where(eq(moduleSections.moduleId, `C1-M${pad}`));
    await db.delete(curriculumModules).where(eq(curriculumModules.id, `C1-M${pad}`));
    await db.delete(moduleSections).where(eq(moduleSections.moduleId, `C2-M${pad}`));
    await db.delete(curriculumModules).where(eq(curriculumModules.id, `C2-M${pad}`));
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
        const speakingLabData = m.sections.speakingLab || { context: "", roles: ["Mr. Khoirul", "You"], turns: [] };
        const vocabList = Array.isArray(m.sections.vocab) ? m.sections.vocab : [];
        const theoryData = m.sections.theory || {};

        const drills: any[] = [];
        if (vocabList.length > 0) {
          vocabList.slice(0, 3).forEach((v: any, idx: number) => {
            const raw = v.collocation || `I am ${v.word}.`;
            const cleanText = raw.includes(" / ") ? raw.split(" / ")[0].trim() : raw.trim();
            drills.push({
              id: `drill-${idx + 1}`,
              targetText: cleanText,
              focus: `Pelafalan: "${v.word}" (${v.meaning || ""})`,
              hint: v.ipa ? `Panduan fonetik: ${v.ipa}` : `Fokus pada intonasi natural`,
            });
          });
        }
        if (drills.length === 0 && Array.isArray(speakingLabData.turns)) {
          const userTurns = speakingLabData.turns.filter((t: any) => {
            const sp = (t.speaker || "").toLowerCase();
            return sp.includes("you") || sp.includes("student") || sp.includes("kamu");
          });
          const sourceTurns = userTurns.length > 0 ? userTurns : speakingLabData.turns;
          sourceTurns.slice(0, 3).forEach((t: any, idx: number) => {
            const cleanText = t.text.includes(" / ") ? t.text.split(" / ")[0].trim() : t.text.trim();
            drills.push({
              id: `drill-${idx + 1}`,
              targetText: cleanText,
              focus: `Kelancaran berbicara & intonasi`,
              hint: `Ucapkan kalimat ini dengan percaya diri dan artikulasi jelas`,
            });
          });
        }

        let challengeExample = "";
        if (Array.isArray(speakingLabData.turns)) {
          const userTurns = speakingLabData.turns.filter((t: any) => {
            const sp = (t.speaker || "").toLowerCase();
            return sp.includes("you") || sp.includes("student");
          });
          const targetTurn = userTurns[userTurns.length - 1] || userTurns[0] || speakingLabData.turns[1];
          if (targetTurn?.text) {
            challengeExample = targetTurn.text.includes(" / ") ? targetTurn.text.split(" / ")[0].trim() : targetTurn.text.trim();
          }
        }
        if (!challengeExample && drills[0]?.targetText) {
          challengeExample = drills[0].targetText;
        }

        const challengeData = {
          scenario: speakingLabData.context || m.objective || "Lakukan percakapan spontan berdasarkan materi unit ini.",
          exampleAnswer: challengeExample || "I can speak English with confidence.",
          targetGrammar: (Array.isArray(theoryData.rules) && theoryData.rules[0]) || `Gunakan tata bahasa yang tepat dari ${m.title}`,
        };

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
              roleplay: speakingLabData,
              drills,
              challenge: challengeData,
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
