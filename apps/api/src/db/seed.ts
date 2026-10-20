import { db } from "./index";
import { curriculumModules, itemBank, users } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runSeed() {
  console.log("🌱 Memulai seeding data resmi kurikulum & bank soal EDDY'S AI (PostgreSQL)...");

  const dataDir = path.resolve(import.meta.dir, "../../data");

  // 1. Seed Curriculum Modules (36 Modul)
  const modulesPath = path.join(dataDir, "curriculum_modules.json");
  if (fs.existsSync(modulesPath)) {
    console.log("📚 Mengimpor modul kurikulum...");
    const modulesData = JSON.parse(fs.readFileSync(modulesPath, "utf8"));
    for (const m of modulesData) {
      await db
        .insert(curriculumModules)
        .values({
          id: m.id,
          title: m.title,
          cefr: m.cefr,
          group: m.group,
          objective: m.objective,
          points: m.points,
          vocab: m.vocab,
          tests: m.tests,
          lessonsCount: m.lessons || 1,
        } as any)
        .onConflictDoUpdate({
          target: curriculumModules.id,
          set: { title: m.title, objective: m.objective },
        });
    }
    console.log(`✅ ${modulesData.length} modul resmi berhasil diimpor.`);
  }

  // 2. Seed Item Bank (226 Soal)
  const itemBankPath = path.join(dataDir, "item_bank.json");
  if (fs.existsSync(itemBankPath)) {
    console.log("📝 Mengimpor bank soal...");
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
    console.log(`✅ ${inserted} soal resmi berhasil diimpor.`);
  }

  // 3. Seed Default Admin Accounts
  console.log("👤 Memeriksa akun Administrator...");
  const adminAccounts = [
    {
      id: "admin-default-001",
      name: "Administrator",
      email: "admin@eddy.ai",
      plainPassword: "admin123",
      role: "admin",
      accessType: 1,
      currentCefr: "C2",
    },
    {
      id: "user-admin-mrkhoirul",
      name: "Mr. Khoirul",
      email: "mrkhoriul@gmail.com",
      plainPassword: "asdasd",
      role: "admin",
      accessType: 1,
      currentCefr: "C2",
    },
  ];

  for (const acc of adminAccounts) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, acc.email))
      .limit(1);

    const hashedPassword = await Bun.password.hash(acc.plainPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    if (!existing) {
      await db.insert(users).values({
        id: acc.id,
        name: acc.name,
        email: acc.email,
        password: hashedPassword,
        role: acc.role,
        accessType: acc.accessType,
        currentCefr: acc.currentCefr,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Akun ${acc.role} berhasil dibuat: ${acc.email}`);
    } else {
      await db
        .update(users)
        .set({
          name: acc.name,
          password: hashedPassword,
          role: acc.role,
          accessType: acc.accessType,
          updatedAt: new Date(),
        })
        .where(eq(users.email, acc.email));
      console.log(`ℹ️ Akun ${acc.role} diperbarui: ${acc.email}`);
    }
  }

  console.log("🎉 Seeding data selesai!");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Error saat seeding:", err);
  process.exit(1);
});
