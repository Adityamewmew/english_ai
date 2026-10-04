import fs from "fs";
import path from "path";

export interface ReadinessQuestion {
  id: number;
  category: "Pengenalan Bentuk" | "Pemahaman Aturan" | "Penerapan Konteks";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Deterministic Fisher-Yates shuffle
function shuffleOptions(options: string[], correctItem: string, seed: number) {
  const arr = [...options];
  if (!arr.includes(correctItem)) {
    arr[0] = correctItem;
  }
  let state = Math.abs(seed) || 12345;
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return {
    options: arr,
    correctIndex: arr.indexOf(correctItem),
  };
}

function cleanStr(s: string): string {
  if (!s) return "";
  const first = s.split(/[\/,;\n]/)[0]?.trim() || s.trim();
  return first.replace(/[0-9.:]+$/, "").trim();
}

// Generate bespoke 3 questions for any module
export function buildReadinessQuestionsForModule(m: any, levelCefr: string): ReadinessQuestion[] {
  const theory = m.sections?.theory || {};
  const rules = Array.isArray(theory.rules) ? theory.rules : [];
  const commonTrap = theory.commonTrap || {};
  const dialogue = m.sections?.dialogue || {};
  const lines = Array.isArray(dialogue.lines) ? dialogue.lines : [];
  const vocab = Array.isArray(m.sections?.vocab) ? m.sections.vocab : [];

  const rawTitle = m.title || `Unit ${m.orderIndex}`;
  // Extract topic after colon if available: e.g. "Unit 11: Making the News: Passive Voice" -> "Passive Voice"
  const titleParts = rawTitle.split(":");
  const topicName = (titleParts.length > 2 ? titleParts[2] : titleParts[titleParts.length - 1])?.trim() || rawTitle;
  const seedBase = (m.orderIndex || 1) * 739 + topicName.length * 31;

  const questions: ReadinessQuestion[] = [];

  // =========================================================================
  // Q1: Pengenalan Bentuk & Kaidah (Form & Structure Recognition)
  // =========================================================================
  const q1Seed = seedBase + 107;
  let q1Prompt = `Berdasarkan materi "${topicName}", manakah pola pembentukan kalimat yang tepat?`;
  let correctOpt1 = "";
  let distractor1_1 = "";
  let distractor1_2 = "";
  let q1Explanation = "";

  const r0 = rules[0];
  if (r0 && typeof r0 === "object" && r0 !== null) {
    if (r0.pattern && r0.example) {
      q1Prompt = `Perhatikan kaidah "${topicName}". Manakah kalimat yang tepat menerapkan pola "${r0.pattern}"?`;
      correctOpt1 = cleanStr(r0.example);
      distractor1_1 = commonTrap.wrong ? cleanStr(commonTrap.wrong) : correctOpt1.replace(/\b(am|is|are|was|were|will|should|must)\b/i, "");
      distractor1_2 = correctOpt1.replace(/\b([a-zA-Z]+ing|[a-zA-Z]+ed)\b/i, "to $1");
      q1Explanation = `Pola yang benar adalah ${r0.pattern}. Contoh: "${r0.example}". ${r0.meaning ? `(${r0.meaning})` : ""}`;
    } else if (r0.pronoun && r0.example) {
      q1Prompt = `Manakah contoh kalimat yang benar untuk subjek "${r0.pronoun}" pada materi ini?`;
      correctOpt1 = cleanStr(r0.example);
      distractor1_1 = correctOpt1.replace(/\b(was|were|am|is|are)\b/i, (m: string) =>
        m.toLowerCase() === "was" ? "were" : m.toLowerCase() === "is" ? "are" : "is"
      );
      distractor1_2 = commonTrap.wrong ? cleanStr(commonTrap.wrong) : "They was there.";
      q1Explanation = `Subjek "${r0.pronoun}" ${r0.meaning ? `(${r0.meaning})` : ""} digunakan dalam kalimat: "${r0.example}".`;
    }
  } else if (typeof r0 === "string") {
    // String rule: e.g. "Reported Speech - Perubahan Tenses: present simple → past simple (contoh: 'I work hard' → He said that he worked hard)..."
    // Extract example in quotes if present
    const quoteMatches = r0.match(/['"]([^'"]+)['"]\s*→\s*['"]?([^'")]*)['"]?/);
    const arrowMatches = r0.match(/([^:(]+)\s*→\s*([^:(]+)/);

    if (quoteMatches && quoteMatches[1] && quoteMatches[2]) {
      const direct = quoteMatches[1].trim();
      const reported = quoteMatches[2].trim();
      q1Prompt = `Perhatikan kalimat langsung: "${direct}". Bagaimana bentuk kalimat tidak langsung (reported/transformed) yang benar?`;
      correctOpt1 = reported;
      distractor1_1 = reported.replace(/\b(worked|said|told|was|were|had|could|would)\b/i, (m: string) => {
        if (m === "worked") return "works";
        if (m === "said") return "say";
        if (m === "had") return "have";
        if (m === "could") return "can";
        if (m === "would") return "will";
        return "is";
      });
      distractor1_2 = direct;
      q1Explanation = `Kaidah pada "${topicName}": bentuk yang tepat adalah "${reported}". Perhatikan perubahan tenses dan kata kerja bantunya.`;
    } else if (arrowMatches && arrowMatches[1] && arrowMatches[2]) {
      const left = arrowMatches[1].trim();
      const right = arrowMatches[2].trim();
      q1Prompt = `Pada kaidah "${topicName}", bagaimana perubahan atau padanan yang benar untuk "${left}"?`;
      correctOpt1 = right;
      distractor1_1 = `Tidak ada perubahan tenses pada ${left}`;
      distractor1_2 = `${left} selalu dihilangkan`;
      q1Explanation = `Dalam materi ini: ${left} berubah atau berpadanan menjadi "${right}".`;
    } else {
      // General rule statement
      const summaryFirst = (theory.summary || r0).split(".")[0] + ".";
      q1Prompt = `Manakah pernyataan yang BENAR mengenai kaidah pada topik "${topicName}"?`;
      correctOpt1 = r0.length > 90 ? r0.slice(0, 87) + "..." : r0;
      distractor1_1 = "Tenses dan susunan subjek tidak perlu diperhatikan";
      distractor1_2 = "Pola ini hanya boleh digunakan dalam situasi santai";
      q1Explanation = `Kaidah inti topik ini: ${summaryFirst}`;
    }
  }

  if (!correctOpt1) {
    correctOpt1 = `Gunakan kaidah baku untuk topik ${topicName}`;
    distractor1_1 = "Gunakan kata kerja tanpa aturan";
    distractor1_2 = "Abaikan pasangan subjek dan predikat";
    q1Explanation = theory.summary || `Pelajari kaidah dasar ${topicName}.`;
  }
  if (!distractor1_1 || distractor1_1 === correctOpt1) distractor1_1 = "Bentuk kalimat tidak baku";
  if (!distractor1_2 || distractor1_2 === correctOpt1) distractor1_2 = "Struktur kata terbalik";

  const q1Shuffled = shuffleOptions([correctOpt1, distractor1_1, distractor1_2], correctOpt1, q1Seed);
  questions.push({
    id: 1,
    category: "Pengenalan Bentuk",
    prompt: q1Prompt,
    options: q1Shuffled.options,
    correctIndex: q1Shuffled.correctIndex,
    explanation: q1Explanation,
  });

  // =========================================================================
  // Q2: Pemahaman Aturan & Jebakan (Rule & Trap Mastery)
  // =========================================================================
  const q2Seed = seedBase + 211;
  const trapCorrectRaw = commonTrap.correct || "";
  const trapWrongRaw = commonTrap.wrong || "";

  const correctOpt2 = cleanStr(trapCorrectRaw) || `Kalimat baku sesuai kaidah ${topicName}`;
  const wrongParts = trapWrongRaw.split(/[\/,;\n]/).map((s: string) => cleanStr(s)).filter(Boolean);
  const distractor2_1 = wrongParts[0] || "Kalimat dengan kesalahan umum";
  let distractor2_2 = wrongParts[1] || "";

  if (!distractor2_2 || distractor2_2 === distractor2_1) {
    if (/\b(am|is|are)\b/i.test(correctOpt2)) {
      distractor2_2 = correctOpt2.replace(/\b(am|is|are)\b/gi, (m: string) => (m.toLowerCase() === "is" ? "are" : "is"));
    } else if (/\b(was|were)\b/i.test(correctOpt2)) {
      distractor2_2 = correctOpt2.replace(/\b(was|were)\b/gi, (m: string) => (m.toLowerCase() === "was" ? "were" : "was"));
    } else if (/\b(said|told)\b/i.test(correctOpt2)) {
      distractor2_2 = correctOpt2.replace(/\btold\b/gi, "said to").replace(/\bsaid that\b/gi, "said me that");
    } else if (/\b(should|must)\b/i.test(correctOpt2)) {
      distractor2_2 = correctOpt2.replace(/\b(should|must)\b/gi, "$1 to");
    } else if (/\b(than)\b/i.test(correctOpt2)) {
      distractor2_2 = correctOpt2.replace(/\bthan\b/gi, "then");
    } else if (/\b(have|has)\b/i.test(correctOpt2)) {
      distractor2_2 = correctOpt2.replace(/\bhave\b/gi, "has").replace(/\bhas\b/gi, "have");
    } else {
      distractor2_2 = distractor2_1.length > 6 ? distractor2_1 + " always" : "Bentuk kalimat keliru";
    }
  }

  const prompt2Stems = [
    `Manakah kalimat yang BENAR dan terhindar dari jebakan kesalahan umum pada topik "${topicName}"?`,
    `Di antara pilihan berikut, manakah kalimat yang menggunakan tata bahasa baku yang tepat?`,
    `Perhatikan jebakan umum pada materi "${topicName}". Manakah kalimat yang SUDAH TEPAT?`,
  ];
  const q2Prompt = prompt2Stems[q2Seed % prompt2Stems.length];
  const q2Explanation = commonTrap.explanation || `Perhatikan perbedaan antara kalimat yang benar ("${correctOpt2}") dan kesalahan umum ("${distractor2_1}").`;

  const q2Shuffled = shuffleOptions([correctOpt2, distractor2_1, distractor2_2], correctOpt2, q2Seed);
  questions.push({
    id: 2,
    category: "Pemahaman Aturan",
    prompt: q2Prompt,
    options: q2Shuffled.options,
    correctIndex: q2Shuffled.correctIndex,
    explanation: q2Explanation,
  });

  // =========================================================================
  // Q3: Penerapan Konteks (Context Application)
  // =========================================================================
  const q3Seed = seedBase + 317;
  let q3Prompt = `Lengkapi dialog kontekstual berikut:`;
  let correctOpt3 = "";
  let distractor3_1 = "";
  let distractor3_2 = "";
  let q3Explanation = "";

  if (lines.length >= 2) {
    const useLater = lines.length >= 4 && q3Seed % 2 === 1;
    const l1 = useLater ? lines[2] : lines[0];
    const l2 = useLater ? lines[3] : lines[1];

    q3Prompt = `Lengkapi dialog percakapan berikut sesuai konteks:\n${l1.speaker}: "${l1.text}"\n${l2.speaker}: "[...]"`;
    correctOpt3 = l2.text;
    distractor3_1 = commonTrap.wrong ? cleanStr(commonTrap.wrong) : "I am not sure what you mean.";
    distractor3_2 = "Sorry, I forgot my keys at home.";
    q3Explanation = `Respon "${correctOpt3}" ${l2.translation ? `("${l2.translation}")` : ""} adalah jawaban yang tepat dan alami sesuai alur percakapan tokoh ${l2.speaker}.`;
  } else if (vocab.length > 0) {
    const targetVocab = vocab[q3Seed % vocab.length] || vocab[0];
    const word = targetVocab.word;
    const colloc = targetVocab.collocation || `I often use ${word} in daily conversation.`;
    const regex = new RegExp(`\\b${word}\\b`, "i");
    const blanked = colloc.replace(regex, "[...]");

    q3Prompt = `Lengkapi kalimat kontekstual berikut dengan kosakata yang tepat:\n"${blanked}" (Petunjuk arti: ${targetVocab.meaning || word})`;
    correctOpt3 = word;
    distractor3_1 = word.endsWith("ed") ? word.replace(/ed$/, "ing") : word + "ed";
    const altVocab = vocab.find((v: any) => v.word !== word);
    distractor3_2 = altVocab?.word || "incorrect";
    q3Explanation = `Kosakata yang tepat adalah "${word}" (${targetVocab.meaning || ""}).`;
  } else {
    q3Prompt = `Bagaimana cara paling tepat menggunakan konsep "${topicName}" dalam percakapan sehari-hari?`;
    correctOpt3 = `Menerapkannya sesuai fungsi komunikatif ${topicName}`;
    distractor3_1 = "Hanya digunakan saat membaca buku cerita lama";
    distractor3_2 = "Tidak boleh digunakan saat berbicara langsung";
    q3Explanation = theory.summary || `Gunakan konsep ${topicName} dalam konteks yang tepat.`;
  }

  const q3Shuffled = shuffleOptions([correctOpt3, distractor3_1, distractor3_2], correctOpt3, q3Seed);
  questions.push({
    id: 3,
    category: "Penerapan Konteks",
    prompt: q3Prompt,
    options: q3Shuffled.options,
    correctIndex: q3Shuffled.correctIndex,
    explanation: q3Explanation,
  });

  return questions;
}

// Process all files
export function processAllCurriculumFiles() {
  const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
  let totalProcessed = 0;

  for (const lvl of levels) {
    const combinedFile = path.resolve(`data/client_curriculum/level_${lvl}_all_sublevels.json`);
    if (!fs.existsSync(combinedFile)) continue;

    console.log(`Processing Level ${lvl.toUpperCase()}...`);
    const raw = fs.readFileSync(combinedFile, "utf-8");
    const data = JSON.parse(raw);

    for (const m of data.modules) {
      if (!m.sections) m.sections = {};
      if (!m.sections.theory) m.sections.theory = {};

      const readinessQuestions = buildReadinessQuestionsForModule(m, lvl.toUpperCase());
      m.sections.theory.readinessQuestions = readinessQuestions;

      // Also sync to single unit file if it exists: data/client_curriculum/{lvl}/{m.id}.json
      const singleFile = path.resolve(`data/client_curriculum/${lvl}/${m.id}.json`);
      if (fs.existsSync(singleFile)) {
        try {
          const singleRaw = fs.readFileSync(singleFile, "utf-8");
          const singleData = JSON.parse(singleRaw);
          if (!singleData.sections) singleData.sections = {};
          if (!singleData.sections.theory) singleData.sections.theory = {};
          singleData.sections.theory.readinessQuestions = readinessQuestions;
          fs.writeFileSync(singleFile, JSON.stringify(singleData, null, 2), "utf-8");
        } catch (e) {
          console.error(`Error updating single file ${singleFile}:`, e);
        }
      }

      totalProcessed++;
    }

    fs.writeFileSync(combinedFile, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Saved ${data.modules.length} modules for Level ${lvl.toUpperCase()} to ${combinedFile}`);
  }

  console.log(`\n🎉 Total ${totalProcessed} modules successfully enriched with bespoke static readinessQuestions!`);
}

processAllCurriculumFiles();
