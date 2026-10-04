const a1 = require("../data/level_a1_modules.json");
const a1_2 = require("../data/level_a1_2_modules.json");
const a1_3 = require("../data/level_a1_3_modules.json");

const sampleModules = [
  a1.modules[0],   // A1-M01
  a1.modules[1],   // A1-M02
  a1_2.modules[0], // A1-M14
  a1_3.modules[0], // A1-M27
  a1_3.modules[4], // A1-M31
  a1_3.modules[8], // A1-M35
  a1_3.modules[10] // A1-M37
];

function deterministicShuffle(items: string[], correctItem: string, seed: number) {
  const result = [...items];
  if (!result.includes(correctItem)) result[0] = correctItem;
  let state = Math.abs(seed) || 12345;
  const nextRand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return { shuffled: result, correctIndex: result.indexOf(correctItem) };
}

for (const m of sampleModules) {
  const theory = m.sections.find((s: any) => s.sectionType === "theory")?.content;
  const dialogue = m.sections.find((s: any) => s.sectionType === "dialogue")?.content;
  const lines = dialogue?.lines || dialogue?.dialogue || [];
  const orderIndex = m.orderIndex || 1;
  const cleanTitle = m.title;
  const baseSeed = orderIndex * 313 + cleanTitle.length * 17;

  console.log("\n======================================================");
  console.log(`MODUL: ${m.id} — ${m.title}`);
  
  // Q1
  const r0 = theory.rules?.[0];
  const q1Seed = baseSeed + 101;
  const pattern = r0?.pattern || r0?.pronoun || "Pattern";
  const ex = r0?.example || "Example";
  const q1Shuffled = deterministicShuffle([ex, "Salah 1", "Salah 2"], ex, q1Seed);
  console.log(`[Q1 - Pattern: ${pattern}]:`);
  console.log(`     Correct: "${ex}" (Index: ${q1Shuffled.correctIndex})`);

  // Q2
  const trap = theory.commonTrap;
  const q2Seed = baseSeed + 202;
  const correctTrap = trap?.correct?.split(/[\/,;]/)[0]?.trim() || "Correct";
  const wrongTrap = trap?.wrong?.split(/[\/,;]/)[0]?.trim() || "Wrong";
  const q2Shuffled = deterministicShuffle([correctTrap, wrongTrap, "Salah 2"], correctTrap, q2Seed);
  console.log(`[Q2 - Trap]:`);
  console.log(`     Correct: "${correctTrap}" (Index: ${q2Shuffled.correctIndex})`);

  // Q3
  const q3Seed = baseSeed + 303;
  const lA = lines[0]?.text || "Hello";
  const lB = lines[1]?.text || "Hi";
  const q3Shuffled = deterministicShuffle([lB, "Distractor A", "Distractor B"], lB, q3Seed);
  console.log(`[Q3 - Context Dialogue]:`);
  console.log(`     Speaker A: "${lA.slice(0, 45)}..."`);
  console.log(`     Speaker B: "${lB.slice(0, 45)}..." (Index: ${q3Shuffled.correctIndex})`);
}
