import { db } from "./index";
import { curriculumModules, itemBank, users } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runSeed() {
  console.log("Memulai seeding data resmi kurikulum & bank soal EDDY'S AI...");

  const dataDir = path.resolve(process.cwd(), "../../data");

  // 1. Seed Curriculum Modules
  const modulesPath = path.join(dataDir, "level_a1_modules.json");
  if (fs.existsSync(modulesPath)) {
    console.log("Mengimpor modul kurikulum...");
    const parsed = JSON.parse(fs.readFileSync(modulesPath, "utf8"));
    const modulesData = parsed.modules || [];
    for (const m of modulesData) {
      await db
        .insert(curriculumModules)
        .values({
          id: m.id,
          levelId: m.levelId || "A1.1",
          title: m.title,
          cefr: m.cefr,
          group: m.group,
          objective: m.objective,
          complexity: m.complexity || "medium",
          estimatedMinutes: m.estimatedMinutes || 15,
          isExam: m.isExam || false,
          passingScore: m.passingScore || 70,
          orderIndex: m.orderIndex || 1,
        })
        .onConflictDoUpdate({
          target: curriculumModules.id,
          set: { title: m.title, objective: m.objective },
        });
    }
    console.log(`${modulesData.length} modul resmi berhasil diimpor.`);
  }

  // 2. Seed Item Bank
  const itemBankPath = path.join(dataDir, "item_bank.json");
  if (fs.existsSync(itemBankPath)) {
    console.log("Mengimpor bank soal...");
    const itemsData = JSON.parse(fs.readFileSync(itemBankPath, "utf8"));
    let inserted = 0;
    for (const item of itemsData) {
      const questionText = item.question || item.prompt || item.instruction || "Prompt";
      const answerText = item.answer || item.text || "";
      const explanationText = item.explanation || item.note || null;

      await db
        .insert(itemBank)
        .values({
          id: item.id,
          skill: item.skill,
          cefr: item.cefr,
          type: item.type || "MCQ",
          question: questionText,
          options: item.options || [],
          answer: answerText,
          audioScript: item.audio_script || null,
          audioUrl: item.audio_file || null,
          explanation: explanationText,
        })
        .onConflictDoUpdate({
          target: itemBank.id,
          set: { question: questionText, answer: answerText },
        });
      inserted++;
    }
    console.log(`${inserted} soal resmi berhasil diimpor.`);
  }

  // 3. Seed Default Admin Account
  console.log("Memeriksa akun Administrator default...");
  const adminEmail = "admin@eddy.ai";
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    const adminPasswordHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 10,
    });

    await db.insert(users).values({
      id: crypto.randomUUID(),
      name: "Administrator EDDY'S AI",
      email: adminEmail,
      password: adminPasswordHash,
      role: "admin",
      currentCefr: "C2",
    });
    console.log("Akun Admin default berhasil dibuat (admin@eddy.ai / admin123).");
  } else {
    console.log("Akun Admin default sudah ada.");
  }

  console.log("Proses seed selesai.");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Gagal melakukan seed database:", err);
  process.exit(1);
});
