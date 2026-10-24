// Tier 1: Easy (CEFR A1.1 - A2.3)
// Scope: Everyday foundational English, short sentences (4-8 words), simple tenses.

export interface ExamItemReading {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface ExamItemListening {
  type: "dictation" | "arrange";
  audioText: string;
  instruction: string;
  promptSentence?: string;
  targetWord?: string;
  targetSentence?: string;
  words?: string[];
  explanation: string;
}

export interface ExamItemWriting {
  type: string;
  instruction: string;
  prompt: string;
  hint: string;
  targetAnswers: string[];
  explanation: string;
}

export interface ExamItemSpeaking {
  category: string;
  instruction: string;
  prompt: string;
  sampleAnswer: string;
  phonetic: string;
  keywords: string[];
}

export const TIER_EASY_BANK = {
  reading: [
    {
      question: "What is Jamie's nationality?",
      options: ["Spanish", "French", "Italian"],
      answer: "Spanish",
      explanation: "Jamie is from Spain, so his nationality is Spanish.",
    },
    {
      question: "Which sentence is the correct negative form of 'She likes coffee'?",
      options: ["She doesn't like coffee.", "She not likes coffee.", "She don't like coffee."],
      answer: "She doesn't like coffee.",
      explanation: "For third person singular (she/he/it), we use 'doesn't + base verb'.",
    },
    {
      question: "Where do they usually eat dinner on weekdays?",
      options: ["At home with family", "In a luxury restaurant", "At the airport"],
      answer: "At home with family",
      explanation: "Daily routines typically describe having dinner at home with family.",
    },
    {
      question: "What time does the train to London depart?",
      options: ["At 8:30 in the morning", "At midnight", "Next week"],
      answer: "At 8:30 in the morning",
      explanation: "Standard timetable questions provide specific morning departure times.",
    },
    {
      question: "Choose the correct past form: 'Yesterday, we _____ a new car.'",
      options: ["bought", "buyed", "buying"],
      answer: "bought",
      explanation: "'Buy' is an irregular verb whose past simple form is 'bought'.",
    },
    {
      question: "What does Maria do every Saturday morning?",
      options: ["She visits the local market.", "She sleeps until evening.", "She travels abroad."],
      answer: "She visits the local market.",
      explanation: "A routine action in the simple present tense describing Saturday morning.",
    },
    {
      question: "Which question is grammatically correct?",
      options: ["Where do you live?", "Where you do live?", "Where lives you?"],
      answer: "Where do you live?",
      explanation: "Standard question order: Question Word + Auxiliary (do) + Subject (you) + Verb (live).",
    },
    {
      question: "What is the opposite of 'expensive'?",
      options: ["Cheap", "Big", "Heavy"],
      answer: "Cheap",
      explanation: "'Cheap' means low in price, which is the direct opposite of 'expensive'.",
    },
    {
      question: "Choose the correct preposition: 'The keys are _____ the table.'",
      options: ["on", "at", "to"],
      answer: "on",
      explanation: "We use 'on' when an object is physically resting on a surface.",
    },
    {
      question: "Which sentence expresses a future plan?",
      options: ["I am going to visit my grandmother tomorrow.", "I visited my grandmother yesterday.", "I visit my grandmother every day."],
      answer: "I am going to visit my grandmother tomorrow.",
      explanation: "'Be going to' expresses a planned future intention.",
    },
    {
      question: "What can you buy at a pharmacy?",
      options: ["Medicine and vitamins", "Shoes and shirts", "Books and magazines"],
      answer: "Medicine and vitamins",
      explanation: "Pharmacies specialize in dispensing medicines and healthcare supplies.",
    },
    {
      question: "Choose the correct pronoun: 'David called Sarah and gave _____ the book.'",
      options: ["her", "him", "she"],
      answer: "her",
      explanation: "'Sarah' is female and functions as an object pronoun, which is 'her'.",
    },
    {
      question: "Which plural form is correct?",
      options: ["Children", "Childs", "Childrens"],
      answer: "Children",
      explanation: "'Child' has the irregular plural form 'children'.",
    },
    {
      question: "What is the weather like when it is raining?",
      options: ["Wet", "Dry", "Sunny"],
      answer: "Wet",
      explanation: "Rain brings water, making the weather and ground wet.",
    },
    {
      question: "Choose the correct form: 'They _____ playing football right now.'",
      options: ["are", "is", "am"],
      answer: "are",
      explanation: "'They' requires the plural auxiliary 'are' in present continuous.",
    },
  ],

  listening: [
    {
      type: "dictation" as const,
      audioText: "I live in a small apartment.",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "I live in a small _____.",
      targetWord: "apartment",
      explanation: "Audio lengkap: 'I live in a small apartment.'. Kata yang hilang adalah 'apartment'.",
    },
    {
      type: "arrange" as const,
      audioText: "She works at the hospital.",
      instruction: "Dengarkan kalimat dan susun kata menjadi urutan yang benar:",
      targetSentence: "She works at the hospital",
      words: ["works", "the", "She", "hospital", "at"],
      explanation: "Urutan yang benar: 'She works at the hospital.'.",
    },
    {
      type: "dictation" as const,
      audioText: "Can you help me please?",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "Can you _____ me please?",
      targetWord: "help",
      explanation: "Audio lengkap: 'Can you help me please?'. Kata yang hilang adalah 'help'.",
    },
    {
      type: "arrange" as const,
      audioText: "We arrived on Monday morning.",
      instruction: "Dengarkan kalimat dan susun kata menjadi urutan yang benar:",
      targetSentence: "We arrived on Monday morning",
      words: ["arrived", "morning", "We", "Monday", "on"],
      explanation: "Urutan yang benar: 'We arrived on Monday morning.'.",
    },
    {
      type: "dictation" as const,
      audioText: "My brother is a teacher.",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "My brother is a _____.",
      targetWord: "teacher",
      explanation: "Audio lengkap: 'My brother is a teacher.'. Kata yang hilang adalah 'teacher'.",
    },
    {
      type: "arrange" as const,
      audioText: "The food was very delicious.",
      instruction: "Dengarkan kalimat dan susun kata menjadi urutan yang benar:",
      targetSentence: "The food was very delicious",
      words: ["delicious", "was", "food", "very", "The"],
      explanation: "Urutan yang benar: 'The food was very delicious.'.",
    },
    {
      type: "dictation" as const,
      audioText: "Open the window please.",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "Open the _____ please.",
      targetWord: "window",
      explanation: "Audio lengkap: 'Open the window please.'. Kata yang hilang adalah 'window'.",
    },
    {
      type: "arrange" as const,
      audioText: "I usually wake up early.",
      instruction: "Dengarkan kalimat dan susun kata menjadi urutan yang benar:",
      targetSentence: "I usually wake up early",
      words: ["up", "wake", "usually", "early", "I"],
      explanation: "Urutan yang benar: 'I usually wake up early.'.",
    },
    {
      type: "dictation" as const,
      audioText: "They bought two tickets yesterday.",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "They bought two _____ yesterday.",
      targetWord: "tickets",
      explanation: "Audio lengkap: 'They bought two tickets yesterday.'. Kata yang hilang adalah 'tickets'.",
    },
    {
      type: "arrange" as const,
      audioText: "Where is the train station?",
      instruction: "Dengarkan kalimat dan susun kata menjadi urutan yang benar:",
      targetSentence: "Where is the train station",
      words: ["station", "train", "the", "Where", "is"],
      explanation: "Urutan yang benar: 'Where is the train station?'.",
    },
    {
      type: "dictation" as const,
      audioText: "We need some fresh water.",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "We need some _____ water.",
      targetWord: "fresh",
      explanation: "Audio lengkap: 'We need some fresh water.'. Kata yang hilang adalah 'fresh'.",
    },
    {
      type: "arrange" as const,
      audioText: "He plays guitar very well.",
      instruction: "Dengarkan kalimat dan susun kata menjadi urutan yang benar:",
      targetSentence: "He plays guitar very well",
      words: ["well", "plays", "guitar", "very", "He"],
      explanation: "Urutan yang benar: 'He plays guitar very well.'.",
    },
    {
      type: "dictation" as const,
      audioText: "See you tomorrow at school.",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "See you tomorrow at _____.",
      targetWord: "school",
      explanation: "Audio lengkap: 'See you tomorrow at school.'. Kata yang hilang adalah 'school'.",
    },
    {
      type: "arrange" as const,
      audioText: "She has an older sister.",
      instruction: "Dengarkan kalimat dan susun kata menjadi urutan yang benar:",
      targetSentence: "She has an older sister",
      words: ["older", "has", "sister", "an", "She"],
      explanation: "Urutan yang benar: 'She has an older sister.'.",
    },
    {
      type: "dictation" as const,
      audioText: "What is your telephone number?",
      instruction: "Dengarkan audio dan ketik kata yang hilang:",
      promptSentence: "What is your telephone _____?",
      targetWord: "number",
      explanation: "Audio lengkap: 'What is your telephone number?'. Kata yang hilang adalah 'number'.",
    },
  ],

  writing: [
    {
      type: "Sentence Transformation",
      instruction: "Ubah kalimat positif berikut menjadi bentuk negatif:",
      prompt: "Mark works in an office downtown.",
      hint: "Gunakan 'does not' atau 'doesn't' sebelum kata kerja.",
      targetAnswers: ["Mark doesn't work in an office downtown.", "Mark does not work in an office downtown."],
      explanation: "Dalam present simple, subjek orang ketiga tunggal menggunakan 'doesn't + base verb'.",
    },
    {
      type: "Sentence Transformation",
      instruction: "Ubah kalimat berikut ke bentuk Simple Past:",
      prompt: "They go to the beach on Sundays.",
      hint: "Bentuk lampau dari 'go' adalah 'went'.",
      targetAnswers: ["They went to the beach on Sunday.", "They went to the beach."],
      explanation: "'Go' adalah kata kerja tidak beraturan yang berubah menjadi 'went' di waktu lampau.",
    },
    {
      type: "Question Construction",
      instruction: "Buat kalimat tanya dari kata-kata berikut:",
      prompt: "(you / like / Italian food)",
      hint: "Awali dengan 'Do'.",
      targetAnswers: ["Do you like Italian food?", "Do you like Italian food"],
      explanation: "Pola pertanyaan present simple: Do + you + like + objek?",
    },
    {
      type: "Sentence Correction",
      instruction: "Perbaiki kesalahan tata bahasa dalam kalimat ini:",
      prompt: "She don't have any brothers or sisters.",
      hint: "Subjek 'she' harus dipasangkan dengan 'doesn't'.",
      targetAnswers: ["She doesn't have any brothers or sisters.", "She does not have any brothers or sisters."],
      explanation: "'She' memerlukan auxiliary 'doesn't', bukan 'don't'.",
    },
    {
      type: "Sentence Completion",
      instruction: "Lengkapi kalimat dengan bentuk present continuous dari kata kerja 'cook':",
      prompt: "Right now, my mother _____ dinner in the kitchen.",
      hint: "Gunakan 'is' + verb-ing.",
      targetAnswers: ["is cooking", "My mother is cooking dinner in the kitchen."],
      explanation: "Present continuous untuk subjek tunggal menggunakan 'is + verb-ing'.",
    },
    {
      type: "Word Ordering",
      instruction: "Susun kata-kata ini menjadi kalimat yang benar:",
      prompt: "never / late / He / is / for / school",
      hint: "Kata keterangan frekuensi 'never' diletakkan setelah to be 'is'.",
      targetAnswers: ["He is never late for school.", "He is never late for school"],
      explanation: "Adverb of frequency diletakkan setelah to be: He is never late for school.",
    },
    {
      type: "Sentence Transformation",
      instruction: "Ubah kalimat ini menjadi bentuk jamak:",
      prompt: "This child is playing in the park.",
      hint: "'This' menjadi 'These', 'child' menjadi 'children', 'is' menjadi 'are'.",
      targetAnswers: ["These children are playing in the park.", "These children are playing in the park"],
      explanation: "Bentuk jamak dari 'this child is' adalah 'these children are'.",
    },
    {
      type: "Comparative Construction",
      instruction: "Bandingkan dua hal ini menggunakan kata sifat 'tall':",
      prompt: "Alex (180 cm) / Leo (170 cm)",
      hint: "Gunakan 'taller than'.",
      targetAnswers: ["Alex is taller than Leo.", "Alex is taller than Leo"],
      explanation: "Comparative untuk kata sifat satu suku kata menambahkan akhiran -er: taller than.",
    },
    {
      type: "Preposition Usage",
      instruction: "Lengkapi kalimat dengan preposisi waktu yang tepat:",
      prompt: "Our English lesson begins _____ 9 o'clock in the morning.",
      hint: "Gunakan 'at' untuk waktu jam tertentu.",
      targetAnswers: ["at", "Our English lesson begins at 9 o'clock in the morning."],
      explanation: "Preposisi 'at' digunakan untuk penunjuk jam yang spesifik.",
    },
    {
      type: "Modals Construction",
      instruction: "Tuliskan kalimat sopan meminta segelas air menggunakan 'Can I':",
      prompt: "Ask politely for a glass of water.",
      hint: "Can I have a glass of water, please?",
      targetAnswers: ["Can I have a glass of water, please?", "Can I have a glass of water please?"],
      explanation: "Struktur standar permintaan sopan: Can I have + objek + please?",
    },
  ],

  speaking: [
    {
      category: "Personal Introduction",
      instruction: "Ucapkan perkenalan diri singkat secara jelas:",
      prompt: "Hello, my name is Alex and I am from Indonesia. I work as an accountant.",
      sampleAnswer: "Hello, my name is Alex and I am from Indonesia. I work as an accountant.",
      phonetic: "/həˈləʊ maɪ neɪm ɪz ˈæleks ənd aɪ æm frəm ˌɪndəˈniːʒə/",
      keywords: ["name", "from", "work"],
    },
    {
      category: "Daily Routine",
      instruction: "Deskripsikan rutinitas pagi harimu dengan kalimat berikut:",
      prompt: "Every morning, I wake up at six and drink a hot cup of tea.",
      sampleAnswer: "Every morning, I wake up at six and drink a hot cup of tea.",
      phonetic: "/ˈevri ˈmɔːnɪŋ aɪ weɪk ʌp ət sɪks ənd drɪŋk ə hɒt kʌp əv tiː/",
      keywords: ["morning", "wake", "drink"],
    },
    {
      category: "Directions",
      instruction: "Ucapkan pertanyaan menanyakan arah ke stasiun terdekat:",
      prompt: "Excuse me, could you tell me how to get to the nearest bus station?",
      sampleAnswer: "Excuse me, could you tell me how to get to the nearest bus station?",
      phonetic: "/ɪkˈskjuːz miː kʊd juː tel miː haʊ tə get tə ðə ˈnɪərɪst bʌs ˈsteɪʃn/",
      keywords: ["excuse", "station", "nearest"],
    },
    {
      category: "Shopping & Price",
      instruction: "Ucapkan kalimat menanyakan harga pakaian di toko:",
      prompt: "How much does this black jacket cost, and do you have it in medium?",
      sampleAnswer: "How much does this black jacket cost, and do you have it in medium?",
      phonetic: "/haʊ mʌtʃ dʌz ðɪs blæk ˈdʒækɪt kɒst/",
      keywords: ["cost", "jacket", "medium"],
    },
    {
      category: "Hobbies & Free Time",
      instruction: "Ucapkan kalimat yang menceritakan kegemaranmu di akhir pekan:",
      prompt: "On weekends, I enjoy playing badminton with my friends in the park.",
      sampleAnswer: "On weekends, I enjoy playing badminton with my friends in the park.",
      phonetic: "/ɒn ˈwiːkendz aɪ ɪnˈdʒɔɪ ˈpleɪɪŋ ˈbædmɪntən wɪð maɪ frendz/",
      keywords: ["weekends", "enjoy", "playing"],
    },
    {
      category: "Ordering Food",
      instruction: "Ucapkan pesanan makanan di restoran dengan santun:",
      prompt: "I would like to order a chicken salad and a bottle of mineral water.",
      sampleAnswer: "I would like to order a chicken salad and a bottle of mineral water.",
      phonetic: "/aɪ wʊd laɪk tə ˈɔːdə ə ˈtʃɪkɪn ˈsæləd/",
      keywords: ["would", "order", "salad"],
    },
    {
      category: "Describing People",
      instruction: "Ucapkan kalimat mendeskripsikan ciri fisik seseorang:",
      prompt: "My sister is tall with long brown hair and brown eyes.",
      sampleAnswer: "My sister is tall with long brown hair and brown eyes.",
      phonetic: "/maɪ ˈsɪstə ɪz tɔːl wɪð lɒŋ braʊn heə/",
      keywords: ["sister", "tall", "hair"],
    },
    {
      category: "Travel & Holidays",
      instruction: "Ucapkan kalimat menceritakan liburan terakhirmu:",
      prompt: "Last summer, our family traveled to Bali and stayed near the beach.",
      sampleAnswer: "Last summer, our family traveled to Bali and stayed near the beach.",
      phonetic: "/lɑːst ˈsʌmə ˈaʊə ˈfæməli ˈtrævld tə ˈbɑːli/",
      keywords: ["summer", "traveled", "beach"],
    },
    {
      category: "Weather & Climate",
      instruction: "Ucapkan kalimat mendeskripsikan cuaca hari ini:",
      prompt: "It is quite sunny today, but the forecast says it might rain later.",
      sampleAnswer: "It is quite sunny today, but the forecast says it might rain later.",
      phonetic: "/ɪt ɪz kwaɪt ˈsʌni təˈdeɪ/",
      keywords: ["sunny", "forecast", "rain"],
    },
    {
      category: "Home & Rooms",
      instruction: "Ucapkan deskripsi tentang ruangan favoritmu di rumah:",
      prompt: "My bedroom is my favorite room because it is quiet and comfortable.",
      sampleAnswer: "My bedroom is my favorite room because it is quiet and comfortable.",
      phonetic: "/maɪ ˈbedruːm ɪz maɪ ˈfeɪvərɪt ruːm/",
      keywords: ["bedroom", "quiet", "comfortable"],
    },
    {
      category: "Health & Feeling",
      instruction: "Ucapkan kalimat menyampaikan keluhan kesehatan ringan:",
      prompt: "I have a slight headache today, so I think I will rest early tonight.",
      sampleAnswer: "I have a slight headache today, so I think I will rest early tonight.",
      phonetic: "/aɪ hæv ə slaɪt ˈhedeɪk təˈdeɪ/",
      keywords: ["headache", "rest", "tonight"],
    },
    {
      category: "Past Events",
      instruction: "Ucapkan kalimat menceritakan apa yang kamu lakukan kemarin:",
      prompt: "Yesterday, I cooked lunch and watched a movie with my brother.",
      sampleAnswer: "Yesterday, I cooked lunch and watched a movie with my brother.",
      phonetic: "/ˈjestədeɪ aɪ kʊkt lʌntʃ ənd wɒtʃt ə ˈmuːvi/",
      keywords: ["yesterday", "cooked", "watched"],
    },
    {
      category: "Future Plans",
      instruction: "Ucapkan kalimat mengenai rencanamu besok pagi:",
      prompt: "Tomorrow morning, I am meeting my colleague at the coffee shop.",
      sampleAnswer: "Tomorrow morning, I am meeting my colleague at the coffee shop.",
      phonetic: "/təˈmɒrəʊ ˈmɔːnɪŋ aɪ æm ˈmiːtɪŋ maɪ ˈkɒliːɡ/",
      keywords: ["tomorrow", "meeting", "colleague"],
    },
    {
      category: "Likes & Dislikes",
      instruction: "Ucapkan kalimat yang membandingkan hal yang kamu suka dan tidak suka:",
      prompt: "I really love spicy food, but I do not like sugary drinks.",
      sampleAnswer: "I really love spicy food, but I do not like sugary drinks.",
      phonetic: "/aɪ ˈrɪəli lʌv ˈspaɪsi fuːd/",
      keywords: ["love", "spicy", "drinks"],
    },
    {
      category: "Polite Request",
      instruction: "Ucapkan permintaan izin meminjam sesuatu secara sopan:",
      prompt: "Could you please lend me your pen for a few minutes?",
      sampleAnswer: "Could you please lend me your pen for a few minutes?",
      phonetic: "/kʊd juː pliːz lend miː jɔː pen/",
      keywords: ["could", "lend", "minutes"],
    },
  ],
};
