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
            summary: "Dalam modul ini, kamu akan mempelajari cara membangun kalimat bahasa Inggris yang utuh dan akurat: mulai dari formula dasar Subject + Verb + Complement, penerapan huruf kapital, hingga menulis profil perkenalan diri secara mandiri.",
            blueprintItems: [
              {
                part: "Subject",
                role: "Pelaku / Subjek",
                examples: ["Liam", "I", "She", "They"],
                color: "border-sky-300 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200",
                tagColor: "bg-sky-200/70 text-sky-800 dark:bg-sky-800/60 dark:text-sky-200"
              },
              {
                part: "Verb ('to be')",
                role: "Kata Kerja Penghubung",
                examples: ["is", "am", "is", "are"],
                color: "border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200",
                tagColor: "bg-amber-200/70 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200"
              },
              {
                part: "Complement",
                role: "Pelengkap (Asal, Status, Sifat)",
                examples: ["from Melbourne.", "a student.", "Italian.", "close friends."],
                color: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200",
                tagColor: "bg-emerald-200/70 text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-200"
              }
            ],
            mechanicsRules: [
              {
                title: "Huruf Kapital Wajib",
                rule: "Gunakan huruf kapital untuk awal kalimat, kata ganti 'I', nama orang (Liam), negara (Indonesia), dan kebangsaan (Spanish).",
                example: "I am from Jakarta and he is Japanese."
              },
              {
                title: "Tanda Baca Akhir (.)",
                rule: "Setiap kalimat pernyataan wajib ditutup dengan tanda titik (.) tepat di belakang kata terakhir tanpa spasi.",
                example: "She is 16 years old."
              },
              {
                title: "Subjek-Verb Agreement",
                rule: "Pastikan bentuk 'to be' selaras dengan subjek: I am, He/She/It is, We/They are.",
                example: "They are students at London University."
              }
            ],
            sampleSentences: [
              { text: "Liam is from Melbourne, Australia.", audio: "Liam is from Melbourne, Australia." },
              { text: "I am a high school student.", audio: "I am a high school student." },
              { text: "Marco isn't French. He is Spanish.", audio: "Marco isn't French. He is Spanish." }
            ]
          },
        },
        {
          sectionType: "practice",
          title: "Praktikum Konstruksi Kalimat (Writing Practice)",
          orderIndex: 2,
          content: {
            mechanicsChallenges: [
              {
                id: "sent-1",
                faultySentence: "she is italian. she is from italy.",
                targetSentence: "She is Italian. She is from Italy.",
                translation: "Dia orang Italia. Dia berasal dari Italia.",
                keyRule: "Kapital untuk awal kalimat ('She'), kewarganegaraan ('Italian'), dan negara ('Italy').",
                requiredCapitals: ["She", "Italian", "Italy"]
              },
              {
                id: "sent-2",
                faultySentence: "i am from tokyo, japan.",
                targetSentence: "I am from Tokyo, Japan.",
                translation: "Saya berasal dari Tokyo, Jepang.",
                keyRule: "Kata ganti 'I' selalu kapital. Kota 'Tokyo' dan negara 'Japan' wajib diawali huruf kapital.",
                requiredCapitals: ["I", "Tokyo", "Japan"]
              },
              {
                id: "sent-3",
                faultySentence: "marco isn't french. he is spanish.",
                targetSentence: "Marco isn't French. He is Spanish.",
                translation: "Marco bukan orang Prancis. Dia orang Spanyol.",
                keyRule: "Nama orang ('Marco'), kebangsaan ('French', 'Spanish'), dan awal kalimat kedua ('He').",
                requiredCapitals: ["Marco", "French", "He", "Spanish"]
              },
              {
                id: "sent-4",
                faultySentence: "my teacher is mr. khoirul and he is indonesian.",
                targetSentence: "My teacher is Mr. Khoirul and he is Indonesian.",
                translation: "Guru saya adalah Pak Khoirul dan beliau berkebangsaan Indonesia.",
                keyRule: "Gelar sapaan ('Mr.'), nama orang ('Khoirul'), dan kebangsaan ('Indonesian') wajib kapital.",
                requiredCapitals: ["My", "Mr.", "Khoirul", "Indonesian"]
              },
              {
                id: "sent-5",
                faultySentence: "we are students from london, the uk.",
                targetSentence: "We are students from London, the UK.",
                translation: "Kami adalah pelajar dari London, Inggris Raya.",
                keyRule: "Awal kalimat ('We'), kota ('London'), dan singkatan resmi negara ('UK') wajib kapital.",
                requiredCapitals: ["We", "London", "UK"]
              }
            ],
            sentenceBuilderTargets: [
              {
                id: "b-1",
                category: "Afirmatif & Asal",
                meaning: "Saya berasal dari Indonesia dan saya adalah seorang pelajar.",
                tokens: ["I", "am", "from", "Indonesia", "and", "I", "am", "a", "student."],
                fullSentence: "I am from Indonesia and I am a student."
              },
              {
                id: "b-2",
                category: "Bentuk Negatif & Kontras",
                meaning: "Dia bukan berasal dari Spanyol tetapi dari Italia.",
                tokens: ["She", "is", "not", "from", "Spain", "but", "from", "Italy."],
                fullSentence: "She is not from Spain but from Italy."
              },
              {
                id: "b-3",
                category: "Usia & Tempat Tinggal",
                meaning: "Dia berasal dari Melbourne dan dia berusia 16 tahun.",
                tokens: ["He", "is", "from", "Melbourne", "and", "he", "is", "16", "years", "old."],
                fullSentence: "He is from Melbourne and he is 16 years old."
              },
              {
                id: "b-4",
                category: "Kalimat Tanya & Kewarganegaraan",
                meaning: "Dari mana kamu berasal dan apa kewarganegaraanmu?",
                tokens: ["Where", "are", "you", "from", "and", "what", "is", "your", "nationality?"],
                fullSentence: "Where are you from and what is your nationality?"
              },
              {
                id: "b-5",
                category: "Idola & Minat Favorit",
                meaning: "Atlet favorit saya adalah Lionel Messi dan dia berasal dari Argentina.",
                tokens: [
                  "My",
                  "favourite",
                  "athlete",
                  "is",
                  "Lionel",
                  "Messi",
                  "and",
                  "he",
                  "is",
                  "from",
                  "Argentina."
                ],
                fullSentence: "My favourite athlete is Lionel Messi and he is from Argentina."
              }
            ],
            guidedLabChallenges: [
              {
                id: "ch-1",
                title: "Tantangan 1: Perkenalan Diri Sendiri",
                badge: "Personal Bio",
                instruction: "Tuliskan 3-5 kalimat perkenalan diri dalam bahasa Inggris: sebutkan namamu, usia, asal kota & negara, serta status/profesimu saat ini.",
                example: "Hello! My name is Aditya. I am 16 years old. I am from Jakarta, Indonesia. I am a student.",
                placeholder: "Start writing here... (Hello! My name is...)",
                minWords: 10,
                xpReward: 30
              },
              {
                id: "ch-2",
                title: "Tantangan 2: Profil Teman Sekelas",
                badge: "Third-Person Bio",
                instruction: "Tuliskan 3-5 kalimat mendeskripsikan teman sekelasmu menggunakan subjek ketiga (He is... / She is...): sebutkan namanya, kewarganegaraan, asal negara, dan usianya.",
                example: "This is my classmate. Her name is Marta. She is from Madrid, Spain. She is Spanish and she is 16 years old.",
                placeholder: "Start writing here... (This is my classmate. His/Her name is...)",
                minWords: 12,
                xpReward: 35
              },
              {
                id: "ch-3",
                title: "Tantangan 3: Tokoh / Atlet Favorit",
                badge: "Favourite Idol",
                instruction: "Tuliskan 3-5 kalimat tentang atlet, seniman, atau tokoh favoritmu: gunakan frasa 'My favourite...', sebutkan asal negaranya, dan profesinya.",
                example: "My favourite athlete is Lionel Messi. He is a legendary football player. He is from Argentina. He is very inspiring.",
                placeholder: "Start writing here... (My favourite athlete/singer is...)",
                minWords: 12,
                xpReward: 40
              }
            ],
            practicumQuestions: [
              {
                id: 1,
                typeLabel: "Transformasi Kalimat",
                instruction: "Ubah kalimat afirmatif berikut menjadi kalimat negatif lengkap:",
                promptText: "Liam is from Melbourne.",
                hint: "Gunakan 'is not' atau singkatan 'isn't'",
                targetAnswers: ["Liam is not from Melbourne.", "Liam isn't from Melbourne."],
                explanation: "Bentuk negatif dari 'Liam is' adalah 'Liam is not' atau singkatan 'Liam isn't'."
              },
              {
                id: 2,
                typeLabel: "Penggabungan Kalimat ('and')",
                instruction: "Gabungkan dua kalimat berikut menjadi satu kalimat utuh menggunakan kata hubung 'and':",
                promptText: "\"I am 16 years old.\" + \"I am a student.\"",
                hint: "I am 16 years old and I am a student.",
                targetAnswers: [
                  "I am 16 years old and I am a student.",
                  "I am 16 years old and a student.",
                  "I'm 16 years old and I'm a student."
                ],
                explanation: "Gunakan kata hubung 'and' untuk menyambungkan dua klausa afirmatif yang setara."
              },
              {
                id: 3,
                typeLabel: "Penggabungan Kalimat Kontras ('but')",
                instruction: "Gabungkan dua kalimat kontras berikut menggunakan kata hubung 'but':",
                promptText: "\"She is from Spain.\" + \"She lives in London.\"",
                hint: "Gunakan koma sebelum 'but' untuk menghubungkan dua klausa utuh.",
                targetAnswers: [
                  "She is from Spain, but she lives in London.",
                  "She is from Spain but she lives in London."
                ],
                explanation: "Kata hubung 'but' digunakan untuk menghubungkan dua pernyataan yang kontras."
              },
              {
                id: 4,
                typeLabel: "Tanya Jawab Utuh (Origin)",
                instruction: "Jawab pertanyaan berikut dengan menuliskan satu kalimat afirmatif lengkap yang menyatakan kamu berasal dari Indonesia:",
                promptText: "Where are you from?",
                hint: "I am from Indonesia. (Perhatikan huruf kapital 'I' dan 'Indonesia')",
                targetAnswers: ["I am from Indonesia.", "I'm from Indonesia."],
                explanation: "Jawaban kalimat utuh yang tepat: 'I am from Indonesia.' atau 'I'm from Indonesia.'"
              },
              {
                id: 5,
                typeLabel: "Melengkapi Kalimat Utuh",
                instruction: "Ketik kalimat lengkap di bawah ini dengan melengkapi kata kerja 'to be' yang tepat:",
                promptText: "Marta _____ from Madrid, Spain.",
                hint: "Gunakan bentuk to be tunggal untuk Marta ('is')",
                targetAnswers: ["Marta is from Madrid, Spain."],
                explanation: "Subjek tunggal 'Marta' berpasangan dengan kata kerja to be 'is'."
              },
              {
                id: 6,
                typeLabel: "Koreksi Mekanika & Kapitalisasi",
                instruction: "Ketik ulang kalimat di bawah ini dengan memperbaiki seluruh huruf kapital dan tanda titik:",
                promptText: "they are japanese and they live in tokyo",
                hint: "Kapital untuk 'They', 'Japanese', dan 'Tokyo'",
                targetAnswers: ["They are Japanese and they live in Tokyo."],
                explanation: "Awal kalimat ('They'), kebangsaan ('Japanese'), dan nama kota ('Tokyo') wajib diawali huruf kapital."
              },
              {
                id: 7,
                typeLabel: "Konstruksi Kalimat Tanya",
                instruction: "Susun dan ketik kalimat tanya lengkap untuk menanyakan asal seseorang menggunakan kata 'Where' dan 'are':",
                promptText: "Where / you / from / ?",
                hint: "Where are you from?",
                targetAnswers: ["Where are you from?"],
                explanation: "Formula Wh-question: Where + to be (are) + Subject (you) + from?"
              },
              {
                id: 8,
                typeLabel: "Subjek-Verb Agreement Jamak",
                instruction: "Tuliskan kalimat afirmatif lengkap yang menyatakan bahwa kami adalah pelajar di sekolah:",
                promptText: "We / students / at school",
                hint: "We are students at school.",
                targetAnswers: ["We are students at school.", "We're students at school."],
                explanation: "Subjek jamak 'We' menggunakan kata kerja to be 'are'."
              },
              {
                id: 9,
                typeLabel: "Penulisan Singkatan (Contraction)",
                instruction: "Tulis ulang kalimat ini dengan mengubah 'I am' menjadi bentuk singkatan resmi (contraction):",
                promptText: "I am not French, I am Italian.",
                hint: "Gunakan tanda apostrof (') untuk menyingkat: I'm",
                targetAnswers: ["I'm not French, I'm Italian."],
                explanation: "Bentuk singkatan dari 'I am' adalah 'I'm'."
              },
              {
                id: 10,
                typeLabel: "Deskripsi Kalimat Utuh",
                instruction: "Tulis satu kalimat lengkap memperkenalkan temanmu bernama Alex yang berkebangsaan Australia:",
                promptText: "Alex / friend / Australian",
                hint: "This is Alex and he is Australian. ATAU Alex is my friend and he is Australian.",
                targetAnswers: [
                  "This is Alex and he is Australian.",
                  "My friend is Alex and he is Australian.",
                  "Alex is my friend and he is Australian.",
                  "His name is Alex and he is Australian."
                ],
                explanation: "Semua nama orang (Alex) dan kebangsaan (Australian) harus berhuruf kapital dengan struktur to be 'is'."
              }
            ]
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
