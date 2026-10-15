export const readingSubModule = {
  skillType: "reading",
  title: "Reading & Vocabulary Mastery",
  orderIndex: 1,
  sections: [
    {
      sectionType: "theory",
      title: "Concept & Vocabulary Understanding (Reading Theory)",
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
        summary: "Study the reading passage on introducing yourself, countries of origin, and using the verb 'to be' in an international community context.",
        rules: [
          {
            rule: "Singular & Plural Subjects",
            explanation: "Use 'am' with I, 'is' with he/she/it, and 'are' with you/we/they.",
            example: "I am from Australia. Kenji is from Japan. We are friends."
          },
          {
            rule: "Country vs. Nationality",
            explanation: "Use the country name after 'from' (from Australia). Use the nationality without 'from' (He is Australian).",
            example: "He is from Japan (Country) = He is Japanese (Nationality)."
          },
          {
            rule: "Contractions",
            explanation: "In casual English and everyday writing, 'to be' forms are typically contracted.",
            example: "I'm Liam. He's my flatmate. They're students."
          },
          {
            rule: "Negative Form",
            explanation: "Add 'not' after the 'to be' verb to express negation.",
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
      title: "Reading Comprehension Evaluation (Reading Quiz - 5 Questions)",
      orderIndex: 2,
      content: {
        questions: [
          {
            id: "A1.1-READ-Q1",
            question: "Where is Liam living right now according to the passage?",
            options: ["In Melbourne", "In London", "In Tokyo", "In Sydney"],
            answer: "In London",
            explanation: "Liam is from Melbourne, Australia, but he currently lives in London ('now I live in London')."
          },
          {
            id: "A1.1-READ-Q2",
            question: "What nationality is Kenji, Liam's flatmate?",
            options: ["Australian", "Japanese", "Spanish", "Canadian"],
            answer: "Japanese",
            explanation: "Kenji is from Tokyo, Japan, so his nationality is Japanese."
          },
          {
            id: "A1.1-READ-Q3",
            question: "What is Kenji's profession?",
            options: ["University student", "Graphic designer", "English teacher", "Hotel manager"],
            answer: "Graphic designer",
            explanation: "In paragraph two: 'Kenji is a graphic designer and I am a university student.'"
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
            explanation: "The passage states: 'because Kenji wants to practice his conversational skills'."
          },
          {
            id: "A1.1-READ-Q5",
            question: "Which form of 'to be' correctly completes: 'Liam and Kenji ___ flatmates in London'?",
            options: ["am", "is", "are", "be"],
            answer: "are",
            explanation: "The plural compound subject 'Liam and Kenji' (pronoun 'they') always takes 'are'."
          }
        ],
      },
    },
  ],
};
