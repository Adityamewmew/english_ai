import { voiceRepository } from "../../repository/voice_repository";
import { AiService } from "../../../lib/ai";

export async function getVoiceGreetingUsecase(params: {
  topic?: string;
  userId?: string;
  fallbackName?: string;
  forceReturning?: boolean;
}) {
  const topic = params.topic || "Daily Casual Chat";
  let studentName = params.fallbackName ? params.fallbackName.split(" ")[0] : "";
  let hasPreviousSession = Boolean(params.forceReturning);

  if (params.userId) {
    try {
      const user = await voiceRepository.getUserInfo(params.userId);
      if (user) {
        const mem = user.memory as any;
        if (mem?.preferredName) {
          studentName = mem.preferredName;
        } else if (!studentName && user.name) {
          studentName = user.name.split(" ")[0];
        }

        if ((mem?.totalCalls ?? 0) > 0 || (mem?.facts && mem.facts.length > 0)) {
          hasPreviousSession = true;
        }
      }
    } catch (e) {
      console.warn("Check user memory error:", e);
    }

    if (!hasPreviousSession) {
      try {
        hasPreviousSession = await voiceRepository.hasPastSessions(params.userId);
      } catch (e) {
        console.warn("Check previous sessions error:", e);
      }
    }
  }

  // Fast organic fallback greeting (used if AI call fails or times out)
  const fallbackGreeting = hasPreviousSession
    ? (studentName
        ? `Yo ${studentName}! Great to hear from you again. What's new with you today?`
        : "Yo! Great to hear from you again. What's new with you today?")
    : (studentName
        ? `Yo ${studentName}! What's up! Mr. Khoirul here. Great to talk with you!`
        : "Yo! What's up! Mr. Khoirul here. Great to talk with you!");

  try {
    const systemPrompt = `You are Mr. Khoirul, an expressive, warm, and charismatic English coach picking up the phone with a student.
Topic of call: "${topic}".
Student Name: "${studentName || "there"}".
Student Status: ${hasPreviousSession ? "Returning friend/student" : "First time calling"}.
Task: Say a spontaneous, lively, 1-sentence opening greeting to start the conversation naturally.
Rules:
- Strictly English ONLY.
- Natural phone greeting (e.g. start with "Yo", "Hey", "Haha hey", "What's up!").
- Mention student name if provided.
- Maximum 15 words.
- No quotes, no stage directions, plain spoken text only.`;

    const userPrompt = "Pick up the phone and greet the student now.";

    const aiGreetingPromise = AiService.callAI(systemPrompt, userPrompt, { maxTokens: 30 });
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Greeting timeout")), 2500)
    );

    const generated = await Promise.race([aiGreetingPromise, timeoutPromise]);
    let cleanGreeting = (generated || "").replace(/["*#`]/g, "").trim();
    if (cleanGreeting.length >= 8 && cleanGreeting.length <= 160) {
      return {
        greeting: cleanGreeting,
        topic,
      };
    }
  } catch (err) {
    // Graceful fallback to warm instant greeting
  }

  return {
    greeting: fallbackGreeting,
    topic,
  };
}
