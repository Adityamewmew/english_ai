import fs from "fs";
import path from "path";

async function main() {
  const baseUrl = "http://localhost:20128/v1/chat/completions";
  const apiKey = "sk-96f2316f84884524-286a68-e9103247";

  const systemPrompt = `You are an expert Cambridge and Oxford CEFR A1 English speaking curriculum designer.
Generate exactly 10 fresh, engaging, and pedagogical Speaking Practicum questions for CEFR A1 Unit 1: 'One World: Countries, Nationalities and Verb To Be'.
All instructions and hints must be in Indonesian, while all English targets, prompts, and audio texts must be in natural English for A1 beginners.

You MUST follow this exact breakdown of 10 questions:
1. Soal 1-2: category 'storytelling' (Siswa harus bercerita / monolog terstruktur).
   - Soal 1: Narasi perkenalan diri lengkap (nama, asal kota & negara, profesi/status, 1 minat/hobi). Must have 'storyPoints' array with 3 bullet points.
   - Soal 2: Narasi memperkenalkan teman internasional atau atlet favorit (nama teman, negara asal, kebangsaan, profesi/olahraganya). Must have 'storyPoints' array with 3 bullet points.
2. Soal 3-6: category 'roleplay' (Roleplay langsung dengan Mr. Khoirul, HARUS ada konteks skenario nyata yang jelas).
   - Soal 3: Konteks 'Student Registration Desk' (Mr. Khoirul sebagai Front Desk Officer meminta info identitas & paspor).
   - Soal 4: Konteks 'Youth Hostel Lounge' (Mr. Khoirul sebagai sesama backpacker ramah menyapa dan menanyakan asal negara & tujuan wisata).
   - Soal 5: Konteks 'Airport Arrival / Immigration Counter' (Mr. Khoirul sebagai Border Officer menanyakan kewarganegaraan & tujuan kedatangan).
   - Soal 6: Konteks 'International Classroom Partner Meetup' (Mr. Khoirul sebagai teman sekelas internasional berkenalan dan mencari partner kelompok).
   Must include 'scenarioContext' (string) and 'characterRole' (string) on all 4 roleplay questions!
3. Soal 7-10: category 'linguistic_drill' (Drill terfokus untuk aspek kosakata, tata bahasa, dan pelafalan):
   - Soal 7: focus 'vocab', typeLabel 'Linguistic Drill: Kosakata (Country vs Nationality)'. Melatih penggunaan kata negara vs kebangsaan secara tepat dalam kalimat lisan.
   - Soal 8: focus 'grammar', typeLabel 'Linguistic Drill: Tata Bahasa (Verb To Be & Pronouns)'. Melatih reflek lisan pemakaian am/is/are dan subjek He/She/We/They.
   - Soal 9: focus 'pronunciation_stress', typeLabel 'Linguistic Drill: Pelafalan (Syllable Stress Shift)'. Melatih pergeseran tekanan suku kata (misal CA-na-da -> ca-NA-di-an, JA-pan -> ja-pa-NESE).
   - Soal 10: focus 'pronunciation_intonation', typeLabel 'Linguistic Drill: Intonasi (Rising ↑ & Falling ↓ Pitch)'. Melatih intonasi naik untuk pertanyaan ya/tidak dan intonasi turun untuk kalimat pernyataan.

Return ONLY a valid JSON array of 10 objects matching this schema:
[
  {
    "id": 1,
    "category": "storytelling",
    "typeLabel": "Storytelling & Narasi Diri",
    "instruction": "Indonesian instruction text",
    "audioPrompt": "English spoken prompt by Mr. Khoirul",
    "scenarioContext": "Konteks situasi (khusus roleplay)",
    "characterRole": "Peran Mr. Khoirul (khusus roleplay)",
    "focus": "vocab | grammar | pronunciation_stress | pronunciation_intonation (khusus drill)",
    "storyPoints": ["Point 1", "Point 2", "Point 3"],
    "targetSentence": "English target spoken sentence",
    "phonetic": "/IPA transcription/",
    "expectedKeywords": ["key1", "key2"],
    "hint": "Indonesian practical pronunciation hint",
    "explanation": "Indonesian pedagogical explanation"
  }
]
No markdown wrapping, just raw JSON.`;

  console.log("🚀 Requesting 10 questions from OmniRoute (http://localhost:20128/v1)...");
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "auto/best-chat",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "Generate 10 completely fresh, creative CEFR A1 speaking questions for Unit 1 now as valid JSON.",
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OmniRoute error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as any;
  const rawText = data?.choices?.[0]?.message?.content || "";
  console.log("📦 Received response from OmniRoute, length:", rawText.length);

  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const questions = JSON.parse(cleaned);
  console.log(`✅ Successfully parsed ${questions.length} questions from OmniRoute!`);

  const pilotPath = path.resolve(import.meta.dir, "../../../../data/pilot_modules/A1.1-M01.json");
  const pilotData = JSON.parse(fs.readFileSync(pilotPath, "utf8"));

  const speakingSub = pilotData.subModules.find((s: any) => s.id === "sub-a1-1-m01-speaking");
  if (!speakingSub) throw new Error("Speaking submodule not found in pilotData");

  const quizSec = speakingSub.sections.find((s: any) => s.sectionType === "quiz");
  if (!quizSec) throw new Error("Quiz section not found in speaking submodule");

  quizSec.content.practicumQuestions = questions;

  fs.writeFileSync(pilotPath, JSON.stringify(pilotData, null, 2), "utf8");
  console.log("💾 Updated data/pilot_modules/A1.1-M01.json with OmniRoute questions!");
}

main().catch((err) => {
  console.error("❌ Generation error:", err);
  process.exit(1);
});
