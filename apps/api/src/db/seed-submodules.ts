import { db } from "./index";
import { subModules, moduleSections, curriculumModules } from "./schema";
import { eq, inArray } from "drizzle-orm";

export async function seedSubModulesForModule(moduleId: string, force: boolean = true) {
  const [mod] = await db
    .select()
    .from(curriculumModules)
    .where(eq(curriculumModules.id, moduleId))
    .limit(1);

  if (!mod) {
    console.warn(`Module ${moduleId} not found`);
    return;
  }

  // Delete existing sub_modules if force is true
  if (force) {
    const existing = await db
      .select()
      .from(subModules)
      .where(eq(subModules.moduleId, moduleId));

    if (existing.length > 0) {
      const subIds = existing.map((s) => s.id);
      await db.delete(moduleSections).where(inArray(moduleSections.subModuleId, subIds));
      await db.delete(subModules).where(eq(subModules.moduleId, moduleId));
      console.log(`Cleaned up ${existing.length} existing sub-modules for ${moduleId}`);
    }
  }

  const subModuleDefs = [
    // -------------------------------------------------------------
    // 1. READING SUB-MODULE (Rich Passage, Grammar Rules, 5 Questions)
    // -------------------------------------------------------------
    {
      skillType: "reading",
      title: "Reading & Vocabulary Mastery",
      orderIndex: 1,
      sections: [
        {
          sectionType: "theory",
          title: "Pemahaman Konsep & Kosakata (Reading Theory)",
          orderIndex: 1,
          content: {
            readingPassage: {
              title: "Meet Liam from Australia: A Global Friendship",
              paragraphs: [
                "Hello! My name is Liam and I am twenty-two years old. I am from Melbourne, Australia, but now I live in London. London is a fantastic city with people from all over the world.",
                "My flatmate is Kenji. He is from Tokyo, Japan. Kenji is a graphic designer and I am a university student. We are good friends. Every morning, we speak English together because Kenji wants to practice his conversational skills.",
                "In our neighborhood, there are students from Brazil, Spain, and Canada. It is truly an international community where we learn about each other's cultures every day!"
              ],
              audioText: "Hello! My name is Liam and I am twenty-two years old. I am from Melbourne, Australia, but now I live in London. My flatmate is Kenji from Tokyo, Japan.",
            },
            summary: "Pelajari teks bacaan mengenai perkenalan diri, asal negara, dan penggunaan kata kerja 'to be' dalam konteks komunitas internasional.",
            rules: [
              {
                rule: "Subjek Tunggal & Jamak",
                explanation: "Gunakan 'am' untuk I, 'is' untuk he/she/it, dan 'are' untuk you/we/they.",
                example: "I am from Australia. Kenji is from Japan. We are friends."
              },
              {
                rule: "Perbedaan Negara & Kewarganegaraan",
                explanation: "Gunakan nama negara setelah kata 'from' (from Australia). Gunakan kewarganegaraan tanpa kata 'from' (He is Australian).",
                example: "He is from Japan (Country) = He is Japanese (Nationality)."
              },
              {
                rule: "Singkatan / Contractions",
                explanation: "Dalam bahasa Inggris kasual dan tulisan sehari-hari, bentuk 'to be' lazim disingkat.",
                example: "I'm Liam. He's my flatmate. They're students."
              },
              {
                rule: "Bentuk Negatif (Negative Form)",
                explanation: "Tambahkan kata 'not' setelah bentuk 'to be' untuk menyatakan negasi.",
                example: "Liam is not Japanese. They are not in Tokyo."
              }
            ],
            items: [
              { word: "Nationality", ipa: "ˌnæʃ.əˈnæl.ə.ti", meaning: "Kewarganegaraan", collocation: "hold dual nationality" },
              { word: "Flatmate", ipa: "ˈflæt.meɪt", meaning: "Teman satu apartemen / flat", collocation: "share a flat with my flatmate" },
              { word: "Community", ipa: "kəˈmjuː.nə.ti", meaning: "Komunitas / lingkungan", collocation: "international community" },
              { word: "Neighborhood", ipa: "ˈneɪ.bə.hʊd", meaning: "Lingkungan tempat tinggal", collocation: "in my neighborhood" },
              { word: "Conversational", ipa: "ˌkɒn.vəˈseɪ.ʃən.əl", meaning: "Percakapan sehari-hari", collocation: "conversational English skills" },
              { word: "Graphic designer", ipa: "ˌɡræf.ɪk dɪˈzaɪ.nər", meaning: "Desainer grafis", collocation: "work as a graphic designer" }
            ],
          },
        },
        {
          sectionType: "quiz",
          title: "Praktikum Evaluasi Membaca (Reading Quiz - 5 Soal)",
          orderIndex: 2,
          content: {
            questions: [
              {
                id: "A1.1-READ-Q1",
                question: "Where is Liam living right now according to the passage?",
                options: ["In Melbourne", "In London", "In Tokyo", "In Sydney"],
                answer: "In London",
                explanation: "Liam berasal dari Melbourne, Australia, tetapi saat ini ia tinggal di London (now I live in London)."
              },
              {
                id: "A1.1-READ-Q2",
                question: "What nationality is Kenji, Liam's flatmate?",
                options: ["Australian", "Japanese", "Spanish", "Canadian"],
                answer: "Japanese",
                explanation: "Kenji berasal dari Tokyo, Jepang, sehingga ia berkewarganegaraan Jepang (Japanese)."
              },
              {
                id: "A1.1-READ-Q3",
                question: "What is Kenji's profession?",
                options: ["University student", "Graphic designer", "English teacher", "Hotel manager"],
                answer: "Graphic designer",
                explanation: "Di paragraf kedua tertulis: 'Kenji is a graphic designer and I am a university student.'"
              },
              {
                id: "A1.1-READ-Q4",
                question: "Why do Liam and Kenji speak English together every morning?",
                options: [
                  "Because Liam cannot understand English",
                  "Because Kenji wants to practice his conversational skills",
                  "Because they are taking an official university test",
                  "Because they want to move to Australia"
                ],
                answer: "Because Kenji wants to practice his conversational skills",
                explanation: "Teks menyatakan: 'because Kenji wants to practice his conversational skills'."
              },
              {
                id: "A1.1-READ-Q5",
                question: "Which form of 'to be' correctly completes: 'Liam and Kenji ___ flatmates in London'?",
                options: ["am", "is", "are", "be"],
                answer: "are",
                explanation: "Subjek jamak 'Liam and Kenji' (kata ganti 'they') selalu berpasangan dengan 'are'."
              }
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------
    // 2. LISTENING SUB-MODULE (Rich Dialogue, Audio Snippets, 5 Questions)
    // -------------------------------------------------------------
    {
      skillType: "listening",
      title: "Listening & Contextual Dialogue",
      orderIndex: 2,
      sections: [
        {
          sectionType: "dialogue",
          title: "Materi Simakan & Dialog Interaktif (Listening Context)",
          orderIndex: 1,
          content: {
            context: "Percakapan natural antara resepsionis hotel (Sarah) dan tamu baru (Marco) saat proses check-in di London.",
            lines: [
              { speaker: "Sarah (Receptionist)", en: "Good afternoon! Welcome to the Grand International Hotel. What is your full name, please?", id: "L1" },
              { speaker: "Marco Rossi", en: "Hello! My name is Marco Rossi. That is spelled R-O-S-S-I.", id: "L2" },
              { speaker: "Sarah (Receptionist)", en: "Thank you, Mr. Rossi. Where are you from?", id: "L3" },
              { speaker: "Marco Rossi", en: "I am from Rome, Italy. It is my very first time visiting London.", id: "L4" },
              { speaker: "Sarah (Receptionist)", en: "Wonderful! Are you here for business or on holiday?", id: "L5" },
              { speaker: "Marco Rossi", en: "I am here on vacation with my family. They are still at Heathrow Airport.", id: "L6" },
              { speaker: "Sarah (Receptionist)", en: "Understood. Your room is on the fourth floor, room number 402. Here is your keycard.", id: "L7" },
              { speaker: "Marco Rossi", en: "Thank you very much for your kind help, Sarah!", id: "L8" }
            ],
          },
        },
        {
          sectionType: "quiz",
          title: "Praktikum Menyimak Audio (Listening Quiz - 5 Soal)",
          orderIndex: 2,
          content: {
            questions: [
              {
                id: "A1.1-LISTEN-Q1",
                question: "Dengarkan audio: Di manakah kota asal Marco?",
                audioScript: "Sarah: Where are you from, Mr. Rossi? Marco: I am from Rome, Italy.",
                options: ["Milan", "Rome", "Venice", "Naples"],
                answer: "Rome",
                explanation: "Marco menyatakan secara jelas: 'I am from Rome, Italy.'"
              },
              {
                id: "A1.1-LISTEN-Q2",
                question: "Dengarkan audio: Apa tujuan kedatangan Marco ke London?",
                audioScript: "Sarah: Are you here for business or on holiday? Marco: I am here on vacation with my family.",
                options: ["Business trip", "Family vacation", "University study", "Medical checkup"],
                answer: "Family vacation",
                explanation: "Marco menjawab bahwa ia sedang berlibur bersama keluarganya ('on vacation with my family')."
              },
              {
                id: "A1.1-LISTEN-Q3",
                question: "Dengarkan audio: Berapakah nomor kamar hotel Marco?",
                audioScript: "Sarah: Your room is on the fourth floor, room number 402. Here is your keycard.",
                options: ["Room 204", "Room 402", "Room 420", "Room 412"],
                answer: "Room 402",
                explanation: "Sarah mengonfirmasi kamar berada di lantai empat, nomor 402 ('room number 402')."
              },
              {
                id: "A1.1-LISTEN-Q4",
                question: "Dengarkan audio: Di manakah keluarga Marco berada saat percakapan berlangsung?",
                audioScript: "Marco: They are still at Heathrow Airport. Sarah: Understood.",
                options: ["In the hotel taxi", "In Rome", "At Heathrow Airport", "In the restaurant"],
                answer: "At Heathrow Airport",
                explanation: "Marco menyampaikan bahwa keluarganya masih di bandara ('still at Heathrow Airport')."
              },
              {
                id: "A1.1-LISTEN-Q5",
                question: "Dengarkan audio: Bagaimana Marco mengeja nama belakangnya?",
                audioScript: "Marco: Hello! My name is Marco Rossi. That is spelled R-O-S-S-I.",
                options: ["R-O-S-E-I", "R-U-S-S-I", "R-O-S-S-I", "R-O-S-S-Y"],
                answer: "R-O-S-S-I",
                explanation: "Marco mengeja nama belakangnya sebagai: R-O-S-S-I."
              }
            ],
          },
        },
      ],
    },

    // -------------------------------------------------------------
    // 3. WRITING SUB-MODULE (Grammar Mechanics, Builder Game + 5 Questions)
    // -------------------------------------------------------------
    {
      skillType: "writing",
      title: "Sentence Construction & Writing",
      orderIndex: 3,
      sections: [
        {
          sectionType: "theory",
          title: "Struktur Penulisan Kalimat (Writing Mechanics)",
          orderIndex: 1,
          content: {
            rules: [
              {
                rule: "Formula Anatomi Kalimat",
                explanation: "Kalimat afirmatif dasar bahasa Inggris selalu tersusun dari: Subjek (Subject) + Kata Kerja (Verb 'to be') + Pelengkap (Complement).",
                example: "Subject (She) + Verb (is) + Complement (from Canada)."
              },
              {
                rule: "Aturan Huruf Kapital (Capitalization)",
                explanation: "Huruf kapital wajib digunakan untuk huruf pertama kalimat, kata ganti 'I', nama orang, nama negara, dan kewarganegaraan.",
                example: "I am Indonesian and my friend is French."
              },
              {
                rule: "Kata Hubung 'and' vs 'but'",
                explanation: "Gunakan 'and' untuk menambahkan informasi setara, dan 'but' untuk mengontraskan dua klausa.",
                example: "She is from Spain, but she lives in London."
              },
              {
                rule: "Tanda Baca (Punctuation)",
                explanation: "Gunakan tanda titik (.) di akhir kalimat pernyataan dan tanda tanya (?) di akhir kalimat pertanyaan.",
                example: "Where are you from? I am from Brazil."
              }
            ],
            summary: "Kuasai mekanika penulisan kalimat bahasa Inggris mulai dari penyusunan balok kata, penggunaan huruf kapital, hingga pembentukan paragraf deskriptif.",
            writingPrompt: "Tuliskan 3-5 kalimat perkenalan diri dalam bahasa Inggris: sebutkan namamu, asal kota & negaramu, kewarganegaraan, dan pekerjaan/statusmu saat ini."
          },
        },
        {
          sectionType: "practice",
          title: "Praktikum Konstruksi Kalimat (Writing Practice - 5 Latihan)",
          orderIndex: 2,
          content: {
            sentenceBuilderTargets: [
              "I am from Indonesia.",
              "They are students at London University.",
              "She is not from Spain but Italy."
            ],
            questions: [
              {
                id: "A1.1-WRITE-Q1",
                question: "Pilih kalimat tertulis dengan penggunaan huruf kapital dan tata bahasa yang benar:",
                options: [
                  "i am from japan and speak japanese.",
                  "I am from Japan and speak Japanese.",
                  "I am from japan and speak Japanese.",
                  "I am from Japan and Speak japanese."
                ],
                answer: "I am from Japan and speak Japanese.",
                explanation: "Huruf 'I', nama negara 'Japan', dan bahasa 'Japanese' wajib menggunakan huruf kapital."
              },
              {
                id: "A1.1-WRITE-Q2",
                question: "Susun kata-kata acak berikut menjadi kalimat tanya yang benar: [ from / where / you / are / ? ]",
                options: [
                  "Where you are from?",
                  "Where are from you?",
                  "Where are you from?",
                  "You are where from?"
                ],
                answer: "Where are you from?",
                explanation: "Rumus Wh-question dengan 'to be': Wh-word (Where) + Verb (are) + Subject (you) + from?"
              },
              {
                id: "A1.1-WRITE-Q3",
                question: "Lengkapi kalimat gabungan berikut dengan kata hubung yang tepat: 'He is from Australia, ___ he lives in Indonesia.'",
                options: ["and", "but", "so", "because"],
                answer: "but",
                explanation: "Kata 'but' digunakan untuk menghubungkan dua pernyataan yang kontras (asal Australia, tetapi tinggal di Indonesia)."
              },
              {
                id: "A1.1-WRITE-Q4",
                question: "Identifikasi kalimat negatif yang memiliki struktur tata bahasa yang sempurna:",
                options: [
                  "We not are from Canada.",
                  "We are not from Canada.",
                  "We doesn't from Canada.",
                  "We isn't from Canada."
                ],
                answer: "We are not from Canada.",
                explanation: "Bentuk negatif untuk subjek 'We' adalah 'are not' atau 'aren't'."
              },
              {
                id: "A1.1-WRITE-Q5",
                question: "Lengkapi subjek dan to be yang tepat: '___ a talented graphic designer from Tokyo.'",
                options: ["He are", "They is", "He is", "We is"],
                answer: "He is",
                explanation: "Subjek tunggal 'He' selalu berpasangan dengan 'is'."
              }
            ],
            challenge: {
              scenario: "Tuliskan 3-5 kalimat perkenalan diri dalam bahasa Inggris: sebutkan namamu, asal kota & negara, serta statusmu saat ini."
            }
          },
        },
      ],
    },

    // -------------------------------------------------------------
    // 4. SPEAKING SUB-MODULE (Phonetics, 5 Drills, AI Roleplay, Challenge)
    // -------------------------------------------------------------
    {
      skillType: "speaking",
      title: "Pronunciation & Interactive Speaking Lab",
      orderIndex: 4,
      sections: [
        {
          sectionType: "theory",
          title: "Panduan Intonasi & Pelafalan (Pronunciation Guide)",
          orderIndex: 1,
          content: {
            rules: [
              {
                rule: "Intonasi Naik vs Turun (Pitch Movement)",
                explanation: "Gunakan intonasi naik (rising pitch) di akhir pertanyaan Yes/No ('Are you from Spain? ↗'), dan intonasi turun (falling pitch) untuk pertanyaan Wh- ('Where are you from? ↘') serta kalimat pernyataan.",
                example: "Are you Japanese? ↗ | I am from Australia. ↘"
              },
              {
                rule: "Penekanan Suku Kata (Syllable Stress)",
                explanation: "Perhatikan pergeseran penekanan: 'JA-pan' (penekanan di suku kata pertama) vs 'ja-pa-NESE' (penekanan di suku kata ketiga).",
                example: "JA-pan vs ja-pa-NESE"
              },
              {
                rule: "Bunyi Konsonan /ð/ (Voiced Dental Fricative)",
                explanation: "Letakkan ujung lidah di antara gigi atas dan bawah saat mengucapkan kata 'they', 'this', 'that', 'there'.",
                example: "They are from Melbourne."
              }
            ],
            summary: "Latih artikulasi suara, intonasi pitch, dan irama berbicara sebelum berinteraksi secara real-time bersama AI Tutor Mr. Khoirul.",
            items: [
              { word: "Australia", ipa: "ɒsˈtreɪ.li.ə", meaning: "Negara Australia" },
              { word: "Japanese", ipa: "ˌdʒæp.əˈniːz", meaning: "Orang/Bahasa Jepang" },
              { word: "International", ipa: "ˌɪn.təˈnæʃ.ən.əl", meaning: "Internasional" },
              { word: "Nationality", ipa: "ˌnæʃ.əˈnæl.ə.ti", meaning: "Kewarganegaraan" }
            ]
          },
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara & Simulasi AI (Speaking Lab - 5 Drills)",
          orderIndex: 2,
          content: {
            drills: [
              {
                id: "drill-spk-1",
                targetText: "Hello! My name is Alex and I am from Indonesia.",
                focus: "Pembukaan perkenalan natural & pelafalan 'from'",
                hint: "Ucapkan dengan rileks dan intonasi deklaratif menurun di akhir kalimat."
              },
              {
                id: "drill-spk-2",
                targetText: "Are you from Spain or Italy?",
                focus: "Intonasi kontras pada pertanyaan pilihan (rising lalu falling)",
                hint: "Naikkan nada di kata 'Spain', turunkan nada di kata 'Italy'."
              },
              {
                id: "drill-spk-3",
                targetText: "They are my close friends from Melbourne, Australia.",
                focus: "Pengucapan konsonan voiced /ð/ pada 'They' dan ritme kalimat",
                hint: "Letakkan lidah di antara gigi saat mengucapkan 'They'."
              },
              {
                id: "drill-spk-4",
                targetText: "Nice to meet you! Where are you from?",
                focus: "Intonasi Wh-question menurun alami (Falling tone)",
                hint: "Ucapkan 'Where are you from' dengan penekanan pada 'Where' dan 'from'."
              },
              {
                id: "drill-spk-5",
                targetText: "We are proud students in this international English class.",
                focus: "Pelafalan kata 'international' dan kelancaran flow kalimat",
                hint: "Sambungkan kata secara mengalir tanpa jeda kaku."
              }
            ],
            roleplay: {
              context: "Kamu sedang berada di lounge pertemuan mahasiswa internasional di London. AI Tutor Mr. Khoirul menyapamu untuk berkenalan.",
              roles: ["Mr. Khoirul", "Student"],
              turns: [
                { speaker: "Mr. Khoirul", text: "Hi there! Welcome to our international lounge. What's your name?" },
                { speaker: "Student", text: "Hello! My name is [Your Name]. Nice to meet you!" },
                { speaker: "Mr. Khoirul", text: "Nice to meet you too! Where are you from?" },
                { speaker: "Student", text: "I am from Indonesia. Are you from London?" },
                { speaker: "Mr. Khoirul", text: "Yes, I live here in London. What do you do?" }
              ]
            },
            challenge: {
              scenario: "Lakukan perkenalan diri secara lisan selama 30-45 detik: sebutkan nama, asal negara & kotamu, kewarganegaraan, dan mengapa kamu ingin belajar bahasa Inggris!"
            }
          },
        },
      ],
    },
  ];

  for (const sDef of subModuleDefs) {
    const subModuleId = `${moduleId}-SUB-${sDef.skillType.toUpperCase()}`;
    await db.insert(subModules).values({
      id: subModuleId,
      moduleId,
      skillType: sDef.skillType,
      title: sDef.title,
      orderIndex: sDef.orderIndex,
    });

    for (const sec of sDef.sections) {
      const sectionId = `${subModuleId}-SEC-${sec.orderIndex}`;
      await db.insert(moduleSections).values({
        id: sectionId,
        moduleId,
        subModuleId,
        sectionType: sec.sectionType,
        title: sec.title,
        content: sec.content,
        orderIndex: sec.orderIndex,
      });
    }
  }

  console.log(`✅ Sub-modules seeded successfully for ${moduleId} with full 5+ questions per praktikum`);
}

async function main() {
  console.log("Seeding rich sub-modules for A1.1-M01...");
  await seedSubModulesForModule("A1.1-M01", true);
  console.log("Done!");
  process.exit(0);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Seed sub-modules error:", err);
    process.exit(1);
  });
}
