import fs from "fs";
import path from "path";
import { generateSinglePilotModule } from "./generator/generate-unit";
import { seedSingleModuleData } from "./seed-pilot-modules";

async function main() {
  const args = process.argv.slice(2);
  let targetModule: string | null = null;
  let isAll = false;
  let force = false;
  let model: string | undefined;
  let fromUnit: number | null = null;
  let toUnit: number | null = null;
  let level = "A1.1";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--module" && args[i + 1]) {
      targetModule = args[i + 1].toUpperCase();
      i++;
    } else if (arg === "--level" && args[i + 1]) {
      level = args[i + 1].toUpperCase();
      i++;
    } else if (arg === "--from" && args[i + 1]) {
      fromUnit = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--to" && args[i + 1]) {
      toUnit = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--all") {
      isAll = true;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--model" && args[i + 1]) {
      model = args[i + 1];
      i++;
    }
  }

  let targets: string[] = [];
  if (fromUnit !== null && toUnit !== null) {
    for (let u = fromUnit; u <= toUnit; u++) {
      targets.push(`${level}-M${String(u).padStart(2, "0")}`);
    }
  } else if (isAll) {
    if (level === "B1") {
      targets = [
        ...Array.from({ length: 12 }, (_, idx) => `B1.1-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B1.2-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B1.3-M${String(idx + 1).padStart(2, "0")}`),
      ];
    } else if (level === "B2") {
      targets = [
        ...Array.from({ length: 12 }, (_, idx) => `B2.1-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B2.2-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B2.3-M${String(idx + 1).padStart(2, "0")}`),
      ];
    } else if (level === "B" || level === "B1+B2") {
      targets = [
        ...Array.from({ length: 12 }, (_, idx) => `B1.1-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B1.2-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B1.3-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B2.1-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B2.2-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `B2.3-M${String(idx + 1).padStart(2, "0")}`),
      ];
    } else if (level === "A2") {
      targets = [
        ...Array.from({ length: 12 }, (_, idx) => `A2.1-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `A2.2-M${String(idx + 1).padStart(2, "0")}`),
        ...Array.from({ length: 12 }, (_, idx) => `A2.3-M${String(idx + 1).padStart(2, "0")}`),
      ];
    } else {
      targets = Array.from({ length: 12 }, (_, idx) => `${level}-M${String(idx + 1).padStart(2, "0")}`);
    }
  } else {
    targets = [targetModule || `${level}-M01`];
  }

  console.log(`🚀 Starting Pilot Module Generator for ${targets.length} module(s)...`);
  console.log(`📋 Target list: ${targets.join(", ")}`);
  console.log(`⚙️ Skip existing: ${!force}`);
  if (model) console.log(`🤖 Model override: ${model}`);

  const startAll = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (const modId of targets) {
    try {
      const t0 = Date.now();
      await generateSinglePilotModule(modId, {
        skipExisting: !force,
        model,
      });
      // Immediately seed this module into PostgreSQL database
      const p = path.resolve(process.cwd(), `../../data/pilot_modules/${modId}.json`);
      const fallbackP = path.resolve(process.cwd(), `data/pilot_modules/${modId}.json`);
      const targetP = fs.existsSync(p) ? p : fallbackP;
      if (fs.existsSync(targetP)) {
        const data = JSON.parse(fs.readFileSync(targetP, "utf8"));
        await seedSingleModuleData(data);
      }
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`⏱️ Completed and seeded ${modId} in ${elapsed}s\n`);
      successCount++;
    } catch (err: any) {
      console.error(`❌ Failed generating ${modId}:`, err.message);
      errorCount++;
    }
  }

  const totalTime = ((Date.now() - startAll) / 1000).toFixed(1);
  console.log(`\n======================================================`);
  console.log(`🏁 BATCH COMPLETE in ${totalTime}s`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${errorCount}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
