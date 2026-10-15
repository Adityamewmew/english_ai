export const writingSubModule = {
  skillType: "writing",
  title: "Sentence Construction & Writing",
  orderIndex: 3,
  sections: [
    {
      sectionType: "theory",
      title: "Sentence Structure & Writing Mechanics",
      orderIndex: 1,
      content: {
        summary: "In this module, you will learn how to build complete and accurate English sentences: from the foundational formula Subject + Verb + Complement, applying capitalization rules, to writing your own personal profile.",
        blueprintItems: [
          {
            part: "Subject",
            role: "Subject (Actor / Topic)",
            examples: ["Liam", "I", "She", "They"],
            color: "border-sky-300 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200",
            tagColor: "bg-sky-200/70 text-sky-800 dark:bg-sky-800/60 dark:text-sky-200"
          },
          {
            part: "Verb ('to be')",
            role: "Linking Verb",
            examples: ["is", "am", "is", "are"],
            color: "border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200",
            tagColor: "bg-amber-200/70 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200"
          },
          {
            part: "Complement",
            role: "Complement (Origin, Status, Trait)",
            examples: ["from Melbourne.", "a student.", "Italian.", "close friends."],
            color: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200",
            tagColor: "bg-emerald-200/70 text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-200"
          }
        ],
        mechanicsRules: [
          {
            title: "Mandatory Capital Letters",
            rule: "Use capital letters for sentence starts, pronoun 'I', people names (Liam), countries (Indonesia), and nationalities (Spanish).",
            example: "I am from Jakarta and he is Japanese."
          },
          {
            title: "Terminal Punctuation (.)",
            rule: "Every statement sentence must end with a period (.) directly after the last word without space.",
            example: "She is 16 years old."
          },
          {
            title: "Subject-Verb Agreement",
            rule: "Ensure the form of 'to be' agrees with the subject: I am, He/She/It is, We/They are.",
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
      title: "Sentence Construction Lab (Writing Practice)",
      orderIndex: 2,
      content: {
        mechanicsChallenges: [
          {
            id: "sent-1",
            faultySentence: "she is italian. she is from italy.",
            targetSentence: "She is Italian. She is from Italy.",
            translation: "Dia orang Italia. Dia berasal dari Italia.",
            keyRule: "Capitalize the start of sentences ('She'), nationality ('Italian'), and country ('Italy').",
            requiredCapitals: ["She", "Italian", "Italy"]
          },
          {
            id: "sent-2",
            faultySentence: "i am from tokyo, japan.",
            targetSentence: "I am from Tokyo, Japan.",
            translation: "Saya berasal dari Tokyo, Jepang.",
            keyRule: "The pronoun 'I' is always capitalized. City 'Tokyo' and country 'Japan' must be capitalized.",
            requiredCapitals: ["I", "Tokyo", "Japan"]
          },
          {
            id: "sent-3",
            faultySentence: "marco isn't french. he is spanish.",
            targetSentence: "Marco isn't French. He is Spanish.",
            translation: "Marco bukan orang Prancis. Dia orang Spanyol.",
            keyRule: "Personal name ('Marco'), nationalities ('French', 'Spanish'), and sentence start ('He').",
            requiredCapitals: ["Marco", "French", "He", "Spanish"]
          },
          {
            id: "sent-4",
            faultySentence: "my teacher is mr. khoirul and he is indonesian.",
            targetSentence: "My teacher is Mr. Khoirul and he is Indonesian.",
            translation: "Guru saya adalah Pak Khoirul dan beliau berkebangsaan Indonesia.",
            keyRule: "Honorific ('Mr.'), proper name ('Khoirul'), and nationality ('Indonesian') must be capitalized.",
            requiredCapitals: ["My", "Mr.", "Khoirul", "Indonesian"]
          },
          {
            id: "sent-5",
            faultySentence: "we are students from london, the uk.",
            targetSentence: "We are students from London, the UK.",
            translation: "Kami adalah pelajar dari London, Inggris Raya.",
            keyRule: "Sentence start ('We'), city ('London'), and country acronym ('UK') must be capitalized.",
            requiredCapitals: ["We", "London", "UK"]
          }
        ],
        sentenceBuilderTargets: [
          {
            id: "b-1",
            category: "Affirmative & Origin",
            meaning: "Saya berasal dari Indonesia dan saya adalah seorang pelajar.",
            tokens: ["I", "am", "from", "Indonesia", "and", "I", "am", "a", "student."],
            fullSentence: "I am from Indonesia and I am a student."
          },
          {
            id: "b-2",
            category: "Negative & Contrast",
            meaning: "Dia bukan berasal dari Spanyol tetapi dari Italia.",
            tokens: ["She", "is", "not", "from", "Spain", "but", "from", "Italy."],
            fullSentence: "She is not from Spain but from Italy."
          },
          {
            id: "b-3",
            category: "Age & Residence",
            meaning: "Dia berasal dari Melbourne dan dia berusia 16 tahun.",
            tokens: ["He", "is", "from", "Melbourne", "and", "he", "is", "16", "years", "old."],
            fullSentence: "He is from Melbourne and he is 16 years old."
          },
          {
            id: "b-4",
            category: "Question & Nationality",
            meaning: "Dari mana kamu berasal dan apa kewarganegaraanmu?",
            tokens: ["Where", "are", "you", "from", "and", "what", "is", "your", "nationality?"],
            fullSentence: "Where are you from and what is your nationality?"
          },
          {
            id: "b-5",
            category: "Favourite Interests",
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
            title: "Challenge 1: Personal Introduction",
            badge: "Personal Bio",
            instruction: "Write 3-5 sentences introducing yourself in English: mention your name, age, city & country of origin, and your current status/profession.",
            example: "Hello! My name is Aditya. I am 16 years old. I am from Jakarta, Indonesia. I am a student.",
            placeholder: "Start writing here... (Hello! My name is...)",
            minWords: 10,
            xpReward: 30
          },
          {
            id: "ch-2",
            title: "Challenge 2: Classmate Profile",
            badge: "Third-Person Bio",
            instruction: "Write 3-5 sentences describing a classmate using third-person subjects (He is... / She is...): mention their name, nationality, country of origin, and age.",
            example: "This is my classmate. Her name is Marta. She is from Madrid, Spain. She is Spanish and she is 16 years old.",
            placeholder: "Start writing here... (This is my classmate. His/Her name is...)",
            minWords: 12,
            xpReward: 35
          },
          {
            id: "ch-3",
            title: "Challenge 3: Favourite Idol / Figure",
            badge: "Favourite Idol",
            instruction: "Write 3-5 sentences about your favourite athlete, artist, or public figure: use 'My favourite...', mention their origin, and their profession.",
            example: "My favourite athlete is Lionel Messi. He is a legendary football player. He is from Argentina. He is very inspiring.",
            placeholder: "Start writing here... (My favourite athlete/singer is...)",
            minWords: 12,
            xpReward: 40
          }
        ],
        practicumQuestions: [
          {
            id: 1,
            typeLabel: "Sentence Transformation",
            instruction: "Change the following affirmative sentence into a complete negative sentence:",
            promptText: "Liam is from Melbourne.",
            hint: "Use 'is not' or the contraction 'isn't'",
            targetAnswers: ["Liam is not from Melbourne.", "Liam isn't from Melbourne."],
            explanation: "The negative form of 'Liam is' is 'Liam is not' or contracted 'Liam isn't'."
          },
          {
            id: 2,
            typeLabel: "Sentence Joining ('and')",
            instruction: "Join the following two sentences into one complete sentence using 'and':",
            promptText: "\"I am 16 years old.\" + \"I am a student.\"",
            hint: "I am 16 years old and I am a student.",
            targetAnswers: [
              "I am 16 years old and I am a student.",
              "I am 16 years old and a student.",
              "I'm 16 years old and I'm a student."
            ],
            explanation: "Use the conjunction 'and' to connect two parallel affirmative clauses."
          },
          {
            id: 3,
            typeLabel: "Contrasting Sentences ('but')",
            instruction: "Join the following two contrasting sentences using 'but':",
            promptText: "\"She is from Spain.\" + \"She lives in London.\"",
            hint: "Use a comma before 'but' to link two complete clauses.",
            targetAnswers: [
              "She is from Spain, but she lives in London.",
              "She is from Spain but she lives in London."
            ],
            explanation: "The conjunction 'but' is used to connect two contrasting thoughts."
          },
          {
            id: 4,
            typeLabel: "Complete Q&A (Origin)",
            instruction: "Answer the following question by writing one complete affirmative sentence stating you are from Indonesia:",
            promptText: "Where are you from?",
            hint: "I am from Indonesia. (Capitalize 'I' and 'Indonesia')",
            targetAnswers: ["I am from Indonesia.", "I'm from Indonesia."],
            explanation: "Proper full sentence response: 'I am from Indonesia.' or 'I'm from Indonesia.'"
          },
          {
            id: 5,
            typeLabel: "Fill in Complete Sentence",
            instruction: "Type the complete sentence below by filling in the correct 'to be' verb:",
            promptText: "Marta _____ from Madrid, Spain.",
            hint: "Use the singular to be verb for Marta ('is')",
            targetAnswers: ["Marta is from Madrid, Spain."],
            explanation: "The singular third-person subject 'Marta' pairs with 'is'."
          },
          {
            id: 6,
            typeLabel: "Mechanics & Capitalization",
            instruction: "Re-type the sentence below by correcting all capital letters and period punctuation:",
            promptText: "they are japanese and they live in tokyo",
            hint: "Capitalize 'They', 'Japanese', and 'Tokyo'",
            targetAnswers: ["They are Japanese and they live in Tokyo."],
            explanation: "Sentence start ('They'), nationality ('Japanese'), and city name ('Tokyo') must be capitalized."
          },
          {
            id: 7,
            typeLabel: "Question Construction",
            instruction: "Arrange and type the complete question to ask someone's origin using 'Where' and 'are':",
            promptText: "Where / you / from / ?",
            hint: "Where are you from?",
            targetAnswers: ["Where are you from?"],
            explanation: "Wh-question formula: Where + to be (are) + Subject (you) + from?"
          },
          {
            id: 8,
            typeLabel: "Plural Subject-Verb Agreement",
            instruction: "Write a complete affirmative sentence stating that we are students at school:",
            promptText: "We / students / at school",
            hint: "We are students at school.",
            targetAnswers: ["We are students at school.", "We're students at school."],
            explanation: "The plural subject 'We' takes the linking verb 'are'."
          },
          {
            id: 9,
            typeLabel: "Contraction Writing",
            instruction: "Rewrite this sentence by changing 'I am' into its standard contraction:",
            promptText: "I am not French, I am Italian.",
            hint: "Use an apostrophe (') to contract: I'm",
            targetAnswers: ["I'm not French, I'm Italian."],
            explanation: "The standard contraction of 'I am' is 'I'm'."
          },
          {
            id: 10,
            typeLabel: "Full Sentence Description",
            instruction: "Write one complete sentence introducing your friend Alex who is Australian:",
            promptText: "Alex / friend / Australian",
            hint: "This is Alex and he is Australian. OR Alex is my friend and he is Australian.",
            targetAnswers: [
              "This is Alex and he is Australian.",
              "My friend is Alex and he is Australian.",
              "Alex is my friend and he is Australian.",
              "His name is Alex and he is Australian."
            ],
            explanation: "Proper names (Alex) and nationalities (Australian) must be capitalized with the verb 'is'."
          }
        ]
      },
    },
  ],
};
