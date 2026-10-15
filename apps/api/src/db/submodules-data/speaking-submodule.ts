export const speakingSubModule = {
  skillType: "speaking",
  title: "Pronunciation & Interactive Speaking Lab",
  orderIndex: 4,
  sections: [
    {
      sectionType: "theory",
      title: "Pronunciation & Intonation Guide",
      orderIndex: 1,
      content: {
        rules: [
          {
            rule: "Rising vs. Falling Intonation (Pitch Movement)",
            explanation: "Use rising pitch at the end of Yes/No questions ('Are you from Spain? ↗'), and falling pitch for Wh-questions ('Where are you from? ↘') and statements.",
            example: "Are you Japanese? ↗ | I am from Australia. ↘"
          },
          {
            rule: "Syllable Stress",
            explanation: "Pay attention to stress shifts: 'JA-pan' (stress on first syllable) vs. 'ja-pa-NESE' (stress on third syllable).",
            example: "JA-pan vs ja-pa-NESE"
          },
          {
            rule: "Voiced Dental Fricative /ð/ Sound",
            explanation: "Place the tip of your tongue between your upper and lower teeth when pronouncing 'they', 'this', 'that', 'there'.",
            example: "They are from Melbourne."
          }
        ],
        summary: "Practice vocal articulation, pitch intonation, and rhythm before practicing real-time with AI Tutor Mr. Khoirul.",
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
      title: "Speaking Practice & AI Roleplay (Speaking Lab - 5 Drills)",
      orderIndex: 2,
      content: {
        drills: [
          {
            id: "drill-spk-1",
            targetText: "Hello! My name is Alex and I am from Indonesia.",
            focus: "Natural greeting opening & pronunciation of 'from'",
            hint: "Speak in a relaxed tone with falling declarative intonation at the end."
          },
          {
            id: "drill-spk-2",
            targetText: "Are you from Spain or Italy?",
            focus: "Contrasting intonation on choice questions (rising then falling)",
            hint: "Raise pitch on 'Spain', lower pitch on 'Italy'."
          },
          {
            id: "drill-spk-3",
            targetText: "They are my close friends from Melbourne, Australia.",
            focus: "Pronunciation of voiced /ð/ in 'They' and sentence rhythm",
            hint: "Place tongue between teeth when saying 'They'."
          },
          {
            id: "drill-spk-4",
            targetText: "Nice to meet you! Where are you from?",
            focus: "Natural falling Wh-question intonation",
            hint: "Say 'Where are you from' with emphasis on 'Where' and 'from'."
          },
          {
            id: "drill-spk-5",
            targetText: "We are proud students in this international English class.",
            focus: "Pronunciation of 'international' and sentence flow",
            hint: "Connect words smoothly without awkward pauses."
          }
        ],
        roleplay: {
          context: "You are in an international student lounge in London. AI Tutor Mr. Khoirul greets you to introduce himself.",
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
          scenario: "Give a 30-45 second spoken introduction: state your name, country & home city, nationality, and why you want to learn English!"
        }
      },
    },
  ],
};
