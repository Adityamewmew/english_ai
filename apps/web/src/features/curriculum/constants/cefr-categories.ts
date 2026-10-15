export interface SubLevelItem {
  id: string; // "A1.1", "A1.2", etc.
  title: string;
  order: number;
  description?: string;
}

export interface CefrCategory {
  id: string; // "A1", "A2", "B1", "B2", "C1", "C2"
  label: string;
  name: string;
  badgeColor: {
    active: string;
    inactive: string;
    border: string;
    accent: string;
  };
  subLevels: SubLevelItem[];
}

export const CEFR_CATEGORIES: CefrCategory[] = [
  {
    id: "A1",
    label: "A1",
    name: "Starter",
    badgeColor: {
      active: "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-[0_2px_4px_rgba(13,59,102,0.25)]",
      inactive: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0D3B66]",
      border: "border-[#0D3B66]",
      accent: "#0D3B66",
    },
    subLevels: [
      { id: "A1.1", title: "Starter Foundations", order: 1, description: "Personal introductions, essential objects, nationalities, and present 'to be' syntax." },
      { id: "A1.2", title: "Daily Logistics & Practical Actions", order: 2, description: "Daily schedules, home and neighborhood, asking for directions, and routine actions." },
      { id: "A1.3", title: "Experiences, Comparisons & Intentions", order: 3, description: "Basic past events, making polite requests, descriptive comparisons, and simple future plans." },
    ],
  },
  {
    id: "A2",
    label: "A2",
    name: "Elementary",
    badgeColor: {
      active: "bg-[#1B4965] text-white border-b-2 border-[#113144] shadow-[0_2px_4px_rgba(27,73,101,0.25)]",
      inactive: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#1B4965]",
      border: "border-[#1B4965]",
      accent: "#1B4965",
    },
    subLevels: [
      { id: "A2.1", title: "Elementary Actions", order: 1, description: "Everyday transactions, past simple narratives, shopping, and routine social exchanges." },
      { id: "A2.2", title: "Social Dynamics, Work & Everyday Life", order: 2, description: "Workplace roles, travel arrangements, dining etiquette, and compound sentences." },
      { id: "A2.3", title: "World Explorations & Bridge to B1", order: 3, description: "Expressing opinions, cultural comparisons, hypothetical wishes, and transitioning to intermediate." },
    ],
  },
  {
    id: "B1",
    label: "B1",
    name: "Intermediate",
    badgeColor: {
      active: "bg-[#F4B41A] text-[#0F172A] border-b-2 border-[#DDA012] shadow-[0_2px_4px_rgba(244,180,26,0.3)]",
      inactive: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#F4B41A]",
      border: "border-[#F4B41A]",
      accent: "#F4B41A",
    },
    subLevels: [
      { id: "B1.1", title: "Intermediate Foundations", order: 1, description: "Spontaneous conversations, describing dreams and ambitions, and explaining reasons." },
      { id: "B1.2", title: "Intermediate Fluency & Global Work", order: 2, description: "Professional teamwork, workplace problem solving, and contextual presentations." },
      { id: "B1.3", title: "Critical Perspectives & Bridge to B2", order: 3, description: "Constructing persuasive arguments, news interpretation, and advanced connector clauses." },
      { id: "B1.4", title: "Workplace Communication & Practical Fluency", order: 4, description: "Client relations, technical overviews, project meetings, and collaborative debates." },
      { id: "B1.5", title: "Social Debates, Media Literacy & Bridge to B2", order: 5, description: "Media literacy, socio-cultural debates, idiomatic phrasing, and upper-intermediate gateway." },
    ],
  },
  {
    id: "B2",
    label: "B2",
    name: "Upper Intermediate",
    badgeColor: {
      active: "bg-[#9E1B1B] text-white border-b-2 border-[#751414] shadow-[0_2px_4px_rgba(158,27,27,0.25)]",
      inactive: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#9E1B1B]",
      border: "border-[#9E1B1B]",
      accent: "#9E1B1B",
    },
    subLevels: [
      { id: "B2.1", title: "Vantage Foundations", order: 1, description: "Abstract reasoning, nuanced points of view, and fast-paced spoken discourse." },
      { id: "B2.2", title: "Advanced Professional & Academic Fluency", order: 2, description: "Executive meetings, academic reviews, synthesized summaries, and cross-examination." },
      { id: "B2.3", title: "Strategic Debate & Bridge to C1", order: 3, description: "Strategic argumentation, rhetorical contrast, mixed conditionals, and advanced register shift." },
      { id: "B2.4", title: "Academic Argumentation & Formal Registers", order: 4, description: "Formal thesis defense, scholarly critique, and formal technical negotiations." },
      { id: "B2.5", title: "Nuanced Persuasion, Mixed Conditionals & Bridge", order: 5, description: "Complex stylistic variance, high-stakes persuasion, and gateway to academic C1 mastery." },
    ],
  },
  {
    id: "C1",
    label: "C1",
    name: "Advanced",
    badgeColor: {
      active: "bg-slate-900 text-white border-b-2 border-black shadow-[0_2px_4px_rgba(15,23,42,0.3)]",
      inactive: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-900",
      border: "border-slate-900",
      accent: "#0F172A",
    },
    subLevels: [
      { id: "C1.1", title: "Advanced Academic & Operational Fluency", order: 1, description: "Fluent spontaneous expression, subtext grasp, and high-register academic papers." },
      { id: "C1.2", title: "Strategic Oratory & Complex Syntax", order: 2, description: "Public oratory, rhetorical cadence, syntactic inversion, and authoritative leadership." },
      { id: "C1.3", title: "Critical Dialectics & Bridge to C2", order: 3, description: "Epistemic debate, legal and forensic phrasing, and bridge to near-native mastery." },
      { id: "C1.4", title: "Complex Inversion & Rhetorical Devices", order: 4, description: "Stylistic literary tropes, syntactic inversions, and high-context cultural debates." },
      { id: "C1.5", title: "Academic Peer Review & Research Critiques", order: 5, description: "Peer-review deconstruction, methodological critique, and international symposium defense." },
      { id: "C1.6", title: "Diplomatic Negotiation & Executive Discourse", order: 6, description: "Diplomatic consensus, high-stakes corporate mediation, and subtle irony." },
      { id: "C1.7", title: "Crisis Communication & Dialectical Synthesis", order: 7, description: "Crisis containment rhetoric, dialectical synthesis, and gateway to C2 Grandmastery." },
    ],
  },
  {
    id: "C2",
    label: "C2",
    name: "Mastery",
    badgeColor: {
      active: "bg-amber-900 text-white border-b-2 border-amber-950 shadow-[0_2px_4px_rgba(120,53,15,0.3)]",
      inactive: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-900",
      border: "border-amber-900",
      accent: "#78350F",
    },
    subLevels: [
      { id: "C2.1", title: "Mastery Foundations & Rhetorical Wit", order: 1, description: "Near-native precision, subtle idiomatic humor, effortless cadence, and poetic flair." },
      { id: "C2.2", title: "Dialectical Precision & Semiotic Depth", order: 2, description: "Semiotic exploration, cultural deconstruction, and deep philosophical discourse." },
      { id: "C2.3", title: "Ultimate Native Fluency & Grandmastery", order: 3, description: "Effortless native fluency across any technical, philosophical, or literary domain." },
      { id: "C2.4", title: "Forensic Linguistics & Semantic Disambiguation", order: 4, description: "Forensic analysis of ambiguous utterances, jurisdictional nuance, and text deconstruction." },
      { id: "C2.5", title: "Grandmaster Dialectics & Epigrammatic Wit", order: 5, description: "Epigrammatic mastery, sharp intellectual wit, and high-level philosophical debate." },
      { id: "C2.6", title: "Hermeneutic Analysis & Philosophical Debate", order: 6, description: "Hermeneutic inquiry, classical rhetoric synthesis, and deep interpretive discourse." },
      { id: "C2.7", title: "The Sovereign English Speaker: Capstone Mastery", order: 7, description: "Capstone mastery: complete linguistic sovereignty, eloquence, and intellectual authority." },
    ],
  },
];
