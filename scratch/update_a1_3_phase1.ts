import fs from "fs";
import path from "path";

// Data mapping for Phase 1 enhancements on A1.3 (IMPL-01, IMPL-02, IMPL-03)
interface ModuleEnhancement {
  id: string;
  theory: {
    summary: string;
    rules: Array<{ pattern: string; meaning: string; example: string }>;
    commonTrap: {
      trapTitle: string;
      explanation: string;
      wrong: string;
      correct: string;
    };
  };
  roleplay: {
    context: string;
    roles: string[];
    defaultUserRole: string;
    turns: Array<{
      speaker: string;
      text: string;
      translation: string;
    }>;
  };
}

const enhancements: Record<string, ModuleEnhancement> = {
  "A1-M27": {
    id: "A1-M27",
    theory: {
      summary: "Present Continuous digunakan untuk menyatakan kegiatan yang sedang berlangsung tepat saat kita berbicara atau situasi sementara di masa sekarang.",
      rules: [
        { pattern: "I + am + Verb-ing", meaning: "Saya sedang...", example: "I am studying English right now." },
        { pattern: "He / She / It + is + Verb-ing", meaning: "Dia / Benda sedang...", example: "She is cooking dinner in the kitchen." },
        { pattern: "You / We / They + are + Verb-ing", meaning: "Kamu / Kita / Mereka sedang...", example: "They are waiting for the bus outside." },
        { pattern: "Negasi & Tanya: is/are not & Am/Is/Are + Subject + Verb-ing?", meaning: "Bentuk negatif & tanya", example: "He is not sleeping. Are you listening to me?" }
      ],
      commonTrap: {
        trapTitle: "Jebakan Fatal: Menghilangkan To Be Sebelum Verb-ing",
        explanation: "Bahasa Indonesia tidak mengenal kata kerja bantu 'to be', sehingga banyak pemula langsung menerjemahkan 'Saya makan' menjadi 'I eating'. Ingat: Verb-ing TIDAK BISA berdiri sendiri tanpa am/is/are.",
        wrong: "I studying now. / She cooking dinner.",
        correct: "I am studying now. / She is cooking dinner."
      }
    },
    roleplay: {
      context: "Kamu sedang santai di sebuah kafe favoritmu saat Mr. Khoirul menghubungimu lewat panggilan video.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Hello! Are you busy right now? What are you doing?", translation: "Halo! Apakah kamu sedang sibuk saat ini? Apa yang sedang kamu lakukan?" },
        { speaker: "You", text: "Hi Mr. Khoirul! I am not busy. I am having a cup of coffee at a cafe.", translation: "Hai Mr. Khoirul! Saya tidak sibuk. Saya sedang menikmati secangkir kopi di sebuah kafe." },
        { speaker: "Mr. Khoirul", text: "That sounds relaxing! Is anyone with you, or are you sitting alone?", translation: "Terdengar santai sekali! Apakah ada yang menemanimu, atau kamu sedang duduk sendirian?" },
        { speaker: "You", text: "I am sitting alone, and I am reading an English article on my phone.", translation: "Saya sedang duduk sendirian, dan saya sedang membaca artikel bahasa Inggris di ponsel saya." }
      ]
    }
  },
  "A1-M28": {
    id: "A1-M28",
    theory: {
      summary: "Present Simple digunakan untuk kebiasaan, jadwal, dan fakta umum (every day, always). Sedangkan Present Continuous digunakan untuk aksi yang sedang berlangsung saat ini atau sementara (now, at the moment, this week).",
      rules: [
        { pattern: "Present Simple (Rutinitas / Fakta)", meaning: "Aksi berulang atau permanen", example: "I drink coffee every morning. He works in an office." },
        { pattern: "Present Continuous (Sedang Terjadi)", meaning: "Aksi sementara saat ini", example: "Look! I am drinking tea right now. He is working from home today." },
        { pattern: "Time Signals (Penanda Waktu)", meaning: "Kata kunci penentu tenses", example: "Always, usually vs Now, at the moment, right now." }
      ],
      commonTrap: {
        trapTitle: "Jebakan: Menggunakan Continuous untuk Fakta Umum atau Rutinitas",
        explanation: "Jangan gunakan Verb-ing untuk fakta permanen atau kebiasaan sehari-hari. 'I am living in Jakarta' menyiratkan tinggal sementara, sedangkan 'I live in Jakarta' menyatakan tempat tinggal tetap.",
        wrong: "I am always drinking coffee every morning. / The sun is rising in the east.",
        correct: "I always drink coffee every morning. / The sun rises in the east."
      }
    },
    roleplay: {
      context: "Mr. Khoirul mengobrol santai denganmu tentang perbedaan rutinitas kerjamu vs apa yang sedang kamu kerjakan minggu ini.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "What do you usually do on weekdays, and what are you working on this week?", translation: "Apa yang biasanya kamu lakukan di hari kerja, dan apa yang sedang kamu kerjakan minggu ini?" },
        { speaker: "You", text: "I usually go to the office by train, but this week I am working from home.", translation: "Saya biasanya pergi ke kantor naik kereta, tetapi minggu ini saya sedang bekerja dari rumah." },
        { speaker: "Mr. Khoirul", text: "Interesting! Do you enjoy working from home, or do you miss your colleagues?", translation: "Menarik! Apakah kamu menikmati bekerja dari rumah, atau kamu rindu rekan-rekan kerjamu?" },
        { speaker: "You", text: "I enjoy it because I save time, but I am meeting my team online every morning.", translation: "Saya menikmatinya karena menghemat waktu, tetapi saya sedang bertemu tim saya secara online setiap pagi." }
      ]
    }
  },
  "A1-M29": {
    id: "A1-M29",
    theory: {
      summary: "'Be Going To' digunakan untuk mengungkapkan rencana masa depan yang sudah diniatkan atau bukti nyata yang terlihat di depan mata.",
      rules: [
        { pattern: "Subject + am/is/are + going to + Verb 1", meaning: "Rencana / Niat pasti", example: "I am going to buy a new laptop next week." },
        { pattern: "Negative: am/is/are + not + going to + Verb 1", meaning: "Bukan rencana / Tidak berniat", example: "She is not going to attend the party tonight." },
        { pattern: "Question: Am/Is/Are + Subject + going to + Verb 1?", meaning: "Menanyakan rencana", example: "Are you going to travel to Bali this holiday?" },
        { pattern: "Prediksi Berdasarkan Bukti", meaning: "Tanda nyata di depan mata", example: "Look at those dark clouds! It is going to rain." }
      ],
      commonTrap: {
        trapTitle: "Jebakan: Mengira 'Going To' Selalu Berarti Pergi ke Tempat Fisik",
        explanation: "Banyak siswa mengira 'going to' selalu berarti pergi jalan-jalan. 'Be going to + Verb 1' adalah satu kesatuan struktur penunjuk rencana masa depan (akan), diikuti kata kerja dasar tanpa 'to' ganda.",
        wrong: "I am going to to buy a car. / She going to cook dinner.",
        correct: "I am going to buy a car. / She is going to cook dinner."
      }
    },
    roleplay: {
      context: "Kamu dan Mr. Khoirul membicarakan persiapan dan rencanamu menyambut akhir pekan panjang.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "The long weekend is coming soon! What are you going to do?", translation: "Akhir pekan panjang sebentar lagi tiba! Apa yang akan kamu lakukan?" },
        { speaker: "You", text: "I am going to visit my grandparents in Bandung with my family.", translation: "Saya akan mengunjungi kakek-nenek saya di Bandung bersama keluarga saya." },
        { speaker: "Mr. Khoirul", text: "That sounds wonderful! How long are you going to stay there?", translation: "Kedengarannya menyenangkan! Berapa lama kamu akan tinggal di sana?" },
        { speaker: "You", text: "We are going to stay for three days, and we are going to explore local culinary spots.", translation: "Kami akan tinggal selama tiga hari, dan kami akan menjelajahi tempat-tempat kuliner lokal." }
      ]
    }
  },
  "A1-M30": {
    id: "A1-M30",
    theory: {
      summary: "'Will' digunakan untuk keputusan spontan yang dibuat saat berbicara, tawaran bantuan, janji, dan prediksi umum tanpa bukti langsung.",
      rules: [
        { pattern: "Subject + will + Verb 1 (Singkatan: 'll)", meaning: "Keputusan spontan / Janji", example: "I am hungry. I will order some food right now." },
        { pattern: "Negative: will not = won't + Verb 1", meaning: "Menolak / Tidak akan", example: "Don't worry, I won't tell anyone your secret." },
        { pattern: "Tawaran Bantuan: I will help you...", meaning: "Menawarkan solusi seketika", example: "That bag looks heavy. I'll carry it for you." },
        { pattern: "Prediksi Opini: I think + Subject + will...", meaning: "Prediksi berdasarkan perkiraan", example: "I think the weather will be sunny tomorrow." }
      ],
      commonTrap: {
        trapTitle: "Jebakan: Menggunakan 'Will' untuk Rencana Matang yang Sudah Dijadwalkan",
        explanation: "Gunakan 'will' saat keputusan baru saja dibuat seketika saat berbicara. Jika tiket sudah dibeli dan tanggal sudah pasti, gunakan 'be going to' atau Present Continuous.",
        wrong: "I will to help you. / She wills come tomorrow.",
        correct: "I will help you. / She will come tomorrow."
      }
    },
    roleplay: {
      context: "Mr. Khoirul sedang kerepotan mempersiapkan materi kelas dan kamu menawarkan bantuan secara spontan.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Oh no, my hands are full with these books and the projector is disconnected!", translation: "Aduh, tanganku penuh membawa buku-buku ini dan kabel proyektor terlepas!" },
        { speaker: "You", text: "Don't worry, Mr. Khoirul! I will help you carry the books and plug in the cable.", translation: "Jangan khawatir, Mr. Khoirul! Saya akan membantu Anda membawa buku-buku itu dan menyambungkan kabelnya." },
        { speaker: "Mr. Khoirul", text: "Thank you so much! Will you also help me hand out the worksheets to the students?", translation: "Terima kasih banyak! Maukah kamu juga membantuku membagikan lembar kerja kepada para siswa?" },
        { speaker: "You", text: "Of course! I will distribute them right away before the lesson begins.", translation: "Tentu saja! Saya akan membagikannya sekarang juga sebelum pelajaran dimulai." }
      ]
    }
  },
  "A1-M31": {
    id: "A1-M31",
    theory: {
      summary: "Comparative Adjectives digunakan untuk membandingkan dua orang, tempat, atau benda. Polanya tergantung jumlah suku kata kata sifat (syllables).",
      rules: [
        { pattern: "1 Suku Kata: Adj + -er + than", meaning: "Lebih ... daripada", example: "Jakarta is bigger and hotter than Bandung." },
        { pattern: "2+ Suku Kata: more + Adj + than", meaning: "Lebih ... daripada (kata panjang)", example: "This book is more interesting than the movie." },
        { pattern: "Akhiran -y: ganti 'y' jadi -ier + than", meaning: "Lebih mudah/senang", example: "Learning English is easier than learning Arabic." },
        { pattern: "Bentuk Khusus (Irregular)", meaning: "Perubahan kata tidak beraturan", example: "Good -> better than. Bad -> worse than. Far -> farther than." }
      ],
      commonTrap: {
        trapTitle: "Jebakan Dobel: 'More Bigger' atau 'More Faster'",
        explanation: "Banyak orang Indonesia menggabungkan 'more' dengan akhiran '-er'. Cukup pilih salah satu: jika kata pendek tambahkan '-er', jika kata panjang gunakan 'more'.",
        wrong: "This phone is more cheaper. / He is more taller than me.",
        correct: "This phone is cheaper. / He is taller than me."
      }
    },
    roleplay: {
      context: "Kamu sedang mempertimbangkan dua pilihan laptop untuk belajar dan berdiskusi dengan Mr. Khoirul.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Which laptop are you going to choose for your online study?", translation: "Laptop mana yang akan kamu pilih untuk belajar online-mu?" },
        { speaker: "You", text: "I like the silver laptop because it is lighter and faster than the black one.", translation: "Saya suka laptop perak karena lebih ringan dan lebih cepat daripada yang hitam." },
        { speaker: "Mr. Khoirul", text: "Yes, but isn't the black laptop much cheaper and more durable?", translation: "Ya, tetapi bukankah laptop hitam jauh lebih murah dan lebih tahan lama?" },
        { speaker: "You", text: "That is true, but the screen quality on the silver one is much better for my eyes.", translation: "Itu benar, tetapi kualitas layar di laptop perak jauh lebih baik untuk mata saya." }
      ]
    }
  },
  "A1-M32": {
    id: "A1-M32",
    theory: {
      summary: "Superlative Adjectives digunakan untuk menyatakan tingkatan 'paling' atau 'ter-' di antara tiga benda atau lebih dalam satu kelompok.",
      rules: [
        { pattern: "1 Suku Kata: the + Adj + -est", meaning: "Paling / Ter- (kata pendek)", example: "Mount Everest is the highest mountain in the world." },
        { pattern: "2+ Suku Kata: the most + Adj", meaning: "Paling / Ter- (kata panjang)", example: "This is the most expensive watch in the store." },
        { pattern: "Akhiran -y: the + Adj + -iest", meaning: "Paling mudah / bahagia", example: "Friday is the happiest day of the week for me." },
        { pattern: "Bentuk Khusus (Irregular)", meaning: "Paling baik / buruk", example: "The best (terbaik), the worst (terburuk), the farthest (terjauh)." }
      ],
      commonTrap: {
        trapTitle: "Jebakan Menghilangkan 'The' pada Bentuk Superlatif",
        explanation: "Bentuk superlatif menunjukkan sesuatu yang unik/spesifik di puncaknya, sehingga kata sandang 'the' WAJIB disertakan sebelum adjective.",
        wrong: "She is best student in class. / It was most beautiful view.",
        correct: "She is the best student in the class. / It was the most beautiful view."
      }
    },
    roleplay: {
      context: "Mr. Khoirul bertanya tentang destinasi wisata terbaik dan paling berkesan yang pernah kamu kunjungi di Indonesia.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Out of all the places you have visited in Indonesia, which one is the best?", translation: "Dari semua tempat yang pernah kamu kunjungi di Indonesia, mana yang terbaik?" },
        { speaker: "You", text: "In my opinion, Labuan Bajo is the most stunning place I have ever seen.", translation: "Menurut saya, Labuan Bajo adalah tempat paling memukau yang pernah saya lihat." },
        { speaker: "Mr. Khoirul", text: "What made it the most memorable experience for you?", translation: "Apa yang menjadikannya pengalaman paling berkesan untukmu?" },
        { speaker: "You", text: "The sunset on Padar Island was the most breathtaking view, and the water was the clearest.", translation: "Matahari terbenam di Pulau Padar adalah pemandangan paling menakjubkan, dan airnya paling jernih." }
      ]
    }
  },
  "A1-M33": {
    id: "A1-M33",
    theory: {
      summary: "'Should' dan 'Shouldn't' digunakan untuk memberikan nasihat, saran ramah, atau rekomendasi tentang hal yang baik atau tidak baik dilakukan.",
      rules: [
        { pattern: "Subject + should + Verb 1 murni", meaning: "Sebaiknya / Harusnya melakukan...", example: "You look tired. You should take a break." },
        { pattern: "Subject + shouldn't + Verb 1 murni", meaning: "Sebaiknya tidak / Jangan...", example: "You shouldn't drink cold water when you have a sore throat." },
        { pattern: "Should + Subject + Verb 1?", meaning: "Meminta saran / opini", example: "What should I wear to the job interview?" },
        { pattern: "Aturan Emas: Tanpa 'to'!", meaning: "Setelah modal, kata kerja dasar murni", example: "You should go (BUKAN: You should to go)." }
      ],
      commonTrap: {
        trapTitle: "Jebakan Menambahkan 'To' Setelah Modal Should",
        explanation: "Banyak siswa terbiasa dengan pola bahasa Indonesia 'kamu harus untuk...', lalu menambahkan 'to' setelah modal. Modal auxiliary WAJIB langsung diikuti Verb 1 telanjang tanpa 'to'.",
        wrong: "You should to see a doctor. / We shouldn't to eat too late.",
        correct: "You should see a doctor. / We shouldn't eat too late."
      }
    },
    roleplay: {
      context: "Mr. Khoirul meminta saran kepadamu karena merasa lelah dan sering mengantuk saat bekerja.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "I have been feeling exhausted recently and I often feel sleepy in the afternoon. What should I do?", translation: "Saya merasa sangat lelah akhir-akhir ini dan sering mengantuk di sore hari. Apa yang sebaiknya saya lakukan?" },
        { speaker: "You", text: "You should sleep at least seven hours at night and drink plenty of water.", translation: "Anda sebaiknya tidur setidaknya tujuh jam di malam hari dan banyak minum air putih." },
        { speaker: "Mr. Khoirul", text: "Should I drink more coffee to stay awake during the day?", translation: "Haruskah saya minum lebih banyak kopi agar tetap terjaga di siang hari?" },
        { speaker: "You", text: "No, you shouldn't drink too much coffee. You should take a short walk outside instead.", translation: "Tidak, Anda sebaiknya tidak minum terlalu banyak kopi. Anda sebaiknya jalan-jalan santai sebentar di luar." }
      ]
    }
  },
  "A1-M34": {
    id: "A1-M34",
    theory: {
      summary: "'Must' dan 'Have to' menyatakan kewajiban/keharusan. 'Mustn't' menyatakan larangan keras (dilarang). Sedangkan 'Don't have to' menyatakan tidak perlu/tidak wajib (opsional).",
      rules: [
        { pattern: "Must / Have to + Verb 1", meaning: "Harus / Wajib dilakukan", example: "All drivers must stop at the red light. I have to wake up early." },
        { pattern: "Must not (Mustn't) + Verb 1", meaning: "DILARANG KERAS (Larangan hukum/aturan)", example: "You mustn't smoke in the hospital." },
        { pattern: "Don't / Doesn't have to + Verb 1", meaning: "TIDAK PERLU / Boleh dilakukan, boleh tidak", example: "Tomorrow is Sunday, so I don't have to go to work." },
        { pattern: "He / She / It + has to + Verb 1", meaning: "Bentuk orang ketiga tunggal", example: "She has to wear a uniform at school." }
      ],
      commonTrap: {
        trapTitle: "Jebakan Fatal: Mengira 'Don't have to' Artinya Dilarang",
        explanation: "'Don't have to' artinya TIDAK HARUS (opsional, jika dilakukan tidak apa-apa). Jika ingin melarang keras karena bahaya atau melanggar aturan, gunakan 'Must not' (Mustn't).",
        wrong: "You don't have to cross the red light. / Students don't have to cheat.",
        correct: "You mustn't run the red light. / Students mustn't cheat."
      }
    },
    roleplay: {
      context: "Kamu menjelaskan peraturan kantor atau tempat kursus barumu kepada Mr. Khoirul yang baru bergabung.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Welcome to the new branch! Could you explain the main office rules to me?", translation: "Selamat datang di cabang baru! Bisakah kamu menjelaskan peraturan utama kantor kepadaku?" },
        { speaker: "You", text: "Sure! We must tap our ID cards before eight o'clock every morning.", translation: "Tentu! Kita harus menempelkan kartu tanda pengenal sebelum jam delapan setiap pagi." },
        { speaker: "Mr. Khoirul", text: "Do we have to wear formal business suits every day?", translation: "Apakah kita harus memakai setelan jas formal setiap hari?" },
        { speaker: "You", text: "No, we don't have to wear suits on Fridays, but we mustn't wear sandals.", translation: "Tidak, kita tidak perlu memakai jas pada hari Jumat, tetapi kita dilarang memakai sandal." }
      ]
    }
  },
  "A1-M35": {
    id: "A1-M35",
    theory: {
      summary: "Phrasal Verb adalah kombinasi Kata Kerja (Verb) + Preposisi/Partikel (seperti on, off, up, out) yang menghasilkan makna baru yang berbeda dari kata aslinya.",
      rules: [
        { pattern: "Wake up / Get up", meaning: "Bangun / Beranjak dari tempat tidur", example: "I wake up at six, but I get up at six thirty." },
        { pattern: "Turn on / Turn off", meaning: "Menyalakan / Mematikan perangkat listrik", example: "Please turn on the light and turn off the TV." },
        { pattern: "Put on / Take off", meaning: "Mengenakan / Melepas pakaian atau sepatu", example: "Put on your jacket. Take off your shoes before entering." },
        { pattern: "Look for / Give up", meaning: "Mencari / Menyerah", example: "I am looking for my keys. Never give up on your dreams!" }
      ],
      commonTrap: {
        trapTitle: "Jebakan Menerjemahkan Phrasal Verb Kata demi Kata",
        explanation: "Jangan terjemahkan per kata secara harfiah ('turn on' bukan 'putar di atas'). Phrasal verb adalah satu kesatuan kosakata idiomatis yang memiliki arti khusus tersendiri.",
        wrong: "Please open the lamp. / Please close the air conditioner.",
        correct: "Please turn on the lamp. / Please turn off the air conditioner."
      }
    },
    roleplay: {
      context: "Kamu sedang bersiap-siap berangkat kerja bersama teman sekamarmu (Mr. Khoirul) di pagi hari.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Why are you looking under the sofa? Did you drop something?", translation: "Kenapa kamu mencari di bawah sofa? Apakah kamu menjatuhkan sesuatu?" },
        { speaker: "You", text: "Yes, I am looking for my house keys. I need to leave for work soon.", translation: "Ya, saya sedang mencari kunci rumah saya. Saya harus segera berangkat kerja." },
        { speaker: "Mr. Khoirul", text: "Here they are on the counter! Don't forget to turn off the air conditioner before you go.", translation: "Ini dia kuncinya di atas meja konter! Jangan lupa matikan AC sebelum kamu pergi." },
        { speaker: "You", text: "Thank you! I will turn it off and put on my jacket right now.", translation: "Terima kasih! Saya akan mematikannya dan memakai jaket saya sekarang juga." }
      ]
    }
  },
  "A1-M36": {
    id: "A1-M36",
    theory: {
      summary: "Kata penghubung (Conjunctions) menghubungkan dua klausa menjadi kalimat utuh. 'Because' menyatakan sebab, 'so' menyatakan akibat, 'but' menyatakan pertentangan sederhana, dan 'although' menyatakan kontras/konsesi.",
      rules: [
        { pattern: "Because (Menyatakan Alasan / Sebab)", meaning: "Karena...", example: "I study English every day because I want to work abroad." },
        { pattern: "So (Menyatakan Hasil / Akibat)", meaning: "Jadi / Sehingga...", example: "The weather was very bad, so we stayed at home." },
        { pattern: "But (Menyatakan Pertentangan)", meaning: "Tetapi...", example: "English grammar is challenging, but it is very interesting." },
        { pattern: "Although (Menyatakan Kontras)", meaning: "Meskipun / Walaupun...", example: "Although he was very tired, he finished his assignment." }
      ],
      commonTrap: {
        trapTitle: "Jebakan Menggabungkan 'Because' dan 'So' dalam Satu Kalimat",
        explanation: "Dalam bahasa Indonesia kita sering berkata 'Karena saya capek, jadi saya tidur'. Dalam bahasa Inggris, pilih SALAH SATU: gunakan 'Because...' ATAU '..., so...'. Jangan gunakan keduanya sekaligus!",
        wrong: "Because I was tired, so I went to bed early. / Because it rained, so I stayed home.",
        correct: "Because I was tired, I went to bed early. / It rained, so I stayed home."
      }
    },
    roleplay: {
      context: "Mr. Khoirul menanyakan alasan dan motivasimu belajar bahasa Inggris secara intensif.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "You have been studying very hard recently! Why do you love learning English so much?", translation: "Kamu belajar sangat giat akhir-akhir ini! Mengapa kamu begitu suka belajar bahasa Inggris?" },
        { speaker: "You", text: "I love learning English because it opens up great global career opportunities for me.", translation: "Saya suka belajar bahasa Inggris karena ini membuka peluang karier global yang luar biasa untuk saya." },
        { speaker: "Mr. Khoirul", text: "Isn't English pronunciation sometimes difficult for Indonesian speakers?", translation: "Bukankah pelafalan bahasa Inggris terkadang sulit bagi penutur bahasa Indonesia?" },
        { speaker: "You", text: "Although English pronunciation is tricky, I practice every day, so I feel much more confident now.", translation: "Meskipun pelafalan bahasa Inggris agak sulit, saya berlatih setiap hari, jadi saya merasa jauh lebih percaya diri sekarang." }
      ]
    }
  },
  "A1-M37": {
    id: "A1-M37",
    theory: {
      summary: "Kuasai etiket dan frasa sopan bahasa Inggris saat berada di kafe atau restoran: memesan makanan ('I would like...', 'Could I get...'), meminta bantuan ('Excuse me...'), dan meminta tagihan ('Could we have the bill, please?').",
      rules: [
        { pattern: "I would like (I'd like) + Noun / to + Verb", meaning: "Pola sopan: Saya ingin memesan...", example: "I would like a cup of hot cappuccino, please." },
        { pattern: "Could I get / Could I have + Noun, please?", meaning: "Bolehkah saya minta...", example: "Could I have a glass of water, please?" },
        { pattern: "Excuse me, could we have the bill / check, please?", meaning: "Meminta struk/tagihan pembayaran", example: "Excuse me, we are ready to pay. Could we have the bill?" },
        { pattern: "Do you take credit cards / digital payment?", meaning: "Menanyakan metode pembayaran", example: "Can I pay by card, or is it cash only?" }
      ],
      commonTrap: {
        trapTitle: "Jebakan Menggunakan 'I Want' Saat Memesan Makanan",
        explanation: "Banyak penutur Indonesia langsung menerjemahkan 'Saya mau nasi goreng' menjadi 'I want fried rice'. Dalam standar budaya internasional, 'I want' terdengar menuntut dan kurang sopan. Selalu gunakan 'I would like...' atau 'Could I have...'."
        ,
        wrong: "I want chicken and I want the bill now. / Give me water.",
        correct: "I would like the grilled chicken, please. / Could we have the bill, please?"
      }
    },
    roleplay: {
      context: "Kamu sedang makan malam di restoran dan Mr. Khoirul berperan sebagai pelayan restoran (waiter).",
      roles: ["Mr. Khoirul (Waiter)", "You (Guest)"],
      defaultUserRole: "You (Guest)",
      turns: [
        { speaker: "Mr. Khoirul (Waiter)", text: "Good evening! Welcome to our bistro. Are you ready to order, or would you like a few more minutes?", translation: "Selamat malam! Selamat datang di bistro kami. Apakah Anda siap memesan, atau butuh beberapa menit lagi?" },
        { speaker: "You (Guest)", text: "Good evening! I am ready to order. I would like the grilled chicken with roasted vegetables, please.", translation: "Selamat malam! Saya siap memesan. Saya ingin ayam panggang dengan sayuran panggang." },
        { speaker: "Mr. Khoirul (Waiter)", text: "Excellent choice! And what would you like to drink with your meal?", translation: "Pilihan yang sangat bagus! Dan apa yang ingin Anda minum untuk mendampingi makanan Anda?" },
        { speaker: "You (Guest)", text: "Could I have an iced lemon tea, please? And could we also get the bill together when finished?", translation: "Bisakah saya minta es lemon tea? Dan bisakah kami juga meminta tagihannya nanti setelah selesai?" }
      ]
    }
  },
  "A1-M38": {
    id: "A1-M38",
    theory: {
      summary: "Simulasi komprehensif mengintegrasikan seluruh materi Level A1: membuat rencana dengan 'going to', membandingkan opsi dengan 'comparatives/superlatives', menyatakan pendapat dengan 'conjunctions', dan membuat keputusan spontan dengan 'will'.",
      rules: [
        { pattern: "Membuat Rencana: We are going to + Verb 1", meaning: "Rencana perjalanan bersama", example: "We are going to visit Yogyakarta next month." },
        { pattern: "Membandingkan Pilihan: ...is cheaper/better than...", meaning: "Menimbang akomodasi & transportasi", example: "Traveling by train is more comfortable than by bus." },
        { pattern: "Mengambil Keputusan: I will book / I will check...", meaning: "Keputusan spontan saat diskusi", example: "Great idea! I will book the hotel tickets tonight." },
        { pattern: "Memberikan Alasan: ...because / although...", meaning: "Argumen pemilihan destinasi", example: "We chose the resort because it is close to the beach." }
      ],
      commonTrap: {
        trapTitle: "Jebakan Bingung Mengombinasikan Tenses dalam Diskusi Rencana",
        explanation: "Dalam percakapan nyata, kita menggunakan beberapa tenses sekaligus: fakta masa kini (Simple Present), rencana yang sudah disepakati (Going to), dan keputusan saat itu juga (Will). Jangan takut memadukannya secara natural.",
        wrong: "We will go because the hotel is more cheaper and yesterday I book it.",
        correct: "We are going to go by train because the ticket is cheaper, and I will book it now."
      }
    },
    roleplay: {
      context: "Kamu dan sahabatmu (Mr. Khoirul) sedang berdiskusi merencanakan liburan akhir tahun bersama.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Hey! Let's finalize our holiday plans for next month. Where should we go: Bali or Yogyakarta?", translation: "Hei! Mari kita tuntaskan rencana liburan kita bulan depan. Ke mana sebaiknya kita pergi: Bali atau Yogyakarta?" },
        { speaker: "You", text: "I think we should go to Yogyakarta because it is richer in culture and cheaper than Bali.", translation: "Menurutku kita sebaiknya ke Yogyakarta karena lebih kaya budaya dan lebih murah daripada Bali." },
        { speaker: "Mr. Khoirul", text: "Sounds wonderful! How are we going to get there, by plane or by executive train?", translation: "Kedengarannya menyenangkan! Bagaimana kita akan ke sana, naik pesawat atau kereta eksekutif?" },
        { speaker: "You", text: "We are going to take the train because the view is amazing, and I will reserve our tickets tonight.", translation: "Kita akan naik kereta karena pemandangannya menakjubkan, dan aku akan memesan tiket kita malam ini." }
      ]
    }
  },
  "A1-M39": {
    id: "A1-M39",
    theory: {
      summary: "Modul evaluasi kelulusan komprehensif tingkat akhir Level A1. Memvalidasi penguasaan seluruh aspek dasar: tenses (Present, Past, Future), kata ganti, modal verbs, perbandingan, dan kelancaran percakapan fungsional harian.",
      rules: [
        { pattern: "Present & Past Mastery: am/is/are, do/does, was/were", meaning: "Fondasi tenses dasar", example: "I am a student. Yesterday I was busy with my exam." },
        { pattern: "Continuous & Future: Verb-ing, going to, will", meaning: "Aksi dinamis & rencana masa depan", example: "Right now I am speaking English, and tomorrow I will graduate." },
        { pattern: "Modals & Comparisons: should, must, better, best", meaning: "Opini & evaluasi", example: "You must practice every day. This is the best method." },
        { pattern: "Syarat Kelulusan: Skor Minimal 75%", meaning: "Standar pembukaan Level A2", example: "Capai minimal 75% untuk memperoleh sertifikat kelulusan A1." }
      ],
      commonTrap: {
        trapTitle: "Jebakan Terburu-buru: Teliti Bentuk Kata Kerja & To Be",
        explanation: "Pada ujian kelulusan, kesalahan paling sering terjadi karena terburu-buru: lupa menambahkan To Be pada continuous tense, tertukar antara regular/irregular past verb, atau melupakan kata sandang 'the' pada superlative.",
        wrong: "I am study yesterday and tomorrow I go. / She is more taller.",
        correct: "I studied yesterday, I am practicing today, and I will travel tomorrow."
      }
    },
    roleplay: {
      context: "Wawancara ujian kelulusan berbicara Level A1 bersama Master Instructor Mr. Khoirul.",
      roles: ["Mr. Khoirul", "You"],
      defaultUserRole: "You",
      turns: [
        { speaker: "Mr. Khoirul", text: "Welcome to your Level A1 graduation interview! Can you tell me how your English has improved since module one?", translation: "Selamat datang di wawancara kelulusan Level A1! Bisakah kamu menceritakan bagaimana bahasa Inggrismu telah berkembang sejak modul satu?" },
        { speaker: "You", text: "Thank you, Mr. Khoirul! In the beginning I was very nervous, but now I can talk about my daily routines, my past experiences, and my future plans clearly.", translation: "Terima kasih, Mr. Khoirul! Awalnya saya sangat gugup, tetapi sekarang saya bisa berbicara tentang rutinitas harian, pengalaman masa lalu, dan rencana masa depan saya dengan jelas." },
        { speaker: "Mr. Khoirul", text: "That is fantastic progress! What are you going to do to keep practicing when you start Level A2?", translation: "Itu kemajuan yang luar biasa! Apa yang akan kamu lakukan untuk terus berlatih saat kamu memulai Level A2?" },
        { speaker: "You", text: "I am going to practice speaking for fifteen minutes every day, and I will never give up on improving my fluency.", translation: "Saya akan berlatih berbicara selama lima belas menit setiap hari, dan saya tidak akan pernah menyerah untuk meningkatkan kelancaran saya." }
      ]
    }
  }
};

export function updateA1_3Modules() {
  const filePath = path.resolve("data/level_a1_3_modules.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(rawData);

  let updatedCount = 0;

  for (const mod of data.modules) {
    const patch = enhancements[mod.id];
    if (!patch) continue;

    // 1. Update theory section
    const theorySection = mod.sections.find((s: any) => s.sectionType === "theory");
    if (theorySection) {
      theorySection.content = {
        summary: patch.theory.summary,
        rules: patch.theory.rules,
        commonTrap: patch.theory.commonTrap,
        // Backward-compatible fallback for commonMistakes
        commonMistakes: [
          {
            wrong: patch.theory.commonTrap.wrong,
            right: patch.theory.commonTrap.correct,
            note: patch.theory.commonTrap.explanation
          }
        ]
      };
    }

    // 2. Update roleplay in practice section
    const practiceSection = mod.sections.find((s: any) => s.sectionType === "practice");
    if (practiceSection && practiceSection.content) {
      practiceSection.content.roleplay = {
        context: patch.roleplay.context,
        roles: patch.roleplay.roles,
        defaultUserRole: patch.roleplay.defaultUserRole,
        turns: patch.roleplay.turns
      };
    }

    updatedCount++;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Successfully updated ${updatedCount} modules in data/level_a1_3_modules.json!`);
}

updateA1_3Modules();
