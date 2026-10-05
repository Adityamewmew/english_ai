import fs from "fs";
import path from "path";
import { NotFoundError } from "../../../core/errors/app-error";

function getTestBank() {
  const candidatePaths = [
    path.resolve(process.cwd(), "placement_test.json"),
    path.resolve(process.cwd(), "apps/api/placement_test.json"),
    path.resolve(process.cwd(), "../placement_test.json"),
    path.resolve(process.cwd(), "../../placement_test.json"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    }
  }
  return null;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

export async function getPlacementSessionUsecase() {
  const bank = getTestBank();
  if (!bank) throw new NotFoundError("Bank soal penempatan tidak ditemukan.");

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const sampledMCQs: any[] = [];

  for (const lvl of levels) {
    const questionsAtLvl = bank.sections.grammar_vocab.filter((q: any) => q.level === lvl);
    const shuffled = shuffle(questionsAtLvl);
    const selected = shuffled.slice(0, 2).map(({ answer, options, ...rest }: any) => ({
      ...rest,
      options: shuffle(options),
    }));
    sampledMCQs.push(...selected);
  }

  const writingPrompt = shuffle(bank.sections.writing.prompts)[0];
  const speakingPrompt = shuffle(bank.sections.speaking.prompts)[0];

  return {
    sessionId: `PT-${Date.now()}`,
    mcqs: sampledMCQs,
    writingPrompt,
    speakingPrompt,
    totalMCQ: sampledMCQs.length,
    estimatedMinutes: 20,
  };
}
