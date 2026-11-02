import { voiceRepository } from "../../repository/voice_repository";

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
        ? `Yo ${studentName}! Good to hear from you again. What's new with you today?`
        : `Yo! Good to hear from you again. What's new with you today?`,
      studentName
        ? `Hey ${studentName}! Welcome back. What are you up to right now?`
        : `Hey! Welcome back. What are you up to right now?`,
      studentName
        ? `Hey ${studentName}! Great to hear your voice again. How's your day treating you?`
        : `Hey there! Great to hear your voice again. How's your day treating you?`,
      studentName
        ? `Haha, hey ${studentName}! Always great catching up with you.`
        : `Haha, hey there! Always great catching up with you.`,
    ];
    const idx = Math.floor(Math.random() * returningGreetings.length);
    return {
      greeting: returningGreetings[idx],
      topic,
    };
  }

  const defaultGreetings = [
    studentName
      ? `Yo ${studentName}! What's up! Mr. Khoirul here. Great to finally talk with you!`
      : "Yo! What's up! Mr. Khoirul here. Great to finally talk with you!",
    studentName
      ? `Hey ${studentName}! Awesome to connect with you. How's everything going today?`
      : "Hey there! Awesome to connect with you. How's everything going today?",
    studentName
      ? `Hey ${studentName}! Mr. Khoirul here. So glad you called in today!`
      : "Hey! Mr. Khoirul here. So glad you called in today!",
  ];
  const defaultGreeting = defaultGreetings[Math.floor(Math.random() * defaultGreetings.length)];

  return {
    greeting: defaultGreeting,
    topic,
  };
}
