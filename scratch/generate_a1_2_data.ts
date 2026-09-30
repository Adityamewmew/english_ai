import fs from "fs";
import path from "path";

const levelA1_2 = {
  level: {
    id: "A1.2",
    cefr: "A1",
    title: "Level 2: Elementary Foundations & Daily Logistics",
    description: "Kuasai menceritakan kejadian masa lalu (Past Simple), preposisi waktu/tempat, modal can/could, serta menavigasi logistik harian.",
    orderIndex: 2
  },
  modules: [
    {
      id: "A1-M14",
      levelId: "A1.2",
      title: "Was & Were: State in the Past",
      cefr: "A1",
      group: "Past State",
      objective: "Menyatakan kondisi, perasaan, dan keberadaan di masa lalu menggunakan Was dan Were tanpa tertukar.",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 14,
      sections: [
        {
          sectionType: "theory",
          title: "Konsep Was vs Were",
          content: {
            summary: "Was digunakan untuk subjek tunggal (I, He, She, It). Were digunakan untuk subjek jamak (You, We, They).",
            rules: [
              { pronoun: "I / He / She / It", meaning: "Tunggal lampau", example: "I was at home yesterday. She was happy." },
              { pronoun: "You / We / They", meaning: "Jamak lampau", example: "We were in the meeting room. They were late." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'I was work' atau 'We was'",
              explanation: "Jangan pasangkan 'was' dengan subjek jamak 'We was', dan jangan gunakan 'was' langsung di depan kata kerja tindakan tanpa ing.",
              wrong: "We was tired. / I was sleep at 9.",
              correct: "We were tired. / I was at home at 9."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Keterangan Waktu Lampau & Kondisi",
          content: {
            items: [
              { word: "Yesterday", ipa: "/ˈjes.tə.deɪ/", meaning: "Kemarin", collocation: "Yesterday afternoon" },
              { word: "Last night", ipa: "/lɑːst naɪt/", meaning: "Tadi malam", collocation: "At home last night" },
              { word: "Last week", ipa: "/lɑːst wiːk/", meaning: "Minggu lalu", collocation: "Last week holiday" },
              { word: "Busy", ipa: "/ˈbɪz.i/", meaning: "Sibuk", collocation: "Very busy yesterday" },
              { word: "Tired", ipa: "/taɪəd/", meaning: "Lelah / Capek", collocation: "Tired after work" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Menanyakan Keberadaan Kemarin",
          content: {
            context: "Rina menanyakan keberadaan Budi yang tidak terlihat di kantor kemarin.",
            lines: [
              { speaker: "Rina", text: "Where were you yesterday, Budi? You were not in the office." },
              { speaker: "Budi", text: "I was sick yesterday. I was in bed all day." },
              { speaker: "Rina", text: "Oh, I am sorry to hear that. Were you at the clinic?" },
              { speaker: "Budi", text: "Yes, I was. But I am much better today." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "I was at home yesterday.", focus: "Pelafalan 'was' (/wɒz/) dan 'yesterday'", hint: "Lafalkan 'was' pendek dan jelas." },
              { id: "d2", targetText: "They were very busy last week.", focus: "Pelafalan 'were' (/wɜːr/) dan 'busy'", hint: "Jangan baca 'busi', baca 'biz-i'." }
            ],
            roleplay: {
              context: "Rina menanyakan kondisi Budi kemarin yang sakit.",
              roles: ["Budi", "Rina"],
              defaultUserRole: "Budi",
              turns: [
                { speaker: "Rina", text: "Where were you yesterday, Budi? You were not in the office." },
                { speaker: "Budi", text: "I was sick yesterday. I was in bed all day." },
                { speaker: "Rina", text: "Oh, I am sorry to hear that. Were you at the clinic?" },
                { speaker: "Budi", text: "Yes, I was. But I am much better today." }
              ]
            },
            challenge: {
              scenario: "Ceritakan di mana keberadaanmu tadi malam dan bagaimana kondisimu menggunakan 'I was'.",
              exampleAnswer: "Last night I was at home, and I was very tired.",
              targetGrammar: "Past State with Was (I was...)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M14: Was & Were",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah bentuk yang tepat: 'My colleagues ___ in Bali last weekend.'",
                options: ["was", "were", "is", "are"],
                answer: "were",
                explanation: "Colleagues adalah subjek jamak (They), jadi bentuk lampaunya adalah 'were'."
              },
              {
                id: "q2",
                question: "Manakah kalimat yang secara tata bahasa BENAR?",
                options: ["I was very busy yesterday.", "I were very busy yesterday.", "I was be busy yesterday.", "I am busy yesterday."],
                answer: "I was very busy yesterday.",
                explanation: "Subjek 'I' berpasangan dengan 'was' untuk waktu lampau 'yesterday'."
              },
              {
                id: "q3",
                question: "Lengkapi kalimat tanya: '___ you at the meeting yesterday morning?'",
                options: ["Was", "Were", "Did", "Are"],
                answer: "Were",
                explanation: "Untuk subjek 'you', kalimat tanya nominal lampau diawali 'Were'."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M15",
      levelId: "A1.2",
      title: "Past Simple Regular Verbs: -ed Sounds",
      cefr: "A1",
      group: "Past Action",
      objective: "Menguasai 3 jenis pelafalan akhiran -ed (/t/, /d/, /ɪd/) pada kata kerja lampau beraturan.",
      complexity: "deep",
      estimatedMinutes: 25,
      isExam: false,
      passingScore: 70,
      orderIndex: 15,
      sections: [
        {
          sectionType: "theory",
          title: "3 Kaidah Pelafalan Akhiran -ed",
          content: {
            summary: "Akhiran -ed tidak selalu dibaca 'ed'. Ada 3 bunyi: /t/ (walked), /d/ (lived), dan /ɪd/ (waited, needed).",
            rules: [
              { pronoun: "Bunyi /t/", meaning: "Setelah k, p, s, sh, ch", example: "Walked (wɔːkt), Watched (wɒtʃt), Worked (wɜːkt)" },
              { pronoun: "Bunyi /d/", meaning: "Setelah vokal & konsonan bersuara", example: "Lived (lɪvd), Played (pleɪd), Cleaned (kliːnd)" },
              { pronoun: "Bunyi /ɪd/", meaning: "HANYA setelah huruf t dan d", example: "Waited (weɪt.ɪd), Needed (niːd.ɪd), Started (stɑːt.ɪd)" }
            ],
            commonTrap: {
              trapTitle: "Jebakan: Membaca 'Walk-ed' atau 'Play-ed'",
              explanation: "Hanya kata yang berakhiran huruf T atau D yang dibaca dua suku kata /ɪd/. Jangan ucapkan 'walk-ed', cukup 'wakt'.",
              wrong: "I walk-ed to the office yesterday.",
              correct: "I walked (wakt) to the office yesterday."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Kata Kerja Beraturan Lampau",
          content: {
            items: [
              { word: "Worked", ipa: "/wɜːkt/", meaning: "Bekerja (lampau)", collocation: "Worked late yesterday" },
              { word: "Cleaned", ipa: "/kliːnd/", meaning: "Membersihkan (lampau)", collocation: "Cleaned the bedroom" },
              { word: "Waited", ipa: "/ˈweɪ.tɪd/", meaning: "Menunggu (lampau)", collocation: "Waited for twenty minutes" },
              { word: "Watched", ipa: "/wɒtʃt/", meaning: "Menonton (lampau)", collocation: "Watched a movie" },
              { word: "Cooked", ipa: "/kʊkt/", meaning: "Memasak (lampau)", collocation: "Cooked dinner last night" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Aktivitas Kemarin Malam",
          content: {
            context: "Deni dan Tina menceritakan apa yang mereka lakukan kemarin malam.",
            lines: [
              { speaker: "Deni", text: "What did you do last night, Tina?" },
              { speaker: "Tina", text: "I cooked fried rice and cleaned my apartment." },
              { speaker: "Deni", text: "Nice! I worked late and watched a football match." },
              { speaker: "Tina", text: "You must be tired. Did your team win?" }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "I cooked dinner and cleaned my room.", focus: "Bunyi /t/ pada 'cooked' dan /d/ pada 'cleaned'", hint: "Jangan baca 'kuk-ed', ucapkan 'kukt'." },
              { id: "d2", targetText: "We waited for thirty minutes.", focus: "Bunyi /ɪd/ pada 'waited'", hint: "Waited dibaca jelas 'weit-id' karena berakhiran t." }
            ],
            roleplay: {
              context: "Menceritakan aktivitas kemarin malam setelah jam kantor.",
              roles: ["Tina", "Deni"],
              defaultUserRole: "Tina",
              turns: [
                { speaker: "Deni", text: "What did you do last night, Tina?" },
                { speaker: "Tina", text: "I cooked fried rice and cleaned my apartment." },
                { speaker: "Deni", text: "Nice! I worked late and watched a football match." },
                { speaker: "Tina", text: "You must be tired. Did your team win?" }
              ]
            },
            challenge: {
              scenario: "Sebutkan 2 aktivitas yang kamu selesaikan kemarin malam menggunakan kata kerja beraturan lampau berakhiran -ed.",
              exampleAnswer: "Yesterday I worked at home, and I watched a great movie.",
              targetGrammar: "Past Simple Regular Verbs (-ed)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M15: -ed Pronunciation",
          content: {
            questions: [
              {
                id: "q1",
                question: "Manakah kata kerja yang akhiran -ed nya dilafalkan dengan bunyi /ɪd/?",
                options: ["Worked", "Played", "Started", "Watched"],
                answer: "Started",
                explanation: "Kata yang berakhiran huruf 't' (seperti start) mendapatkan bunyi /ɪd/ (stɑːt.ɪd)."
              },
              {
                id: "q2",
                question: "Bagaimana cara melafalkan kata 'Walked' dengan tepat?",
                options: ["/wɔː.kɪd/", "/wɔːkt/", "/wɔːkd/", "/wɔː.kət/"],
                answer: "/wɔːkt/",
                explanation: "Setelah konsonan k, akhiran -ed dilafalkan sebagai bunyi /t/ (walkt)."
              },
              {
                id: "q3",
                question: "Lengkapi kalimat: 'She ___ the office at 6 PM yesterday.' (leave/finish)",
                options: ["finished", "finish", "finishing", "finishes"],
                answer: "finished",
                explanation: "Untuk tindakan lampau 'yesterday', gunakan bentuk lampau 'finished'."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M16",
      levelId: "A1.2",
      title: "Past Simple Negatives & Did Questions",
      cefr: "A1",
      group: "Past Inversion",
      objective: "Menguasai pembentukan kalimat negatif (didn't + V1) dan kalimat tanya (Did you + V1?) tanpa kembali menggunakan V2.",
      complexity: "deep",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 16,
      sections: [
        {
          sectionType: "theory",
          title: "Aturan Emas: Didn't + V1 & Did + V1",
          content: {
            summary: "Ketika kata bantu 'did' atau 'didn't' muncul, kata kerja UTAMA WAJIB KEMBALI KE BENTUK PERTAMA (V1), bukan V2.",
            rules: [
              { pronoun: "Negatif", meaning: "did not / didn't + V1", example: "I didn't call you. (BUKAN: I didn't called)" },
              { pronoun: "Pertanyaan", meaning: "Did + Subject + V1?", example: "Did you watch the news? (BUKAN: Did you watched?)" }
            ],
            commonTrap: {
              trapTitle: "Jebakan Fatal: Menggunakan V2 setelah Did",
              explanation: "Banyak siswa berkata 'Did you went?' atau 'I didn't saw'. Karena 'did' sudah lampau, kata kerjanya harus kembali ke bentuk dasar V1.",
              wrong: "Did you went to the market? / I didn't saw him.",
              correct: "Did you go to the market? / I didn't see him."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Kata Kerja & Jawaban Pendek Lampau",
          content: {
            items: [
              { word: "Call", ipa: "/kɔːl/", meaning: "Menelepon", collocation: "Call my friend" },
              { word: "Visit", ipa: "/ˈvɪz.ɪt/", meaning: "Mengunjungi", collocation: "Visit my grandmother" },
              { word: "Attend", ipa: "/əˈtend/", meaning: "Menghadiri", collocation: "Attend the seminar" },
              { word: "Yes, I did", ipa: "/jes aɪ dɪd/", meaning: "Ya, saya lakukan (lampau)", collocation: "Yes, I did yesterday" },
              { word: "No, I didn't", ipa: "/noʊ aɪ ˈdɪd.ənt/", meaning: "Tidak, saya tidak lakukan", collocation: "No, I didn't see it" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Konfirmasi Kehadiran Rapat",
          content: {
            context: "Rizal menanyakan apakah Dewi menghadiri sesi rapat proyek kemarin.",
            lines: [
              { speaker: "Rizal", text: "Did you attend the morning meeting yesterday, Dewi?" },
              { speaker: "Dewi", text: "No, I didn't. I had a client call at that time." },
              { speaker: "Rizal", text: "Did they send you the summary notes?" },
              { speaker: "Dewi", text: "Yes, they did. I read the summary this morning." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "Did you attend the meeting yesterday?", focus: "Intonasi naik pada pertanyaan Did you + V1", hint: "Pastikan gunakan 'attend', bukan 'attended'." },
              { id: "d2", targetText: "I didn't call you because my battery died.", focus: "Pelafalan 'didn't call' tanpa jeda", hint: "Gunakan 'call' setelah didn't." }
            ],
            roleplay: {
              context: "Konfirmasi kehadiran rapat proyek dan catatan rangkuman.",
              roles: ["Dewi", "Rizal"],
              defaultUserRole: "Dewi",
              turns: [
                { speaker: "Rizal", text: "Did you attend the morning meeting yesterday, Dewi?" },
                { speaker: "Dewi", text: "No, I didn't. I had a client call at that time." },
                { speaker: "Rizal", text: "Did they send you the summary notes?" },
                { speaker: "Dewi", text: "Yes, they did. I read the summary this morning." }
              ]
            },
            challenge: {
              scenario: "Tanyakan kepada rekan bicaramu apakah dia menonton film baru kemarin, lalu jawab bahwa kamu tidak menontonnya menggunakan 'didn't'.",
              exampleAnswer: "Did you watch the new movie? I didn't watch it because I was busy.",
              targetGrammar: "Did you...? and I didn't + V1"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M16: Did & Didn't",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah kalimat yang secara tata bahasa BENAR:",
                options: ["Did you see the email?", "Did you saw the email?", "Did you seen the email?", "Did you seeing the email?"],
                answer: "Did you see the email?",
                explanation: "Setelah kata tanya 'Did', kata kerja wajib kembali ke bentuk V1 (see)."
              },
              {
                id: "q2",
                question: "Lengkapi kalimat negatif: 'I ___ coffee this morning.'",
                options: ["didn't drink", "didn't drank", "not drink", "wasn't drink"],
                answer: "didn't drink",
                explanation: "Pola negatif past simple adalah 'didn't + V1 (drink)'."
              },
              {
                id: "q3",
                question: "Bagaimana respon singkat positif untuk 'Did you finish the task?'",
                options: ["Yes, I did.", "Yes, I finished.", "Yes, I was.", "Yes, I do."],
                answer: "Yes, I did.",
                explanation: "Pertanyaan yang diawali 'Did' dijawab dengan 'Yes, I did' atau 'No, I didn't'."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M17",
      levelId: "A1.2",
      title: "Essential Irregular Past Verbs",
      cefr: "A1",
      group: "Past Action",
      objective: "Menguasai 10 kata kerja tidak beraturan paling vital (went, had, saw, ate, bought, came, took, made, drank, gave).",
      complexity: "deep",
      estimatedMinutes: 25,
      isExam: false,
      passingScore: 70,
      orderIndex: 17,
      sections: [
        {
          sectionType: "theory",
          title: "Perubahan Bentuk V1 ke V2",
          content: {
            summary: "Irregular verbs tidak berakhiran -ed melainkan berubah bentuk kata seutuhnya. Wajib dihafal melalui penggunaan alami.",
            rules: [
              { pronoun: "Pergerakan", meaning: "Go -> Went, Come -> Came", example: "I went to Surabaya last month." },
              { pronoun: "Konsumsi", meaning: "Eat -> Ate, Drink -> Drank", example: "We ate seafood and drank coconut water." },
              { pronoun: "Transaksi", meaning: "Buy -> Bought, Take -> Took", example: "She bought a new jacket." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: Menambahkan -ed pada Irregular Verbs",
              explanation: "Jangan katakan 'goed' atau 'buyed'. Bentuk lampau dari go adalah 'went', dan buy adalah 'bought'.",
              wrong: "I goed to mall and buyed shoes.",
              correct: "I went to the mall and bought shoes."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "10 Irregular Verbs Paling Sering Digunakan",
          content: {
            items: [
              { word: "Went", ipa: "/went/", meaning: "Pergi (lampau dari go)", collocation: "Went to the market" },
              { word: "Bought", ipa: "/bɔːt/", meaning: "Membeli (lampau dari buy)", collocation: "Bought groceries" },
              { word: "Ate", ipa: "/et/", meaning: "Makan (lampau dari eat)", collocation: "Ate dinner together" },
              { word: "Saw", ipa: "/sɔː/", meaning: "Melihat (lampau dari see)", collocation: "Saw my old teacher" },
              { word: "Took", ipa: "/tʊk/", meaning: "Mengambil/Naik kendaraan", collocation: "Took a taxi" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Menceritakan Liburan Akhir Pekan",
          content: {
            context: "Agus menceritakan perjalanan singkatnya ke Bandung kepada Sarah.",
            lines: [
              { speaker: "Sarah", text: "What did you do on Saturday, Agus?" },
              { speaker: "Agus", text: "I took a morning train and went to Bandung." },
              { speaker: "Sarah", text: "That sounds fun! What did you eat there?" },
              { speaker: "Agus", text: "I ate traditional noodles and bought some souvenirs." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "I took a train and went to Bandung.", focus: "Penggunaan 'took' dan 'went' dalam satu kalimat", hint: "Ucapkan 'went' tegas." },
              { id: "d2", targetText: "We ate lunch and bought fresh fruit.", focus: "Pelafalan 'ate' (/et/) dan 'bought' (/bɔːt/)", hint: "Bought berima dengan caught." }
            ],
            roleplay: {
              context: "Menceritakan perjalanan akhir pekan dan kuliner.",
              roles: ["Agus", "Sarah"],
              defaultUserRole: "Agus",
              turns: [
                { speaker: "Sarah", text: "What did you do on Saturday, Agus?" },
                { speaker: "Agus", text: "I took a morning train and went to Bandung." },
                { speaker: "Sarah", text: "That sounds fun! What did you eat there?" },
                { speaker: "Agus", text: "I ate traditional noodles and bought some souvenirs." }
              ]
            },
            challenge: {
              scenario: "Ceritakan tempat yang kamu kunjungi kemarin dan 1 barang atau makanan yang kamu beli menggunakan 'went' dan 'bought'.",
              exampleAnswer: "Yesterday I went to the supermarket and I bought fresh vegetables.",
              targetGrammar: "Irregular Past Verbs (went, bought)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M17: Irregular Verbs",
          content: {
            questions: [
              {
                id: "q1",
                question: "Bentuk lampau (V2) dari kata kerja 'buy' adalah:",
                options: ["bought", "buyed", "buys", "boughted"],
                answer: "bought",
                explanation: "Kata kerja buy adalah irregular verb dengan bentuk lampau 'bought'."
              },
              {
                id: "q2",
                question: "Lengkapi kalimat: 'Yesterday, my family and I ___ dinner at an Italian restaurant.'",
                options: ["ate", "eated", "eats", "eating"],
                answer: "ate",
                explanation: "Bentuk lampau dari 'eat' adalah 'ate'."
              },
              {
                id: "q3",
                question: "Manakah kalimat yang BENAR?",
                options: ["She took a taxi to the airport.", "She taked a taxi to the airport.", "She takes a taxi yesterday.", "She taken a taxi yesterday."],
                answer: "She took a taxi to the airport.",
                explanation: "Bentuk V2 dari 'take' adalah 'took'."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M18",
      levelId: "A1.2",
      title: "Prepositions of Place: In, On, At & Spatial Layout",
      cefr: "A1",
      group: "Spatial & Location",
      objective: "Menjelaskan lokasi benda dan posisi ruang secara tepat menggunakan in, on, at, next to, behind, dan between.",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 18,
      sections: [
        {
          sectionType: "theory",
          title: "Kaidah Preposisi Posisi",
          content: {
            summary: "In untuk di dalam ruang tertutup. On untuk di atas permukaan. At untuk titik spesifik.",
            rules: [
              { pronoun: "In", meaning: "Di dalam wadah/ruang", example: "In the drawer, in the kitchen, in Jakarta." },
              { pronoun: "On", meaning: "Di atas permukaan menempel", example: "On the desk, on the wall, on the 2nd floor." },
              { pronoun: "At", meaning: "Titik lokasi spesifik", example: "At the bus stop, at the entrance, at work." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'In the table' atau 'At the desk'",
              explanation: "Benda di atas meja menggunakan 'on the table' (karena di atas permukaan), bukan 'in the table'.",
              wrong: "Your key is in the table.",
              correct: "Your key is on the table."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Preposisi Posisi Ruang",
          content: {
            items: [
              { word: "Next to", ipa: "/nekst tuː/", meaning: "Di samping / Sebelah", collocation: "Next to the printer" },
              { word: "Between", ipa: "/bɪˈtwiːn/", meaning: "Di antara dua benda", collocation: "Between the desk and chair" },
              { word: "Behind", ipa: "/bɪˈhaɪnd/", meaning: "Di belakang", collocation: "Behind the door" },
              { word: "In front of", ipa: "/ɪn frʌnt ɒv/", meaning: "Di depan", collocation: "In front of the building" },
              { word: "On the desk", ipa: "/ɒn ðə desk/", meaning: "Di atas meja kerja", collocation: "Put it on the desk" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Mencari Dokumen di Kantor",
          content: {
            context: "Fani mencari berkas laporan proyek di ruang kerja bersama Surya.",
            lines: [
              { speaker: "Fani", text: "Excuse me, Surya. Have you seen the project report folder?" },
              { speaker: "Surya", text: "Yes, it is on the desk, next to the printer." },
              { speaker: "Fani", text: "Wait, I only see the blue binder here." },
              { speaker: "Surya", text: "Look inside the drawer between my desk and yours." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "The report is on the desk, next to the printer.", focus: "Preposisi 'on the desk' dan 'next to'", hint: "Sambung 'next to' lancar." },
              { id: "d2", targetText: "The keys are inside the drawer.", focus: "Pelafalan 'inside' dan 'drawer' (/drɔː.ər/)", hint: "Drawer diucapkan 'dro-er'." }
            ],
            roleplay: {
              context: "Mencari berkas kerja di ruang kantor.",
              roles: ["Surya", "Fani"],
              defaultUserRole: "Surya",
              turns: [
                { speaker: "Fani", text: "Excuse me, Surya. Have you seen the project report folder?" },
                { speaker: "Surya", text: "Yes, it is on the desk, next to the printer." },
                { speaker: "Fani", text: "Wait, I only see the blue binder here." },
                { speaker: "Surya", text: "Look inside the drawer between my desk and yours." }
              ]
            },
            challenge: {
              scenario: "Jelaskan di mana letak ponselmu dan komputermu sekarang menggunakan preposisi 'on' dan 'next to'.",
              exampleAnswer: "My phone is on the table, and it is next to my laptop.",
              targetGrammar: "Prepositions of Place (on, next to)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M18: Prepositions of Place",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah preposisi yang tepat: 'The laptop is ___ the meeting table.'",
                options: ["on", "in", "at", "to"],
                answer: "on",
                explanation: "Untuk posisi di atas permukaan meja, gunakan 'on'."
              },
              {
                id: "q2",
                question: "'The coffee shop is located ___ the bank and the bookstore.'",
                options: ["between", "behind", "in", "at"],
                answer: "between",
                explanation: "Di antara dua lokasi (bank and bookstore) menggunakan 'between'."
              },
              {
                id: "q3",
                question: "Di mana posisi benda jika dikatakan 'next to the window'?",
                options: ["Tepat di sebelah/samping jendela", "Di dalam jendela", "Di belakang jendela", "Di bawah jendela"],
                answer: "Tepat di sebelah/samping jendela",
                explanation: "'Next to' berarti tepat di samping atau di sebelah."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M19",
      levelId: "A1.2",
      title: "Asking & Giving Directions",
      cefr: "A1",
      group: "Navigation & City",
      objective: "Menanyakan arah jalan dan memberikan petunjuk arah sederhana (turn left, go straight, opposite).",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 19,
      sections: [
        {
          sectionType: "theory",
          title: "Pola Kalimat Petunjuk Arah",
          content: {
            summary: "Gunakan kalimat perintah santun (Imperative) untuk petunjuk arah: Go straight, Turn left, Cross the street.",
            rules: [
              { pronoun: "Menanyakan", meaning: "How do I get to...?", example: "Excuse me, how do I get to the train station?" },
              { pronoun: "Lurus", meaning: "Go straight / Walk straight", example: "Go straight for two blocks." },
              { pronoun: "Belok", meaning: "Turn left / Turn right", example: "Turn left at the traffic light." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'Turn to the left' vs 'Turn left'",
              explanation: "Dalam bahasa Inggris baku yang paling umum dan alami, cukup katakan 'Turn left' atau 'Turn right' tanpa 'to the'.",
              wrong: "You must turn to the left.",
              correct: "Turn left at the corner."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Frasa Navigasi & Arah Jalan",
          content: {
            items: [
              { word: "Go straight", ipa: "/ɡoʊ streɪt/", meaning: "Jalan lurus", collocation: "Go straight ahead" },
              { word: "Turn right", ipa: "/tɜːn raɪt/", meaning: "Belok kanan", collocation: "Turn right at the junction" },
              { word: "Opposite", ipa: "/ˈɒp.ə.zɪt/", meaning: "Berseberangan / Di seberang", collocation: "Opposite the supermarket" },
              { word: "Corner", ipa: "/ˈkɔː.nər/", meaning: "Pojok / Sudut jalan", collocation: "On the corner of the street" },
              { word: "Cross the street", ipa: "/krɒs ðə striːt/", meaning: "Menyeberang jalan", collocation: "Cross the street carefully" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Menanyakan Letak Apotek",
          content: {
            context: "Turis menanyakan letak apotek terdekat kepada pejalan kaki lokal.",
            lines: [
              { speaker: "Turis", text: "Excuse me, is there a pharmacy near here?" },
              { speaker: "Lokal", text: "Yes, there is. Go straight ahead, then turn right at the traffic light." },
              { speaker: "Turis", text: "Is it far from that traffic light?" },
              { speaker: "Lokal", text: "No, it is just on the left, opposite the bank." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "Go straight ahead, then turn right at the traffic light.", focus: "Kelancaran frasa 'straight ahead' dan 'turn right'", hint: "Straight dibaca /streɪt/." },
              { id: "d2", targetText: "The pharmacy is opposite the bank.", focus: "Pelafalan 'opposite' (/ˈɒp.ə.zɪt/)", hint: "Opposite berarti persis di seberang jalan." }
            ],
            roleplay: {
              context: "Memberikan petunjuk jalan ke apotek terdekat.",
              roles: ["Lokal", "Turis"],
              defaultUserRole: "Lokal",
              turns: [
                { speaker: "Turis", text: "Excuse me, is there a pharmacy near here?" },
                { speaker: "Lokal", text: "Yes, there is. Go straight ahead, then turn right at the traffic light." },
                { speaker: "Turis", text: "Is it far from that traffic light?" },
                { speaker: "Lokal", text: "No, it is just on the left, opposite the bank." }
              ]
            },
            challenge: {
              scenario: "Berikan petunjuk arah kepada seorang tamu yang ingin menuju toilet dari lobi: katakan lurus lalu belok kanan di samping lift.",
              exampleAnswer: "Go straight down this hallway, then turn right next to the elevator.",
              targetGrammar: "Giving directions (Go straight, turn right)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M19: Directions",
          content: {
            questions: [
              {
                id: "q1",
                question: "Apa arti frasa 'Go straight ahead'?",
                options: ["Jalan lurus ke depan", "Belok ke kiri segera", "Berhenti di perempatan", "Putar balik"],
                answer: "Jalan lurus ke depan",
                explanation: "'Go straight ahead' berarti berjalan terus lurus ke depan."
              },
              {
                id: "q2",
                question: "Pilihlah kalimat yang paling sopan untuk menanyakan letak stasiun kereta:",
                options: ["Excuse me, how do I get to the train station?", "Where train station now?", "You tell train station please.", "Hey station where?"],
                answer: "Excuse me, how do I get to the train station?",
                explanation: "Diawali 'Excuse me' dan pola 'how do I get to...' adalah cara bertanya arah paling natural."
              },
              {
                id: "q3",
                question: "Jika sebuah gedung berada 'opposite the post office', posisinya adalah:",
                options: ["Berseberangan tepat dengan kantor pos", "Di dalam kantor pos", "Di belakang kantor pos", "Jauh dari kantor pos"],
                answer: "Berseberangan tepat dengan kantor pos",
                explanation: "'Opposite' artinya berhadap-hadapan/berseberangan."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M20",
      levelId: "A1.2",
      title: "Prepositions of Time: At, On, In",
      cefr: "A1",
      group: "Time Logistics",
      objective: "Menguasai kaidah piramida waktu: At (jam spesifik), On (hari & tanggal), In (bulan, tahun, periode).",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 20,
      sections: [
        {
          sectionType: "theory",
          title: "Segitiga Preposisi Waktu",
          content: {
            summary: "At untuk jam tepat (at 7 AM). On untuk hari & tanggal (on Monday, on May 2nd). In untuk periode panjang (in 2026, in July, in the morning).",
            rules: [
              { pronoun: "At", meaning: "Jam & waktu presisi", example: "At 9:00 AM, at noon, at midnight, at the weekend." },
              { pronoun: "On", meaning: "Hari & tanggal", example: "On Tuesday, on my birthday, on 17 August." },
              { pronoun: "In", meaning: "Bulan, musim, tahun, bagian hari", example: "In December, in the morning, in 2026." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'In Monday' atau 'At July'",
              explanation: "Nama hari selalu menggunakan 'ON', bukan 'IN'. Nama bulan sendiri tanpa tanggal menggunakan 'IN'.",
              wrong: "We meet in Monday at July.",
              correct: "We meet on Monday in July."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Kosakata Jadwal & Waktu",
          content: {
            items: [
              { word: "At noon", ipa: "/æt nuːn/", meaning: "Tepat tengah hari (12:00)", collocation: "Lunch at noon" },
              { word: "In the evening", ipa: "/ɪn ðiː ˈiːv.nɪŋ/", meaning: "Di malam/petang hari", collocation: "Study in the evening" },
              { word: "On weekdays", ipa: "/ɒn ˈwiːk.deɪz/", meaning: "Pada hari kerja (Senin-Jumat)", collocation: "Work on weekdays" },
              { word: "Midnight", ipa: "/ˈmɪd.naɪt/", meaning: "Tengah malam (00:00)", collocation: "Sleep before midnight" },
              { word: "Appointment", ipa: "/əˈpɔɪnt.mənt/", meaning: "Janji temu resmi", collocation: "Doctor appointment" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Menentukan Jadwal Janji Temu",
          content: {
            context: "Nita dan dokter gigi mengatur jadwal pemeriksaan rutin.",
            lines: [
              { speaker: "Nita", text: "Good afternoon. Can I make an appointment with Dr. Hendra?" },
              { speaker: "Resepsionis", text: "Certainly. He is available on Thursday at two in the afternoon." },
              { speaker: "Nita", text: "I have a meeting at two. Is he free on Friday morning?" },
              { speaker: "Resepsionis", text: "Yes, on Friday at ten in the morning is open." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "The meeting is on Friday at ten in the morning.", focus: "Kombinasi 'on Friday', 'at ten', dan 'in the morning'", hint: "Perhatikan transisi on -> at -> in." },
              { id: "d2", targetText: "I usually exercise in the afternoon.", focus: "Frasa waktu 'in the afternoon'", hint: "The dibaca /ðiː/ sebelum huruf vokal 'afternoon'." }
            ],
            roleplay: {
              context: "Menentukan jadwal janji temu pemeriksaan gigi.",
              roles: ["Nita", "Resepsionis"],
              defaultUserRole: "Nita",
              turns: [
                { speaker: "Nita", text: "Good afternoon. Can I make an appointment with Dr. Hendra?" },
                { speaker: "Resepsionis", text: "Certainly. He is available on Thursday at two in the afternoon." },
                { speaker: "Nita", text: "I have a meeting at two. Is he free on Friday morning?" },
                { speaker: "Resepsionis", text: "Yes, on Friday at ten in the morning is open." }
              ]
            },
            challenge: {
              scenario: "Sebutkan hari dan jam kamu biasa bangun pagi dan kapan kamu belajar bahasa Inggris menggunakan 'at' dan 'on'.",
              exampleAnswer: "On weekdays I wake up at six, and I practice English at night.",
              targetGrammar: "Prepositions of Time (at, on)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M20: Time Prepositions",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah preposisi yang tepat: 'Our flight departs ___ 6:30 AM.'",
                options: ["at", "on", "in", "by"],
                answer: "at",
                explanation: "Untuk jam yang spesifik, wajib gunakan 'at'."
              },
              {
                id: "q2",
                question: "'My sister was born ___ October 15th.'",
                options: ["on", "in", "at", "to"],
                answer: "on",
                explanation: "Jika ada tanggal spesifik (October 15th), gunakan 'on'. Jika hanya bulan saja (October) baru gunakan 'in'."
              },
              {
                id: "q3",
                question: "Manakah kalimat yang secara tata bahasa BENAR?",
                options: ["We have lunch at noon.", "We have lunch on noon.", "We have lunch in noon.", "We have lunch to noon."],
                answer: "We have lunch at noon.",
                explanation: "Frasa waktu tengah hari adalah 'at noon'."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M21",
      levelId: "A1.2",
      title: "Modal Can & Can't for Ability",
      cefr: "A1",
      group: "Ability & Skills",
      objective: "Menyatakan kemampuan dan ketidakmampuan diri/orang lain menggunakan Can dan Can't secara lugas.",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 21,
      sections: [
        {
          sectionType: "theory",
          title: "Kaidah Modal Can & Can't",
          content: {
            summary: "Can digunakan untuk semua subjek tanpa perubahan bentuk (tidak ada 'cans'). Diikuti langsung oleh kata kerja dasar V1.",
            rules: [
              { pronoun: "Positif", meaning: "Can + V1", example: "I can drive a car. She can speak English." },
              { pronoun: "Negatif", meaning: "Cannot / Can't + V1", example: "He can't swim. They can't come today." },
              { pronoun: "Pertanyaan", meaning: "Can you + V1?", example: "Can you cook? Yes, I can / No, I can't." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'She cans' atau 'Can to go'",
              explanation: "Modal verb 'can' TIDAK PERNAH ditambah akhiran -s, dan TIDAK PERNAH diikuti 'to'.",
              wrong: "She cans speak English. / I can to swim.",
              correct: "She can speak English. / I can swim."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Keahlian & Kemampuan Umum",
          content: {
            items: [
              { word: "Drive", ipa: "/draɪv/", meaning: "Menyetir mobil", collocation: "Drive a car" },
              { word: "Swim", ipa: "/swɪm/", meaning: "Berenang", collocation: "Swim in the pool" },
              { word: "Cook", ipa: "/kʊk/", meaning: "Memasak", collocation: "Cook Indonesian food" },
              { word: "Play guitar", ipa: "/pleɪ ɡɪˈtɑːr/", meaning: "Bermain gitar", collocation: "Play guitar well" },
              { word: "Type fast", ipa: "/taɪp fɑːst/", meaning: "Mengetik cepat", collocation: "Type fast on keyboard" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Wawancara Keahlian Praktis",
          content: {
            context: "Manajer menanyakan kemampuan praktis calon staf baru.",
            lines: [
              { speaker: "Manajer", text: "Can you drive a manual car, Bayu?" },
              { speaker: "Bayu", text: "Yes, I can drive both manual and automatic cars." },
              { speaker: "Manajer", text: "Great. Can you also use spreadsheet software?" },
              { speaker: "Bayu", text: "Yes, I can. But I can't write complex code." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "I can drive a car, but I can't swim.", focus: "Kontras pelafalan 'can' (/kæn/) vs 'can't' (/kɑːnt/ atau /kænt/)", hint: "Beri penekanan tegas pada kata 'can't'." },
              { id: "d2", targetText: "Can you speak English fluently?", focus: "Intonasi naik pada pertanyaan Can you...?", hint: "Gunakan bentuk dasar 'speak' tanpa 'to'." }
            ],
            roleplay: {
              context: "Membicarakan kemampuan diri saat wawancara kerja.",
              roles: ["Bayu", "Manajer"],
              defaultUserRole: "Bayu",
              turns: [
                { speaker: "Manajer", text: "Can you drive a manual car, Bayu?" },
                { speaker: "Bayu", text: "Yes, I can drive both manual and automatic cars." },
                { speaker: "Manajer", text: "Great. Can you also use spreadsheet software?" },
                { speaker: "Bayu", text: "Yes, I can. But I can't write complex code." }
              ]
            },
            challenge: {
              scenario: "Sebutkan 1 hal yang kamu BISA lakukan dengan baik dan 1 hal yang kamu TIDAK BISA lakukan menggunakan 'I can' dan 'I can't'.",
              exampleAnswer: "I can cook fried rice, but I cannot play guitar.",
              targetGrammar: "Can & Can't for ability"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M21: Can & Can't",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah kalimat yang secara tata bahasa BENAR:",
                options: ["She can speak three languages.", "She cans speak three languages.", "She can to speak three languages.", "She can speaking three languages."],
                answer: "She can speak three languages.",
                explanation: "Modal 'can' tidak diberi akhiran -s dan langsung diikuti kata kerja bentuk dasar."
              },
              {
                id: "q2",
                question: "Lengkapi kalimat: 'Sorry, I ___ hear your voice clearly because of the noise.'",
                options: ["can't", "am not can", "not can", "don't can"],
                answer: "can't",
                explanation: "Bentuk negatif dari can adalah 'can't' atau 'cannot'."
              },
              {
                id: "q3",
                question: "Respon singkat negatif untuk 'Can you swim?' adalah:",
                options: ["No, I can't.", "No, I don't.", "No, I am not.", "No, I not."],
                answer: "No, I can't.",
                explanation: "Pertanyaan yang diawali 'Can' dijawab dengan 'No, I can't'."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M22",
      levelId: "A1.2",
      title: "Polite Requests: Could you & May I",
      cefr: "A1",
      group: "Polite Requests",
      objective: "Menggunakan Could you dan May I untuk meminta tolong dan meminta izin secara sopan di situasi formal.",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 22,
      sections: [
        {
          sectionType: "theory",
          title: "Kaidah Kesopanan: Could you & May I",
          content: {
            summary: "Gunakan 'Could you please...?' untuk meminta orang lain melakukan sesuatu. Gunakan 'May I...?' untuk meminta izin bagi diri sendiri.",
            rules: [
              { pronoun: "Meminta tolong", meaning: "Could you please + V1?", example: "Could you please open the door? (Lebih sopan dari Can you)" },
              { pronoun: "Minta izin", meaning: "May I + V1?", example: "May I come in? May I borrow your pen?" },
              { pronoun: "Respon sopan", meaning: "Tentu saja", example: "Sure, of course / Certainly / Here you go." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'Give me that!' vs 'Could you please...'",
              explanation: "Di lingkungan profesional, jangan gunakan kalimat perintah langsung karena terkesan memerintah kasar. Selalu awali dengan 'Could you please'.",
              wrong: "Send me the file now!",
              correct: "Could you please send me the file?"
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Frasa Kesopanan Sehari-hari",
          content: {
            items: [
              { word: "Could you please", ipa: "/kʊd juː pliːz/", meaning: "Bisakah Anda tolong...", collocation: "Could you please help me" },
              { word: "May I", ipa: "/meɪ aɪ/", meaning: "Bolehkah saya...", collocation: "May I sit here" },
              { word: "Certainly", ipa: "/ˈsɜː.tən.li/", meaning: "Tentu saja dengan senang hati", collocation: "Certainly, sir" },
              { word: "Here you go", ipa: "/hɪər juː ɡoʊ/", meaning: "Ini barangnya (saat menyerahkan)", collocation: "Here you go, enjoy" },
              { word: "No problem", ipa: "/noʊ ˈprɒb.ləm/", meaning: "Sama-sama / Tidak masalah", collocation: "No problem at all" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Meminjam Pengisi Daya di Kantor",
          content: {
            context: "Raka kehabisan baterai ponsel dan meminta izin meminjam charger milik Siska.",
            lines: [
              { speaker: "Raka", text: "Excuse me, Siska. Could you please help me?" },
              { speaker: "Siska", text: "Sure, Raka. What do you need?" },
              { speaker: "Raka", text: "May I borrow your phone charger for thirty minutes?" },
              { speaker: "Siska", text: "Certainly! Here you go, it is on my desk." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "Could you please repeat that again?", focus: "Pelafalan 'could' (/kʊd/) tanpa bunyi huruf L", hint: "Jangan baca 'kuld', baca 'kud'." },
              { id: "d2", targetText: "May I have a glass of water, please?", focus: "Kesantunan meminta izin dengan intonasi ramah", hint: "Turunkan intonasi santun di akhir kalimat." }
            ],
            roleplay: {
              context: "Meminta bantuan dan meminjam charger di kantor.",
              roles: ["Raka", "Siska"],
              defaultUserRole: "Raka",
              turns: [
                { speaker: "Raka", text: "Excuse me, Siska. Could you please help me?" },
                { speaker: "Siska", text: "Sure, Raka. What do you need?" },
                { speaker: "Raka", text: "May I borrow your phone charger for thirty minutes?" },
                { speaker: "Siska", text: "Certainly! Here you go, it is on my desk." }
              ]
            },
            challenge: {
              scenario: "Mintalah rekan kerjamu untuk menutup jendela karena di luar dingin, dan minta izin untuk menyalakan lampu menggunakan 'Could you' dan 'May I'.",
              exampleAnswer: "Could you please close the window? May I turn on the light?",
              targetGrammar: "Polite Requests (Could you, May I)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M22: Polite Requests",
          content: {
            questions: [
              {
                id: "q1",
                question: "Manakah ungkapan yang paling santun untuk meminta seseorang mengulang perkataannya?",
                options: ["Could you please repeat that?", "Repeat again now!", "What you say?", "Tell me again!"],
                answer: "Could you please repeat that?",
                explanation: "'Could you please repeat that?' adalah bentuk permintaan resmi dan sopan."
              },
              {
                id: "q2",
                question: "Pilihlah bentuk yang tepat untuk meminta izin duduk di kursi kosong:",
                options: ["May I sit here?", "May I to sit here?", "Can I sat here?", "Will I sitting here?"],
                answer: "May I sit here?",
                explanation: "Pola meminta izin sopan adalah 'May I + V1 (sit)'."
              },
              {
                id: "q3",
                question: "Apa respon yang lazim diucapkan ketika memberikan barang yang dipinjam?",
                options: ["Here you go.", "Take it away.", "You get it.", "Give to you."],
                answer: "Here you go.",
                explanation: "'Here you go' adalah frasa umum saat menyerahkan sesuatu kepada orang lain."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M23",
      levelId: "A1.2",
      title: "Likes, Dislikes & Preferences",
      cefr: "A1",
      group: "Preferences",
      objective: "Menyatakan hal yang disukai (like, love) dan tidak disukai (dislike, hate) diikuti kata benda atau Verb-ing.",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 23,
      sections: [
        {
          sectionType: "theory",
          title: "Aturan Like + Verb-ing",
          content: {
            summary: "Setelah kata kerja perasaan (like, love, enjoy, hate), kata kerja berikutnya wajib berakhiran -ING (Gerund).",
            rules: [
              { pronoun: "Menyukai", meaning: "Like / Love + V-ing", example: "I like reading books. She loves cooking." },
              { pronoun: "Tidak suka", meaning: "Don't like / Hate + V-ing", example: "I don't like waiting. He hates waking up early." },
              { pronoun: "Preferensi", meaning: "Prefer A to B", example: "I prefer tea to coffee." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'I like read' atau 'I prefer coffee than tea'",
              explanation: "Gunakan 'reading' setelah 'like'. Dan untuk kata 'prefer', pasangannya adalah 'TO', bukan 'THAN'.",
              wrong: "I like watch movies. / I prefer tea than coffee.",
              correct: "I like watching movies. / I prefer tea to coffee."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Hobi & Ungkapan Minat",
          content: {
            items: [
              { word: "Traveling", ipa: "/ˈtræv.əl.ɪŋ/", meaning: "Bepergian / Jalan-jalan", collocation: "Love traveling abroad" },
              { word: "Listening to music", ipa: "/ˈlɪs.ən.ɪŋ tuː ˈmjuː.zɪk/", meaning: "Mendengarkan musik", collocation: "Enjoy listening to jazz" },
              { word: "Exercising", ipa: "/ˈek.sə.saɪ.zɪŋ/", meaning: "Berolahraga", collocation: "Like exercising in the park" },
              { word: "Prefer", ipa: "/prɪˈfɜːr/", meaning: "Lebih memilih", collocation: "Prefer tea to coffee" },
              { word: "Hate", ipa: "/heɪt/", meaning: "Sangat tidak suka", collocation: "Hate traffic jams" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Membahas Minat & Minuman Favorit",
          content: {
            context: "Dua rekan kantor mengobrol santai di pantry saat jam istirahat.",
            lines: [
              { speaker: "Niko", text: "Do you like drinking coffee in the morning, Maya?" },
              { speaker: "Maya", text: "Actually, I prefer hot tea to coffee. Coffee makes me nervous." },
              { speaker: "Niko", text: "I see. What do you enjoy doing on weekends?" },
              { speaker: "Maya", text: "I enjoy reading novels and exercising outdoors." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "I prefer drinking tea to coffee.", focus: "Frasa preferensi 'prefer ... to ...'", hint: "Gunakan 'to' sebagai pembanding preferensi." },
              { id: "d2", targetText: "She loves traveling to new cities.", focus: "Pola 'loves traveling' dengan akhiran -ing", hint: "Lafalkan 'traveling' dengan dua suku kata halus." }
            ],
            roleplay: {
              context: "Membicarakan minuman kesukaan dan hobi akhir pekan.",
              roles: ["Maya", "Niko"],
              defaultUserRole: "Maya",
              turns: [
                { speaker: "Niko", text: "Do you like drinking coffee in the morning, Maya?" },
                { speaker: "Maya", text: "Actually, I prefer hot tea to coffee. Coffee makes me nervous." },
                { speaker: "Niko", text: "I see. What do you enjoy doing on weekends?" },
                { speaker: "Maya", text: "I enjoy reading novels and exercising outdoors." }
              ]
            },
            challenge: {
              scenario: "Ceritakan 1 aktivitas yang sangat kamu sukai di waktu luang dan sebutkan apakah kamu lebih memilih kopi atau teh menggunakan 'prefer'.",
              exampleAnswer: "I like listening to music in my free time, and I prefer coffee to tea.",
              targetGrammar: "Likes with V-ing and Prefer A to B"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M23: Preferences",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah bentuk kata kerja yang tepat: 'My brother enjoys ___ video games on Sunday.'",
                options: ["playing", "play", "played", "plays"],
                answer: "playing",
                explanation: "Setelah kata kerja 'enjoy', kata kerja berikutnya menggunakan bentuk gerund (-ing)."
              },
              {
                id: "q2",
                question: "Lengkapi kalimat preferensi: 'I prefer working from home ___ working in the office.'",
                options: ["to", "than", "more", "from"],
                answer: "to",
                explanation: "Pola preferensi adalah 'prefer X to Y'."
              },
              {
                id: "q3",
                question: "Manakah kalimat yang secara tata bahasa BENAR?",
                options: ["She likes cooking dinner.", "She like cook dinner.", "She likes to cooking dinner.", "She liking cook dinner."],
                answer: "She likes cooking dinner.",
                explanation: "Subjek 'She' membutuhkan kata kerja 'likes' diikuti bentuk '-ing'."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M24",
      levelId: "A1.2",
      title: "Making Plans: Want to & Plan to",
      cefr: "A1",
      group: "Future Intentions",
      objective: "Mengekspresikan rencana masa depan sederhana menggunakan want to, plan to, dan hope to.",
      complexity: "medium",
      estimatedMinutes: 20,
      isExam: false,
      passingScore: 70,
      orderIndex: 24,
      sections: [
        {
          sectionType: "theory",
          title: "Kaidah Want to & Plan to",
          content: {
            summary: "Want to, plan to, dan hope to diikuti kata kerja bentuk dasar V1 (Infinitive) untuk menyatakan rencana masa depan.",
            rules: [
              { pronoun: "Keinginan", meaning: "Want to + V1", example: "I want to buy a new laptop next month." },
              { pronoun: "Rencana", meaning: "Plan to + V1", example: "We plan to visit Bali next holiday." },
              { pronoun: "Harapan", meaning: "Hope to + V1", example: "I hope to speak English fluently." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: 'I want buy' atau 'I plan to going'",
              explanation: "Jangan lupakan kata 'to' setelah want/plan, dan jangan gunakan -ing setelah 'to' dalam konteks ini.",
              wrong: "I want buy a ticket. / We plan to visiting.",
              correct: "I want to buy a ticket. / We plan to visit."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Kosakata Rencana & Masa Depan",
          content: {
            items: [
              { word: "Next year", ipa: "/nekst jɪər/", meaning: "Tahun depan", collocation: "Travel next year" },
              { word: "Plan to", ipa: "/plæn tuː/", meaning: "Berencana untuk", collocation: "Plan to move to a new house" },
              { word: "Hope to", ipa: "/hoʊp tuː/", meaning: "Berharap untuk", collocation: "Hope to pass the test" },
              { word: "Improve", ipa: "/ɪmˈpruːv/", meaning: "Meningkatkan", collocation: "Improve my skills" },
              { word: "Soon", ipa: "/suːn/", meaning: "Segera", collocation: "See you soon" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Rencana Liburan Akhir Tahun",
          content: {
            context: "Rico dan Shinta membicarakan rencana liburan akhir tahun mereka.",
            lines: [
              { speaker: "Rico", text: "Do you have any plans for the end of the year, Shinta?" },
              { speaker: "Shinta", text: "Yes! I plan to visit my parents in Yogyakarta." },
              { speaker: "Rico", text: "That sounds warm. I want to take an online English course." },
              { speaker: "Shinta", text: "That is productive! I hope you achieve your goals." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "I want to speak English with confidence.", focus: "Kelancaran frasa 'want to' dan 'with confidence'", hint: "Dalam percakapan cepat, 'want to' sering terdengar 'wanna'." },
              { id: "d2", targetText: "We plan to travel to Japan next year.", focus: "Frasa rencana 'plan to travel' dan waktu 'next year'", hint: "Tegaskan kata kerja 'travel'." }
            ],
            roleplay: {
              context: "Membahas rencana liburan dan target akhir tahun.",
              roles: ["Shinta", "Rico"],
              defaultUserRole: "Shinta",
              turns: [
                { speaker: "Rico", text: "Do you have any plans for the end of the year, Shinta?" },
                { speaker: "Shinta", text: "Yes! I plan to visit my parents in Yogyakarta." },
                { speaker: "Rico", text: "That sounds warm. I want to take an online English course." },
                { speaker: "Shinta", text: "That is productive! I hope you achieve your goals." }
              ]
            },
            challenge: {
              scenario: "Ceritakan 1 rencana yang ingin kamu capai bulan depan dan 1 tempat yang kamu rencanakan untuk dikunjungi menggunakan 'want to' dan 'plan to'.",
              exampleAnswer: "I want to improve my English, and I plan to visit my hometown next month.",
              targetGrammar: "Intentions with Want to & Plan to"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M24: Future Plans",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah kalimat yang secara tata bahasa BENAR:",
                options: ["I want to learn Spanish next year.", "I want learn Spanish next year.", "I want to learning Spanish next year.", "I wanting to learn Spanish."],
                answer: "I want to learn Spanish next year.",
                explanation: "Pola yang tepat adalah 'want to + V1 (learn)'."
              },
              {
                id: "q2",
                question: "Lengkapi kalimat: 'They ___ to open a new branch in Surabaya soon.'",
                options: ["plan", "plans", "planning", "planned to"],
                answer: "plan",
                explanation: "Subjek jamak 'They' berpasangan dengan bentuk kata kerja dasar 'plan'."
              },
              {
                id: "q3",
                question: "Apa arti dari 'I hope to see you soon'?",
                options: ["Saya berharap bisa segera bertemu denganmu", "Saya sudah bertemu denganmu", "Saya tidak mau bertemu denganmu", "Saya harus bertemu denganmu"],
                answer: "Saya berharap bisa segera bertemu denganmu",
                explanation: "'Hope to see you soon' menyatakan harapan untuk lekas bertemu kembali."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M25",
      levelId: "A1.2",
      title: "Telling Yesterday's Story: Full Narrative",
      cefr: "A1",
      group: "Storytelling",
      objective: "Merangkai narasi percakapan utuh tentang kronologi aktivitas kemarin dari pagi hingga malam.",
      complexity: "deep",
      estimatedMinutes: 25,
      isExam: false,
      passingScore: 70,
      orderIndex: 25,
      sections: [
        {
          sectionType: "theory",
          title: "Konektor Kronologi Cerita",
          content: {
            summary: "Gunakan kata penghubung urutan waktu untuk merangkai cerita masa lalu: First, Then, After that, Finally.",
            rules: [
              { pronoun: "Awal", meaning: "First / In the morning", example: "First, I woke up at six and drank water." },
              { pronoun: "Lanjutan", meaning: "Then / After that", example: "Then, I went to the office and met my team." },
              { pronoun: "Akhir", meaning: "Finally / In the end", example: "Finally, I arrived home at eight in the evening." }
            ],
            commonTrap: {
              trapTitle: "Jebakan: Melompat dari Tenses Lampau ke Present",
              explanation: "Ketika bercerita tentang kemarin, seluruh kata kerja tindakan harus konsisten dalam bentuk lampau (V2).",
              wrong: "Yesterday I woke up, then I eat breakfast and go to work.",
              correct: "Yesterday I woke up, then I ate breakfast and went to work."
            }
          }
        },
        {
          sectionType: "vocab",
          title: "Konektor Cerita & Waktu",
          content: {
            items: [
              { word: "First", ipa: "/fɜːst/", meaning: "Pertama-tama", collocation: "First of all" },
              { word: "Then", ipa: "/ðen/", meaning: "Kemudian / Lalu", collocation: "Then we went home" },
              { word: "After that", ipa: "/ˈɑːf.tər ðæt/", meaning: "Setelah itu", collocation: "After that, I took a shower" },
              { word: "Finally", ipa: "/ˈfaɪ.nəl.i/", meaning: "Akhirnya / Pada akhirnya", collocation: "Finally finished the work" },
              { word: "Whole day", ipa: "/hoʊl deɪ/", meaning: "Sepanjang hari", collocation: "Tired the whole day" }
            ]
          }
        },
        {
          sectionType: "dialogue",
          title: "Percakapan: Bertukar Cerita Hari Kemarin",
          content: {
            context: "Dua sahabat menceritakan rincian hari sibuk mereka kemarin.",
            lines: [
              { speaker: "Bagas", text: "How was your day yesterday, Citra?" },
              { speaker: "Citra", text: "It was very busy! First, I woke up early and prepared my presentation." },
              { speaker: "Bagas", text: "Did the meeting go well?" },
              { speaker: "Citra", text: "Yes, it did. After that, I went to the bank and met a friend for dinner." },
              { speaker: "Bagas", text: "Finally you can relax today!" }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Speaking Lab)",
          content: {
            drills: [
              { id: "d1", targetText: "First I woke up early, then I went to the office.", focus: "Kombinasi konektor 'First' dan 'then' dalam narasi lampau", hint: "Pastikan konsisten gunakan 'woke' dan 'went'." },
              { id: "d2", targetText: "After that, we had dinner together.", focus: "Frasa 'After that' dan bentuk lampau 'had dinner'", hint: "Ucapkan 'had dinner' dengan lancar." }
            ],
            roleplay: {
              context: "Menceritakan urutan aktivitas seharian kemarin.",
              roles: ["Citra", "Bagas"],
              defaultUserRole: "Citra",
              turns: [
                { speaker: "Bagas", text: "How was your day yesterday, Citra?" },
                { speaker: "Citra", text: "It was very busy! First, I woke up early and prepared my presentation." },
                { speaker: "Bagas", text: "Did the meeting go well?" },
                { speaker: "Citra", text: "Yes, it did. After that, I went to the bank and met a friend for dinner." },
                { speaker: "Bagas", text: "Finally you can relax today!" }
              ]
            },
            challenge: {
              scenario: "Ceritakan harimu kemarin dalam 2-3 kalimat runtut: apa yang kamu lakukan di pagi hari, lalu apa yang kamu lakukan di sore hari menggunakan 'First' dan 'Then'.",
              exampleAnswer: "First, I woke up at seven and worked on my laptop. Then, I cooked dinner and watched television.",
              targetGrammar: "Chronological Past Narrative (First, Then, After that)"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Kuis Evaluasi M25: Story Narrative",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah rangkaian kata kerja lampau yang tepat dan konsisten:",
                options: [
                  "Yesterday I woke up, ate breakfast, and went to work.",
                  "Yesterday I wake up, ate breakfast, and go to work.",
                  "Yesterday I woke up, eat breakfast, and went to work.",
                  "Yesterday I waking up, eating, and go."
                ],
                answer: "Yesterday I woke up, ate breakfast, and went to work.",
                explanation: "Semua kata kerja dalam narasi lampau harus konsisten dalam bentuk V2 (woke, ate, went)."
              },
              {
                id: "q2",
                question: "Konektor apa yang paling tepat untuk mengawali urutan cerita pertama?",
                options: ["First", "Finally", "After", "Last"],
                answer: "First",
                explanation: "'First' atau 'First of all' digunakan untuk langkah atau urutan kejadian pertama."
              },
              {
                id: "q3",
                question: "Lengkapi kalimat: 'After that, we ___ to the cinema and ___ a comedy film.'",
                options: ["went / watched", "go / watch", "went / watch", "gone / watching"],
                answer: "went / watched",
                explanation: "Kedua kata kerja dalam klausa narasi lampau menggunakan V2 (went dan watched)."
              }
            ]
          }
        }
      ]
    },
    {
      id: "A1-M26",
      levelId: "A1.2",
      title: "Level A1.2 Comprehensive Graduation Assessment",
      cefr: "A1",
      group: "Graduation Exam",
      objective: "Evaluasi komprehensif menguji seluruh kompetensi A1.2 (Past Simple, Prepositions, Modal Can/Could, Logistics). Syarat lulus >= 75%.",
      complexity: "deep",
      estimatedMinutes: 30,
      isExam: true,
      passingScore: 75,
      orderIndex: 26,
      sections: [
        {
          sectionType: "theory",
          title: "Petunjuk Ujian Kelulusan Level A1.2",
          content: {
            summary: "Selamat telah mencapai tahap akhir Level A1.2! Ujian ini terdiri dari kuis komprehensif 10 soal mencakup seluruh materi M14 sampai M25.",
            rules: [
              { pronoun: "Syarat Kelulusan", meaning: "Skor minimal 75%", example: "Menjawab benar minimal 8 dari 10 soal." },
              { pronoun: "Cakupan Materi", meaning: "Past tense, preposisi, modal, arah jalan, & narasi waktu", example: "Was/were, regular/irregular verbs, in/on/at, could you, want to." }
            ]
          }
        },
        {
          sectionType: "practice",
          title: "Praktikum Berbicara (Oral Graduation Checkpoint)",
          content: {
            drills: [
              { id: "d1", targetText: "I was very excited because I completed all the modules.", focus: "Kombinasi past state 'was excited' dan 'completed'", hint: "Lafalkan 'completed' dengan bunyi /ɪd/." },
              { id: "d2", targetText: "Could you please give me the graduation certificate?", focus: "Permintaan santun tingkat lanjut", hint: "Ucapkan dengan percaya diri dan intonasi ramah." }
            ],
            roleplay: {
              context: "Wawancara akhir kelulusan Level A1.2 bersama Mr. Khoirul.",
              roles: ["Siswa", "Mr. Khoirul"],
              defaultUserRole: "Siswa",
              turns: [
                { speaker: "Mr. Khoirul", text: "Welcome to the Level A1.2 Final Assessment! How are you feeling today?" },
                { speaker: "Siswa", text: "I feel great! I reviewed all the past tense and preposition topics." },
                { speaker: "Mr. Khoirul", text: "Excellent. Can you tell me what you did yesterday?" },
                { speaker: "Siswa", text: "Yesterday I practiced speaking, and I cooked dinner with my family." }
              ]
            },
            challenge: {
              scenario: "Sampaikan pidato singkat kelulusan A1.2: sebutkan apa yang kamu pelajari di level ini dan apa rencanamu untuk level berikutnya menggunakan 'want to'.",
              exampleAnswer: "In this level, I learned past tense and prepositions. Now, I want to continue to Level A2 to speak even more fluently!",
              targetGrammar: "Level A1.2 Full Graduation Speech"
            }
          }
        },
        {
          sectionType: "quiz",
          title: "Ujian Akhir Kelulusan Level A1.2 (10 Soal)",
          content: {
            questions: [
              {
                id: "q1",
                question: "Pilihlah bentuk kata yang tepat: 'We ___ in the conference room yesterday afternoon.'",
                options: ["were", "was", "are", "is"],
                answer: "were",
                explanation: "Subjek jamak 'We' dalam waktu lampau menggunakan 'were'."
              },
              {
                id: "q2",
                question: "Bagaimana melafalkan kata 'Needed' dengan benar?",
                options: ["/ˈniː.dɪd/", "/niːdt/", "/niːdd/", "/niːd/"],
                answer: "/ˈniː.dɪd/",
                explanation: "Kata kerja berakhiran d dilafalkan dua suku kata dengan bunyi /ɪd/ (need-id)."
              },
              {
                id: "q3",
                question: "Lengkapi kalimat tanya: 'Did you ___ your grandmother last weekend?'",
                options: ["visit", "visited", "visiting", "visits"],
                answer: "visit",
                explanation: "Setelah kata tanya 'Did', kata kerja kembali ke bentuk dasar V1 (visit)."
              },
              {
                id: "q4",
                question: "Bentuk lampau (V2) dari kata kerja 'take' adalah:",
                options: ["took", "taked", "taken", "takes"],
                answer: "took",
                explanation: "Bentuk V2 dari take adalah took."
              },
              {
                id: "q5",
                question: "'The laptop is ___ the desk, and the files are ___ the drawer.'",
                options: ["on / in", "in / on", "at / to", "on / at"],
                answer: "on / in",
                explanation: "Di atas meja = on the desk; di dalam laci = in the drawer."
              },
              {
                id: "q6",
                question: "Ungkapan yang paling santun untuk meminta tolong membuka jendela adalah:",
                options: ["Could you please open the window?", "Open window now!", "Can you to open window?", "You open window please."],
                answer: "Could you please open the window?",
                explanation: "'Could you please + V1' adalah standar permohonan santun."
              },
              {
                id: "q7",
                question: "Lengkapi kalimat waktu: 'The seminar starts ___ 9:00 AM ___ Monday.'",
                options: ["at / on", "on / at", "in / on", "at / in"],
                answer: "at / on",
                explanation: "Jam spesifik = at 9:00 AM; nama hari = on Monday."
              },
              {
                id: "q8",
                question: "Pilihlah kalimat yang secara tata bahasa BENAR:",
                options: ["I prefer tea to coffee.", "I prefer tea than coffee.", "I prefer tea more coffee.", "I prefer tea from coffee."],
                answer: "I prefer tea to coffee.",
                explanation: "Pola pembanding preferensi adalah 'prefer X to Y'."
              },
              {
                id: "q9",
                question: "Lengkapi kalimat: 'She can ___ five musical instruments.'",
                options: ["play", "plays", "to play", "played"],
                answer: "play",
                explanation: "Setelah modal 'can', kata kerja selalu berbentuk dasar (play)."
              },
              {
                id: "q10",
                question: "'Next year, my family and I plan ___ abroad.'",
                options: ["to travel", "travel", "traveling", "to traveling"],
                answer: "to travel",
                explanation: "Pola rencana adalah 'plan to + V1 (travel)'."
              }
            ]
          }
        }
      ]
    }
  ]
};

const outputPath = path.resolve("data/level_a1_2_modules.json");
fs.writeFileSync(outputPath, JSON.stringify(levelA1_2, null, 2), "utf8");
console.log("Successfully generated data/level_a1_2_modules.json with 13 modules!");
