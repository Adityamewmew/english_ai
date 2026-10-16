import { generateSinglePilotModule } from "./generator/generate-unit";
import { seedAllPilotModules } from "./seed-pilot-modules";

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
    if (level === "A2") {
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
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`⏱️ Completed ${modId} in ${elapsed}s\n`);
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

  if (successCount > 0) {
    console.log("🌱 Auto-seeding all generated pilot modules into PostgreSQL database...");
    await seedAllPilotModules();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
