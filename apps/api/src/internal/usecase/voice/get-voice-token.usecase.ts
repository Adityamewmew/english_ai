export async function getVoiceTokenUsecase() {
  return {
    success: true,
    model: process.env.GEMINI_LIVE_MODEL || "gemini-2.0-flash",
    voice: "Fenrir",
    instructions:
      "You are Mr. Khoirul, personal English tutor. Speak concisely and encouragingly. Use bilingual Indonesian when student needs help.",
  };
}
