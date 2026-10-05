import { voiceRepository } from "../voice.repository";

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

  if (hasPreviousSession) {
    const returningGreetings = [
      studentName
        ? `Hey ${studentName}, welcome back! Good to hear from you again. How are things with you today?`
        : `Hey, welcome back! Good to hear from you again. How are things with you today?`,
      studentName
        ? `Hi ${studentName}, welcome back! Great to connect again. How has your day been going so far?`
        : `Hi, welcome back! Great to connect again. How has your day been going so far?`,
      studentName
        ? `Hey ${studentName}! Good to hear your voice again. Ready to practice some English today?`
        : `Hey there! Good to hear your voice again. Ready to practice some English today?`,
      studentName
        ? `Good to chat with you again, ${studentName}! What have you been up to today?`
        : `Good to chat with you again! What have you been up to today?`,
    ];
    const idx = Math.floor(Math.random() * returningGreetings.length);
    return {
      greeting: returningGreetings[idx],
      topic,
    };
  }

  const defaultGreeting = studentName
    ? `Hello ${studentName}! I am Mr. Khoirul, your English tutor. It is wonderful to meet you today! How are you doing?`
    : "Hello! I am Mr. Khoirul, your English tutor. It is wonderful to meet you today! How are you doing?";

  return {
    greeting: defaultGreeting,
    topic,
  };
}
