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
      title: "Audio Listening Practice (Listening Quiz - 5 Questions)",
      orderIndex: 2,
      content: {
        questions: [
          {
            id: "A1.1-LISTEN-Q1",
            question: "Listen to the audio: Where is Marco's home city?",
            audioScript: "Sarah: Where are you from, Mr. Rossi? Marco: I am from Rome, Italy.",
            options: ["Milan", "Rome", "Venice", "Naples"],
            answer: "Rome",
            explanation: "Marco clearly states: 'I am from Rome, Italy.'"
          },
          {
            id: "A1.1-LISTEN-Q2",
            question: "Listen to the audio: What is Marco's purpose for visiting London?",
            audioScript: "Sarah: Are you here for business or on holiday? Marco: I am here on vacation with my family.",
            options: ["Business trip", "Family vacation", "University study", "Medical checkup"],
            answer: "Family vacation",
            explanation: "Marco answers that he is on holiday with his family ('on vacation with my family')."
          },
          {
            id: "A1.1-LISTEN-Q3",
            question: "Listen to the audio: What is Marco's hotel room number?",
            audioScript: "Sarah: Your room is on the fourth floor, room number 402. Here is your keycard.",
            options: ["Room 204", "Room 402", "Room 420", "Room 412"],
            answer: "Room 402",
            explanation: "Sarah confirms the room is on the fourth floor, number 402 ('room number 402')."
          },
          {
            id: "A1.1-LISTEN-Q4",
            question: "Listen to the audio: Where is Marco's family during the conversation?",
            audioScript: "Marco: They are still at Heathrow Airport. Sarah: Understood.",
            options: ["In the hotel taxi", "In Rome", "At Heathrow Airport", "In the restaurant"],
            answer: "At Heathrow Airport",
            explanation: "Marco explains that his family is still at the airport ('still at Heathrow Airport')."
          },
          {
            id: "A1.1-LISTEN-Q5",
            question: "Listen to the audio: How does Marco spell his surname?",
            audioScript: "Marco: Hello! My name is Marco Rossi. That is spelled R-O-S-S-I.",
            options: ["R-O-S-E-I", "R-U-S-S-I", "R-O-S-S-I", "R-O-S-S-Y"],
            answer: "R-O-S-S-I",
            explanation: "Marco spells his surname as: R-O-S-S-I."
          }
        ],
      },
    },
  ],
};
