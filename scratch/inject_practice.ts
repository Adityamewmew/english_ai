import fs from "fs";
import path from "path";

const dataPath = path.resolve("data/level_a1_modules.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const practiceDataMap: Record<string, any> = {
  "A1-M01": {
    drills: [
      { id: "d1", targetText: "She is my colleague.", focus: "Pelafalan 'She' (/ʃiː/) dan 'colleague' (/ˈkɒl.iːɡ/)", hint: "Ucapkan 'Syi', jangan 'Si'." },
      { id: "d2", targetText: "We learn English together.", focus: "Subjek jamak 'We' & bunyi /ð/ pada 'together'", hint: "Tegaskan subjek 'We' dan lidah di gigi untuk /ð/." }
    ],
    roleplay: {
      context: "Sarah bertemu Reza di ruang orientasi belajar bahasa Inggris.",
      roles: ["Reza", "Sarah"],
      defaultUserRole: "Reza",
      turns: [
        { speaker: "Sarah", text: "Hello! I am Sarah. Are you a new student here?" },
        { speaker: "Reza", text: "Hi Sarah! Yes, I am. My name is Reza. Nice to meet you." },
        { speaker: "Sarah", text: "Nice to meet you too. Who is that girl over there?" },
        { speaker: "Reza", text: "Oh, she is my sister. Her name is Dinda. We study here together." }
      ]
    },
    challenge: {
      scenario: "Perkenalkan dirimu dan sebutkan 1 nama teman barumu di kelas menggunakan kata ganti 'I' dan 'He' atau 'She'.",
      exampleAnswer: "Hello, I am Budi. This is Sarah, she is my friend.",
      targetGrammar: "Personal pronouns (I, He, She)"
    }
  },
  "A1-M02": {
    drills: [
      { id: "d1", targetText: "I am ready for the meeting.", focus: "Pelafalan 'I am' / 'I'm' tanpa tertukar kata kerja", hint: "Gunakan 'am' hanya untuk subjek 'I'." },
      { id: "d2", targetText: "They are not at home.", focus: "Subjek jamak 'They are' dan penolakan 'not'", hint: "Sambung 'are not' menjadi 'aren't' atau lafalkan jelas." }
    ],
    roleplay: {
      context: "Andi menanyakan kabar Budi yang tampak lelah di kantor.",
      roles: ["Budi", "Andi"],
      defaultUserRole: "Budi",
      turns: [
        { speaker: "Andi", text: "Hi Budi, are you okay today?" },
        { speaker: "Budi", text: "I am a little tired, but I am okay. How about you?" },
        { speaker: "Andi", text: "I am very happy because tomorrow is holiday!" },
        { speaker: "Budi", text: "That is great news. We are ready for the weekend." }
      ]
    },
    challenge: {
      scenario: "Jelaskan kondisimu saat ini (misal: senang, lelah, lapar) dan sebutkan kondisi teman atau kantormu menggunakan To Be.",
      exampleAnswer: "I am happy today, and my office is very busy.",
      targetGrammar: "To Be (Am, Is, Are)"
    }
  },
  "A1-M03": {
    drills: [
      { id: "d1", targetText: "Is he your teacher?", focus: "Intonasi naik pada pertanyaan Yes/No", hint: "Naikkan nada suara di akhir kata 'teacher'." },
      { id: "d2", targetText: "No, she is not a doctor.", focus: "Penolakan sopan dengan 'is not'", hint: "Tegaskan kata 'not'." }
    ],
    roleplay: {
      context: "Di meja resepsionis seminar, petugas mengonfirmasi status peserta.",
      roles: ["Peserta", "Petugas"],
      defaultUserRole: "Peserta",
      turns: [
        { speaker: "Petugas", text: "Good morning! Are you a participant for the English seminar?" },
        { speaker: "Peserta", text: "Yes, I am. Here is my registration ticket." },
        { speaker: "Petugas", text: "Thank you. Is that gentleman your colleague?" },
        { speaker: "Peserta", text: "No, he is not. He is a speaker for the next session." }
      ]
    },
    challenge: {
      scenario: "Tanyakan kepada lawan bicaramu apakah dia seorang murid baru atau guru menggunakan kalimat tanya To Be.",
      exampleAnswer: "Excuse me, are you a new student here?",
      targetGrammar: "To Be Question (Are you...?)"
    }
  },
  "A1-M04": {
    drills: [
      { id: "d1", targetText: "This is my notebook.", focus: "Bunyi /ðɪs/ untuk benda dekat", hint: "Keluarkan sedikit ujung lidah di antara gigi." },
      { id: "d2", targetText: "Those are new chairs.", focus: "Bunyi /ðoʊz/ untuk benda jamak jauh", hint: "Pastikan ada bunyi getar /z/ di akhir 'those'." }
    ],
    roleplay: {
      context: "Rani dan Doni menemukan tas dan kacamata tertinggal di kafe.",
      roles: ["Doni", "Rani"],
      defaultUserRole: "Doni",
      turns: [
        { speaker: "Rani", text: "Excuse me, is this your bag on the chair?" },
        { speaker: "Doni", text: "No, that is not mine. That bag is black, mine is blue." },
        { speaker: "Rani", text: "What about these glasses on the table?" },
        { speaker: "Doni", text: "Yes, those are my glasses! Thank you so much." }
      ]
    },
    challenge: {
      scenario: "Sebutkan 1 barang yang ada tepat di depanmu dengan 'This is' dan 1 barang yang berada di seberang ruangan dengan 'That is'.",
      exampleAnswer: "This is my phone, and that is a whiteboard.",
      targetGrammar: "Demonstratives (This is, That is)"
    }
  },
  "A1-M05": {
    drills: [
      { id: "d1", targetText: "She has two brothers.", focus: "Bunyi /z/ pada 'has' untuk subjek orang ketiga", hint: "Gunakan 'has' untuk He/She, bukan 'have'." },
      { id: "d2", targetText: "I have a laptop and a phone.", focus: "Kelancaran frasa kepemilikan 'I have'", hint: "Sambung kata 'have a' menjadi 'hav-a'." }
    ],
    roleplay: {
      context: "Dina dan Kevin saling bercerita tentang hewan peliharaan dan keluarga.",
      roles: ["Kevin", "Dina"],
      defaultUserRole: "Kevin",
      turns: [
        { speaker: "Dina", text: "Do you have any pets at home, Kevin?" },
        { speaker: "Kevin", text: "Yes, I have two cats. How about you?" },
        { speaker: "Dina", text: "I do not have pets, but my brother has a big dog." },
        { speaker: "Kevin", text: "That is nice! He has a lovely companion." }
      ]
    },
    challenge: {
      scenario: "Ceritakan 2 benda atau hal yang kamu miliki dengan 'I have' dan 1 hal yang dimiliki teman/keluargamu dengan 'He/She has'.",
      exampleAnswer: "I have a motorcycle and a laptop. My sister has a red car.",
      targetGrammar: "Possession with Have/Has"
    }
  },
  "A1-M06": {
    drills: [
      { id: "d1", targetText: "Do you have an umbrella?", focus: "Pertanyaan kepemilikan 'Do you have' + artikel 'an'", hint: "Sambung 'have an' menjadi satu tarikan nafas." },
      { id: "d2", targetText: "Does he have a car?", focus: "Bentuk dasar 'have' setelah kata tanya 'Does he'", hint: "Jangan gunakan 'has' setelah 'Does'." }
    ],
    roleplay: {
      context: "Hujan tiba-tiba turun deras di luar perpustakaan.",
      roles: ["Rian", "Maya"],
      defaultUserRole: "Rian",
      turns: [
        { speaker: "Maya", text: "Oh no, it is raining heavily outside. Do you have an umbrella?" },
        { speaker: "Rian", text: "No, I do not have one with me today. Does Tom have a car?" },
        { speaker: "Maya", text: "Yes, he has a car, but he is already in the parking area." },
        { speaker: "Rian", text: "Let us wait here until the rain stops." }
      ]
    },
    challenge: {
      scenario: "Tanyakan kepada rekan bicaramu apakah dia membawa pulpen cadangan atau uang kecil menggunakan 'Do you have...'.",
      exampleAnswer: "Excuse me, do you have a pen I can borrow?",
      targetGrammar: "Asking with Do you have...?"
    }
  },
  "A1-M07": {
    drills: [
      { id: "d1", targetText: "I drink coffee every morning.", focus: "Kata kerja tindakan 'drink' dan ritme kalimat", hint: "Ucapkan 'drink' dengan jelas tanpa imbuhan." },
      { id: "d2", targetText: "We work from home on Friday.", focus: "Preposisi 'on Friday' dan subjek 'We'", hint: "Gunakan 'on' untuk nama hari." }
    ],
    roleplay: {
      context: "Rudi dan Fajar saling bertukar cerita tentang rutinitas pagi sebelum kantor.",
      roles: ["Fajar", "Rudi"],
      defaultUserRole: "Fajar",
      turns: [
        { speaker: "Rudi", text: "What time do you usually wake up every day?" },
        { speaker: "Fajar", text: "I wake up at five in the morning, then I drink tea." },
        { speaker: "Rudi", text: "Do you exercise before you go to work?" },
        { speaker: "Fajar", text: "Yes, I run for twenty minutes in the park." }
      ]
    },
    challenge: {
      scenario: "Sebutkan 2 aktivitas yang selalu kamu lakukan di pagi hari menggunakan kalimat Present Simple.",
      exampleAnswer: "I wake up at six and I eat breakfast with my family.",
      targetGrammar: "Present Simple 1st person (I + verb)"
    }
  },
  "A1-M08": {
    drills: [
      { id: "d1", targetText: "He watches movies on Sunday.", focus: "Pelafalan imbuhan -es (/ɪz/) pada kata 'watches'", hint: "Ucapkan 'watch-iz' dengan dua suku kata." },
      { id: "d2", targetText: "She lives in Bandung.", focus: "Pelafalan bunyi /z/ pada 'lives'", hint: "Jangan lupa bunyi 's' di akhir kata kerja orang ketiga." }
    ],
    roleplay: {
      context: "Tari menceritakan pekerjaan kakaknya kepada Dimas.",
      roles: ["Dimas", "Tari"],
      defaultUserRole: "Dimas",
      turns: [
        { speaker: "Tari", text: "My sister works in a hospital in Surabaya." },
        { speaker: "Dimas", text: "Really? What does she do there?" },
        { speaker: "Tari", text: "She treats patients. She loves her job very much." },
        { speaker: "Dimas", text: "That is wonderful. She helps many people every day." }
      ]
    },
    challenge: {
      scenario: "Ceritakan 1 pekerjaan atau rutinitas yang dilakukan oleh teman atau keluargamu menggunakan kata kerja berakhiran -s/-es.",
      exampleAnswer: "My father works in a bank, and he drinks tea every afternoon.",
      targetGrammar: "Third person singular -s/-es rule"
    }
  },
  "A1-M09": {
    drills: [
      { id: "d1", targetText: "I always wake up early.", focus: "Posisi 'always' tepat sebelum kata kerja utama", hint: "Letakkan 'always' sebelum 'wake', bukan di akhir kalimat." },
      { id: "d2", targetText: "He rarely drinks soda.", focus: "Penggunaan 'rarely' dan kata kerja berakhiran -s", hint: "'Rarely' berarti sangat jarang." }
    ],
    roleplay: {
      context: "Sita dan Bayu membicarakan kebiasaan akhir pekan mereka.",
      roles: ["Bayu", "Sita"],
      defaultUserRole: "Bayu",
      turns: [
        { speaker: "Sita", text: "Do you often cook on the weekend, Bayu?" },
        { speaker: "Bayu", text: "I rarely cook at home. I usually eat out with friends." },
        { speaker: "Sita", text: "I always cook on Sunday because I love making soup." }
      ]
    },
    challenge: {
      scenario: "Sebutkan 1 hal yang selalu kamu lakukan dan 1 hal yang jarang kamu lakukan menggunakan kata 'always' dan 'rarely'.",
      exampleAnswer: "I always read books at night, and I rarely drink coffee.",
      targetGrammar: "Frequency adverbs (always, usually, rarely)"
    }
  },
  "A1-M10": {
    drills: [
      { id: "d1", targetText: "Where do you live?", focus: "Intonasi menurun pada WH-question", hint: "Turunkan nada suara pada kata 'live'." },
      { id: "d2", targetText: "What time do you sleep?", focus: "Kecepatan bertanya 'What time do you...'", hint: "Rangkai secara lancar tanpa jeda per kata." }
    ],
    roleplay: {
      context: "Dua rekan tim proyek saling mengenal latar belakang satu sama lain.",
      roles: ["Rico", "Nadia"],
      defaultUserRole: "Rico",
      turns: [
        { speaker: "Nadia", text: "Where do you live, Rico?" },
        { speaker: "Rico", text: "I live in South Jakarta. Where are you from?" },
        { speaker: "Nadia", text: "I am from Bandung, but I live in Jakarta now." },
        { speaker: "Rico", text: "What do you do in this project?" },
        { speaker: "Nadia", text: "I design the user interface." }
      ]
    },
    challenge: {
      scenario: "Ajukan 2 pertanyaan menggunakan kata tanya 'Where' dan 'What' kepada rekan barumu.",
      exampleAnswer: "Where do you work, and what is your favorite food?",
      targetGrammar: "WH-Questions (Where, What, Who)"
    }
  },
  "A1-M11": {
    drills: [
      { id: "d1", targetText: "How much is this iced coffee?", focus: "Menanyakan harga dengan 'How much is...'", hint: "Gunakan 'How much is' untuk benda tunggal." },
      { id: "d2", targetText: "How many cups do you want?", focus: "Benda jamak terhitung 'How many + [plural]'", hint: "Pastikan kata benda berakhiran 's' (cups)." }
    ],
    roleplay: {
      context: "Memesan minuman di kafe yang ramai.",
      roles: ["Pelanggan", "Barista"],
      defaultUserRole: "Pelanggan",
      turns: [
        { speaker: "Barista", text: "Welcome to Kopi Kita! What can I get for you?" },
        { speaker: "Pelanggan", text: "Hello! How much is a cup of hot cappuccino?" },
        { speaker: "Barista", text: "It is thirty-five thousand rupiah. How many cups would you like?" },
        { speaker: "Pelanggan", text: "I would like two cups, please. Less sugar for both." },
        { speaker: "Barista", text: "Sure thing! That will be seventy thousand rupiah." }
      ]
    },
    challenge: {
      scenario: "Tanyakan harga 1 botol air mineral dan pesan 2 botol kepada pelayan.",
      exampleAnswer: "Excuse me, how much is this water? I want two bottles, please.",
      targetGrammar: "Quantity & Price (How much, How many)"
    }
  },
  "A1-M12": {
    drills: [
      { id: "d1", targetText: "It is nice talking to you.", focus: "Frasa penutup percakapan santun", hint: "Lafalkan dengan intonasi ramah dan bersahabat." },
      { id: "d2", targetText: "What do you usually do in your free time?", focus: "Pertanyaan gabungan WH + frequency adverb", hint: "Lafalkan lancar tanpa terputus di tengah." }
    ],
    roleplay: {
      context: "Dua peserta mengobrol santai sambil menunggu sesi workshop dimulai.",
      roles: ["Gilang", "Clara"],
      defaultUserRole: "Gilang",
      turns: [
        { speaker: "Clara", text: "Hello, is anyone sitting here?" },
        { speaker: "Gilang", text: "No, please sit down. My name is Gilang, by the way." },
        { speaker: "Clara", text: "Nice to meet you, Gilang. I am Clara. Are you from Jakarta?" },
        { speaker: "Gilang", text: "Yes, I am. I work as an accountant here. How about you?" },
        { speaker: "Clara", text: "I am a graphic designer from Yogyakarta." },
        { speaker: "Gilang", text: "That sounds very interesting! Do you enjoy your job?" },
        { speaker: "Clara", text: "Yes, I love it. Oh, the workshop is starting now!" },
        { speaker: "Gilang", text: "Great. It is nice talking to you, Clara." }
      ]
    },
    challenge: {
      scenario: "Lakukan perkenalan diri lengkap: sebutkan namamu, pekerjaanmu, kota asalmu, dan 1 kebiasaan yang sering kamu lakukan.",
      exampleAnswer: "Hello, my name is Budi. I am an engineer from Jakarta, and I usually exercise in the morning.",
      targetGrammar: "Full Starter Communication Synthesis"
    }
  },
  "A1-M13": {
    drills: [
      { id: "d1", targetText: "I am ready for the graduation test.", focus: "Kepercayaan diri melafalkan kalimat komprehensif", hint: "Ucapkan dengan artikulasi tegas dan jelas." },
      { id: "d2", targetText: "We speak English with confidence every day.", focus: "Kelancaran sintaksis kalimat A1.1", hint: "Perhatikan jeda alami setelah kata 'English'." }
    ],
    roleplay: {
      context: "Wawancara singkat kelulusan level A1.1 bersama Instruktur.",
      roles: ["Siswa", "Instruktur"],
      defaultUserRole: "Siswa",
      turns: [
        { speaker: "Instruktur", text: "Congratulations on reaching the final module! Are you ready?" },
        { speaker: "Siswa", text: "Yes, I am ready. I have studied all the materials thoroughly." },
        { speaker: "Instruktur", text: "Wonderful. Please tell me about yourself and your daily routine." },
        { speaker: "Siswa", text: "I live in Jakarta, I work in an office, and I practice English every day." }
      ]
    },
    challenge: {
      scenario: "Sampaikan pidato singkat kelulusan A1: ceritakan siapa dirimu, apa yang kamu miliki, dan kebiasaan belajarmu dalam bahasa Inggris.",
      exampleAnswer: "Hello! I am a student. I have a dream to speak English fluently, and I practice every single day.",
      targetGrammar: "Level A1.1 Final Oral Synthesis"
    }
  }
};

for (const mod of data.modules) {
  const pData = practiceDataMap[mod.id];
  if (!pData) continue;

  // Check if practice section already exists
  const existingIdx = mod.sections.findIndex((s: any) => s.sectionType === "practice");
  const practiceSection = {
    sectionType: "practice",
    title: "Praktikum Berbicara (Speaking Lab)",
    content: pData
  };

  if (existingIdx >= 0) {
    mod.sections[existingIdx] = practiceSection;
  } else {
    // Insert before quiz
    const quizIdx = mod.sections.findIndex((s: any) => s.sectionType === "quiz");
    if (quizIdx >= 0) {
      mod.sections.splice(quizIdx, 0, practiceSection);
    } else {
      mod.sections.push(practiceSection);
    }
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
console.log("Successfully injected tailored practice sections for all 13 modules!");
