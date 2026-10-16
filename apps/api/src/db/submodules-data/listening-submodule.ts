export const listeningSubModule = {
  skillType: "listening",
  title: "Listening & Contextual Dialogue",
  orderIndex: 2,
  sections: [
    {
      sectionType: "dialogue",
      title: "Listening Material & Interactive Dialogue (Listening Context)",
      orderIndex: 1,
      content: {
        context: "A natural dialogue between hotel receptionist (Sarah) and a guest (Marco) during check-in in London.",
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
      title: "Audio Listening Practicum (10 Interactive Tasks)",
      orderIndex: 2,
      content: {
        passingScore: 80,
        practicumQuestions: [
          {
            id: 1,
            type: "dictation",
            audioText: "Good afternoon! Welcome to the Grand International Hotel.",
            instruction: "Listen to the audio clip and type the missing word:",
            promptSentence: "Sarah: \"Good afternoon! Welcome to the Grand International _____.\"",
            targetWord: "Hotel",
            explanation: "Full audio: \"Welcome to the Grand International Hotel.\". The correct word is \"Hotel\"."
          },
          {
            id: 2,
            type: "dictation",
            audioText: "I am from Rome, Italy. It is my very first time visiting London.",
            instruction: "Listen to the audio clip and type the missing word:",
            promptSentence: "Marco: \"I am from _____, Italy.\"",
            targetWord: "Rome",
            explanation: "Full audio: \"I am from Rome, Italy.\". The correct word is \"Rome\"."
          },
          {
            id: 3,
            type: "dictation",
            audioText: "I am here on vacation with my family.",
            instruction: "Listen to the audio clip and type the missing word:",
            promptSentence: "Marco: \"I am here on _____ with my family.\"",
            targetWord: "vacation",
            explanation: "Full audio: \"I am here on vacation with my family.\". The correct word is \"vacation\"."
          },
          {
            id: 4,
            type: "dictation",
            audioText: "Your room is on the fourth floor, room number 402.",
            instruction: "Listen to the audio clip and type the missing word:",
            promptSentence: "Sarah: \"Your room is on the _____ floor, room number 402.\"",
            targetWord: "fourth",
            explanation: "Full audio: \"Your room is on the fourth floor.\". The correct word is \"fourth\"."
          },
          {
            id: 5,
            type: "dictation",
            audioText: "Here is your keycard.",
            instruction: "Listen to the audio clip and type the missing word:",
            promptSentence: "Sarah: \"Here is your _____.\"",
            targetWord: "keycard",
            explanation: "Full audio: \"Here is your keycard.\". The correct word is \"keycard\"."
          },
          {
            id: 6,
            type: "arrange",
            audioText: "What is your full name please?",
            instruction: "Listen to the sentence and arrange the words in the correct order:",
            targetSentence: "What is your full name please",
            words: ["full", "please", "is", "name", "your", "What"],
            explanation: "Correct sentence order: \"What is your full name please?\"."
          },
          {
            id: 7,
            type: "arrange",
            audioText: "Where are you from?",
            instruction: "Listen to the sentence and arrange the words in the correct order:",
            targetSentence: "Where are you from",
            words: ["from", "you", "are", "Where"],
            explanation: "Correct sentence order: \"Where are you from?\"."
          },
          {
            id: 8,
            type: "arrange",
            audioText: "I am from Rome Italy.",
            instruction: "Listen to the sentence and arrange the words in the correct order:",
            targetSentence: "I am from Rome Italy",
            words: ["Rome", "from", "Italy", "am", "I"],
            explanation: "Correct sentence order: \"I am from Rome Italy.\"."
          },
          {
            id: 9,
            type: "arrange",
            audioText: "They are still at Heathrow Airport.",
            instruction: "Listen to the sentence and arrange the words in the correct order:",
            targetSentence: "They are still at Heathrow Airport",
            words: ["Heathrow", "still", "are", "Airport", "They", "at"],
            explanation: "Correct sentence order: \"They are still at Heathrow Airport.\"."
          },
          {
            id: 10,
            type: "arrange",
            audioText: "Thank you very much for your kind help.",
            instruction: "Listen to the sentence and arrange the words in the correct order:",
            targetSentence: "Thank you very much for your kind help",
            words: ["very", "kind", "Thank", "for", "much", "help", "your", "you"],
            explanation: "Correct sentence order: \"Thank you very much for your kind help.\"."
          }
        ]
      },
    },
  ],
};
