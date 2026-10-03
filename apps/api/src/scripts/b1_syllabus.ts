export interface ModuleMeta {
  id: string;
  levelId: string;
  title: string;
  group: string;
  objective: string;
  orderIndex: number;
  isExam: boolean;
  passingScore: number;
  promptNotes: string;
}

export const B1_1_EXAM_META: ModuleMeta = {
  id: "B1.1-M13",
  levelId: "B1.1",
  title: "Ujian Kelulusan B1.1: Evaluasi Komprehensif Fondasi Intermediate",
  group: "B1.1 - Intermediate Foundations",
  objective:
    "Ujian kelulusan komprehensif 4 keterampilan (Listening, Reading, Writing, Speaking) untuk membuka Sub-Level B1.2",
  orderIndex: 13,
  isExam: true,
  passingScore: 75,
  promptNotes:
    "Ujian komprehensif 4-Skills untuk B1.1 yang mengevaluasi: present tenses untuk kepribadian, present perfect with for/since, comparatives/superlatives, indefinite pronouns, future forms (will/going to/present continuous), first conditional with unless, modals of ability/obligation, second conditional, past perfect, passive voice simple, dan reported speech dasar. Pastikan 16 butir kuis terbagi rata menjadi 4 Listening (dengan konteks transkrip audio), 4 Reading (dengan konteks teks bacaan paragraf), 4 Writing/Grammar, dan 4 Speaking.",
};

export const B1_2_SYLLABUS: ModuleMeta[] = [
  {
    id: "B1.2-M01",
    levelId: "B1.2",
    title: "Professional Communication: Business Emails, Formal Registers & Etiquette",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menguasai etika korespondensi formal, sapaan profesional, struktur email bisnis, dan frase penutup baku.",
    orderIndex: 1,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Fokus pada register formal vs informal dalam bahasa Inggris profesional. Frase: 'I am writing to inquire regarding...', 'Please find attached...', 'I would appreciate if you could...'. Bedakan email ke rekan kerja vs klien penting.",
  },
  {
    id: "B1.2-M02",
    levelId: "B1.2",
    title: "Present Perfect Continuous: Ongoing Actions vs Finished Results",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Membedakan aksi yang telah berlangsung hingga sekarang (have been doing) dengan hasil akhir aksi (have done).",
    orderIndex: 2,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Perbedaan mendalam antara Present Perfect Simple (I have painted the wall - selesai) vs Present Perfect Continuous (I have been painting the wall - baju penuh cat/proses masih berjalan). Time expressions: for hours, lately, recently, all morning.",
  },
  {
    id: "B1.2-M03",
    levelId: "B1.2",
    title: "Travel Dilemmas, Booking Flights & Problem Resolution at Transit Hubs",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menangani situasi rumit di bandara internasional: penerbangan tertunda, bagasi hilang, dan pengalihan rute.",
    orderIndex: 3,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Kosakata navigasi bandara lanjutan: connecting flight, layover, compensation claim, customs declaration. Latihan dialog asertif namun sopan dengan petugas maskapai.",
  },
  {
    id: "B1.2-M04",
    levelId: "B1.2",
    title: "Modals of Probability & Deduction: Must, Might, Can't in Everyday Reasoning",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menggunakan kata kerja bantu modal untuk menyimpulkan kepastian (must), kemungkinan (might/could), dan kemustahilan (can't).",
    orderIndex: 4,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Deduksi saat ini: He must be at home (99% yakin), She might come late (50% yakin), That can't be true (mustahil). Jebakan umum: menggunakan mustn't untuk deduksi negatif (salah, harus can't).",
  },
  {
    id: "B1.2-M05",
    levelId: "B1.2",
    title: "Global Cuisine, Culinary Heritage & Expressing Dietary Preferences Politely",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Mendiskusikan tradisi kuliner internasional, alergi makanan, preferensi vegetarian/halal, dan memesan menu secara spesifik.",
    orderIndex: 5,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Frase pemesanan makanan tingkat intermediate: 'Could you tell me what this dish contains?', 'I have a severe nut allergy', 'Could I have the dressing on the side?'. Kosakata rasa dan teknik memasak: savory, zesty, tender, simmer, garnish.",
  },
  {
    id: "B1.2-M06",
    levelId: "B1.2",
    title: "Passive Voice in Ongoing Operations: Present Continuous & Present Perfect Passives",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menjelaskan proses manufaktur, renovasi, dan status sistem menggunakan kalimat pasif bentuk continuous dan perfect.",
    orderIndex: 6,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Formula: Present Continuous Passive (is/are being + V3) dan Present Perfect Passive (has/have been + V3). Contoh: The bridge is being repaired; The documents have already been signed. Konteks operasional kerja dan proyek.",
  },
  {
    id: "B1.2-M07",
    levelId: "B1.2",
    title: "Linking Ideas with Precision: In order to, So that, Because of & Due to",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menggabungkan ide kompleks menggunakan konjungsi tujuan dan penyebab formal untuk tulisan dan pidato yang koheren.",
    orderIndex: 7,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Konjungsi tujuan (in order to + verb vs so that + clause) dan penyebab (because of / due to + noun phrase vs because + clause). Analisis kesalahan umum penulisan siswa level B1.",
  },
  {
    id: "B1.2-M08",
    levelId: "B1.2",
    title: "Urban Living vs Rural Peace: Demographic Trends, Nuanced Adjectives & Lifestyle Choices",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Membandingkan gaya hidup perkotaan dan pedesaan dengan kata sifat bernuansa tinggi dan membedah tren sosial.",
    orderIndex: 8,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Kosakata urban & rural: bustling metropolis, tranquil retreat, cost of living, commute, air quality, infrastructure. Pola kalimat perbandingan ganda: 'The bigger the city, the more expensive the rent'.",
  },
  {
    id: "B1.2-M09",
    levelId: "B1.2",
    title: "Habitual Past & Adaptations: Used To vs Would vs Be/Get Used To",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menguasai perbedaan kebiasaan masa lalu (used to / would) dengan proses adaptasi kebiasaan baru (be/get used to + V-ing).",
    orderIndex: 9,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Pembeda krusial: used to + infinitive (kebiasaan/status dulu), would + infinitive (hanya aksi berulang di masa lalu, bukan status), dan be/get used to + gerund/noun (terbiasa dengan kondisi baru).",
  },
  {
    id: "B1.2-M10",
    levelId: "B1.2",
    title: "Job Interviews: Showcasing Strengths, Describing Challenges & Asking Strategic Questions",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menjawab pertanyaan wawancara kerja standar dengan metode STAR, memaparkan kelemahan secara positif, dan menanyakan budaya kerja.",
    orderIndex: 10,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Simulasi wawancara kerja profesional: 'Tell me about a time you handled a difficult deadline', 'My greatest strength is...', 'Could you elaborate on the team dynamics?'.",
  },
  {
    id: "B1.2-M11",
    levelId: "B1.2",
    title: "Complex Narrative Storytelling: Interweaving Past Continuous, Past Simple & Past Perfect Continuous",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menyusun narasi multi-lapis yang dinamis dengan mengintegrasikan ketiga tense masa lalu secara harmonis.",
    orderIndex: 11,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Narasi lanjutan: Past Perfect Continuous (had been + V-ing) untuk aksi yang sudah berlangsung lama sebelum peristiwa lain di masa lalu. Contoh: He was exhausted because he had been driving for six hours before the engine failed.",
  },
  {
    id: "B1.2-M12",
    levelId: "B1.2",
    title: "Consumer Rights, Product Warranties & Constructive Assertiveness",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Menyampaikan keluhan konsumen secara tegas, sopan, dan efektif untuk menuntut pengembalian dana atau penggantian barang rusak.",
    orderIndex: 12,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Bahasa advokasi konsumen: 'I am entitled to a replacement under warranty', 'The product is defective and does not match the specifications', 'I insist on speaking with a customer relations supervisor'.",
  },
  {
    id: "B1.2-M13",
    levelId: "B1.2",
    title: "Ujian Kelulusan B1.2: Evaluasi Komprehensif Komunikasi Global & Dunia Kerja",
    group: "B1.2 - Intermediate Fluency & Global Work",
    objective:
      "Ujian kelulusan komprehensif 4 keterampilan (Listening, Reading, Writing, Speaking) untuk membuka Sub-Level B1.3",
    orderIndex: 13,
    isExam: true,
    passingScore: 75,
    promptNotes:
      "Ujian 4-Skills B1.2 dengan 16 butir soal terbagi adil: 4 Listening (transkrip wawancara kerja & resolusi komplain bandara), 4 Reading (teks artikel bisnis & hak konsumen), 4 Writing/Grammar (present perfect continuous, modals of deduction, passive voice, used to/be used to), dan 4 Speaking (roleplay negosiasi dan wawancara bersama Mr. Khoirul).",
  },
];

export const B1_3_SYLLABUS: ModuleMeta[] = [
  {
    id: "B1.3-M01",
    levelId: "B1.3",
    title: "Media Literacy: Detecting Biases, Fact-Checking & Spotting Misinformation",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Menganalisis artikel berita digital, membedakan fakta objektif dari opini, dan mengidentifikasi judul umpan klik (clickbait).",
    orderIndex: 1,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Kosakata literasi informasi: sensationalism, credible source, fact-checking, confirmation bias, misleading headline. Frase evaluatif: 'This claim is unsubstantiated', 'According to independent audits...'.",
  },
  {
    id: "B1.3-M02",
    levelId: "B1.3",
    title: "Third Conditional: Imagining Alternative Past Outcomes, Lessons & Regrets",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Menguasai pengandaian masa lalu yang tidak mungkin terulang kembali menggunakan pola If + had + V3, would have + V3.",
    orderIndex: 2,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Struktur Third Conditional: If she had prepared earlier, she wouldn't have missed the flight. Kontraksi pengucapan alami: 'would've', 'could've', 'hadn't'. Analisis pelajaran hidup dari kesalahan masa lampau.",
  },
  {
    id: "B1.3-M03",
    levelId: "B1.3",
    title: "Environmental Sustainability: Renewable Energy, Eco-Innovations & Community Actions",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Mendiskusikan solusi perubahan iklim, energi terbarukan, jejak karbon, dan inisiatif ramah lingkungan perkotaan.",
    orderIndex: 3,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Kosakata lingkungan tingkat intermediate: carbon footprint, zero-waste lifestyle, solar photovoltaic, biodegradable packaging, reforestation. Latihan berargumentasi tentang tanggung jawab perusahaan vs individu.",
  },
  {
    id: "B1.3-M04",
    levelId: "B1.3",
    title: "Advanced Reported Speech: Nuanced Reporting Verbs",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Menggantikan 'say' dan 'tell' dengan kata kerja pelapor presisi seperti admit, warn, advise, remind, apologize, dan refuse.",
    orderIndex: 4,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Pola gramatika reporting verbs: verb + to-infinitive (He offered to help; She refused to pay), verb + object + to-infinitive (He warned us not to enter), verb + -ing / preposition + -ing (He apologized for being late; She admitted making a mistake).",
  },
  {
    id: "B1.3-M05",
    levelId: "B1.3",
    title: "Habit Science & Productivity: Goal-Setting Psychology & Overcoming Procrastination",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Membahas psikologi pembentukan kebiasaan, manajemen waktu, fokus kerja, dan strategi mengatasi penundaan tugas.",
    orderIndex: 5,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Kosakata produktivitas: dopamine reward loop, cue and craving, deep work, time-blocking, accountability partner. Frase refleksi: 'I tend to put off tasks whenever...', 'Breaking milestones into manageable chunks...'.",
  },
  {
    id: "B1.3-M06",
    levelId: "B1.3",
    title: "Mixed Conditionals Foundations: Connecting Past Choices with Present Realities",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Memahami dasar kalimat pengandaian campuran yang menghubungkan keputusan di masa lalu dengan dampaknya pada kondisi saat ini.",
    orderIndex: 6,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Pola Past action -> Present result: If I had accepted that job offer last year, I would be living in Tokyo today. Bedakan dengan murni Third Conditional.",
  },
  {
    id: "B1.3-M07",
    levelId: "B1.3",
    title: "Cultural Criticism: Reviewing Books, Independent Cinema & Visual Arts",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Menyusun kritik seni dan ulasan film yang mendalam, mencakup plot, penokohan, sinematografi, dan pesan tersirat.",
    orderIndex: 7,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Kosakata telaah karya: character development, plot twist, metaphorical, poignant ending, breathtaking cinematography. Frase opini analitis: 'The protagonist struggles with...', 'The underlying theme revolves around...'.",
  },
  {
    id: "B1.3-M08",
    levelId: "B1.3",
    title: "Expressing Regrets & Desires: Mastery of Wish and If Only",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Mengungkapkan penyesalan masa lalu (wish + past perfect), keluhan masa kini (wish + past simple), dan harapan perubahan perilaku orang lain (wish + would).",
    orderIndex: 8,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Tiga formula wish/if only: 1) I wish I had studied harder (past regret); 2) I wish I had more free time (present desire); 3) I wish they would stop shouting (annoyance/request for change).",
  },
  {
    id: "B1.3-M09",
    levelId: "B1.3",
    title: "Multi-word Verbs & Idiomatic Fluency in Academic and Informal Dialogues",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Menguasai phrasal verbs tiga kata (three-part phrasal verbs) dan idiom percakapan umum yang sering muncul di level B1/B2.",
    orderIndex: 9,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Three-part phrasal verbs: look forward to, put up with, run out of, cut down on, come up with, get along with. Idiom alami: bite the bullet, see eye to eye, hit the nail on the head.",
  },
  {
    id: "B1.3-M10",
    levelId: "B1.3",
    title: "Non-defining Relative Clauses: Adding Insightful Commentary & Context",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Menggunakan anak kalimat relatif non-defining dengan koma untuk memperkaya deskripsi tulisan dan tuturan lisan.",
    orderIndex: 10,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Pola non-defining clauses (selalu dengan tanda koma, TIDAK boleh menggunakan 'that'): My supervisor, who has worked here for twenty years, is retiring next month; The new software, which was developed in Germany, increases efficiency.",
  },
  {
    id: "B1.3-M11",
    levelId: "B1.3",
    title: "Art of Diplomatic Argumentation: Tactful Disagreement & Reaching Consensus",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Menyampaikan ketidaksetujuan secara elegan, mengakui poin lawan bicara, dan membangun kesepakatan dalam diskusi kelompok.",
    orderIndex: 11,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Frase diplomatis: 'I see your point, however...', 'With respect, I have a slightly different perspective', 'Could we perhaps compromise on...', 'While I agree with your premise, the practical application is...'.",
  },
  {
    id: "B1.3-M12",
    levelId: "B1.3",
    title: "Bridge to B2: Extended Spontaneous Discourse, Debate & Argument Structure",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Mempersiapkan transisi ke level Vantage (B2) dengan latihan berbicara panjang tanpa jeda, menyusun argumen terstruktur.",
    orderIndex: 12,
    isExam: false,
    passingScore: 70,
    promptNotes:
      "Struktur presentasi mini & debat: Opening statement, Point-Evidence-Explanation (PEE), addressing counterarguments, and powerful summary. Latihan kelancaran berbicara (discourse markers: furthermore, nevertheless, in contrast, consequently).",
  },
  {
    id: "B1.3-M13",
    levelId: "B1.3",
    title: "Ujian Kelulusan Akhir B1: Comprehensive 4-Skills CEFR B1 Graduation Exam",
    group: "B1.3 - Critical Perspectives & Bridge to B2",
    objective:
      "Ujian kelulusan akhir komprehensif 4 keterampilan (Listening, Reading, Writing, Speaking) untuk membuka Level B2 (B2.1)",
    orderIndex: 13,
    isExam: true,
    passingScore: 75,
    promptNotes:
      "Ujian kelulusan akhir CEFR B1 menguji seluruh kompetensi Intermediate: 16 butir soal kuis (4 Listening dengan transkrip seminar/debat, 4 Reading dengan artikel opini analitis, 4 Writing/Grammar dengan third conditional, reporting verbs, mixed conditionals, wish, non-defining clauses, dan 4 Speaking dengan presentasi & debat interaktif bersama Mr. Khoirul).",
  },
];
