import { chatRepository } from "../../repository/chat_repository";
import { GeminiChatService } from "../../../lib/gemini-chat";
import { LlmGuardrailService } from "../../../lib/llm-guardrail.service";
import { voiceRagService } from "../voice/voice-rag.service";

export async function* streamChatTurnUsecase(params: {
  sessionId: string;
  studentMessage: string;
  userId?: string;
  signal?: AbortSignal;
}): AsyncGenerator<string, void, unknown> {
  const { sessionId, studentMessage, userId, signal } = params;

  // 1. Input Guardrail Check (OWASP LLM01, Injection, Toxicity, Politics/SARA)
  const guard = LlmGuardrailService.checkVoiceInput(studentMessage, 3000);
  if (!guard.allowed) {
    const blockedReply = guard.friendlyFeedback;
    await chatRepository.addMessage(sessionId, "user", studentMessage, {
      guardrailTriggered: true,
      violation: guard.violationType,
    });
    await chatRepository.addMessage(sessionId, "assistant", blockedReply, {
      guardrailBlocked: true,
    });
    yield blockedReply;
    return;
  }

  // 2. Save student message to database
  await chatRepository.addMessage(sessionId, "user", studentMessage);

  // 3. Retrieve conversation history for context (last 8 messages)
  const pastMessages = await chatRepository.getRecentMessages(sessionId, 9);
  const historyText = pastMessages
    .slice(0, -1) // Exclude the just-inserted message since it's passed as prompt
    .map((m) => `${m.role === "assistant" ? "Mr. Khoirul" : "Student"}: ${m.content}`)
    .join("\n\n");

  // 4. Retrieve RAG Context (Curriculum patterns + Student memory)
  let ragContext = "";
  try {
    ragContext = await voiceRagService.buildTutorCallContext({
      topic: studentMessage.slice(0, 60),
      userId,
    });
  } catch (ragErr) {
    console.warn("Chat RAG context lookup warning:", ragErr);
  }

  // 5. System Prompt Construction
  const systemPrompt = `You are Mr. Khoirul: a friendly, genuine, and encouraging English study companion and tutor chatting directly with an Indonesian learner.

CONVERSATIONAL RULES (STRICT):
1. Natural Persona & Tone:
   - Chat like a real, cool teacher chatting on WhatsApp/Telegram (santai, akrab, suportif).
   - NEVER introduce yourself mechanically (do NOT say "I'm Mr. Khoirul, your English study companion..." or output formal canned greetings).
2. Brevity & Cadence (NO Walls of Text):
   - For casual chat/greetings: Keep your reply to 1-3 short, natural sentences (around 20-45 words total).
   - For grammar/lesson explanations: Keep it concise (max 2 short paragraphs with 1-2 practical examples). Never dump textbook chapters.
3. One Question Only:
   - Ask at most ONE simple, engaging question per turn. Never overwhelm the student with multiple questions.
4. Let the Student Speak First (No Unsolicited Answer Lists):
   - NEVER provide a bulleted list of sample answers or templates before the student has attempted to answer. Give them space to respond!
5. Clean Text (NO Markdown Blockquotes):
   - DO NOT use markdown blockquotes ('>') for regular speech, questions, or translations.
   - Use bold sparingly only for key terms.
6. Bilingual Flow & Recasting:
   - Speak primarily in natural English. Use Indonesian naturally when explaining complex grammar or when the student speaks Indonesian.
   - Never repeat the exact same sentence twice back-to-back in English and Indonesian.
   - If the student makes an error in conversation, gently recast the correct English naturally in your response without lecturing.
7. Background Context Is Invisible:
   - Any curriculum or student profile data below is strictly for YOUR background guidance.
   - NEVER recite curriculum titles, module codes, or syllabus headings (e.g. NEVER say "We're in Unit 4: In the City" or "Today's objective is...").
8. Neutrality:
   - If political or controversial topics arise, stay neutral and politely pivot back to English practice.
${ragContext ? `\n[INTERNAL BACKGROUND CONTEXT]:\n${ragContext}` : ""}`;

  const userPrompt = `${historyText ? `[RECENT CONVERSATION]\n${historyText}\n\n` : ""}[STUDENT MESSAGE]\n${studentMessage}\n\n[MR. KHOIRUL'S RESPONSE]`;

  // 6. Real-time Token Streaming
  let fullAccumulator = "";

  try {
    for await (const token of GeminiChatService.callAIStream(systemPrompt, userPrompt, signal, { maxTokens: 500 })) {
      if (signal?.aborted) break;
      fullAccumulator += token;
      yield token;
    }
  } catch (err: any) {
    console.error("Chat turn stream error:", err);
    if (!fullAccumulator) {
      const fallback =
        "I'm here with you! Could you please repeat or rephrase your question so I can help you better?";
      yield fallback;
      fullAccumulator = fallback;
    }
  }

  // 7. Output Guardrail (PII Masking) & Persist assistant response
  const sanitizedReply = LlmGuardrailService.maskPii(fullAccumulator);
  await chatRepository.addMessage(sessionId, "assistant", sanitizedReply);

  // 8. Auto-generate a clean session title if still default
  try {
    const session = await chatRepository.getSession(sessionId);
    if (session && session.title === "Percakapan Baru") {
      const generatedTitle =
        studentMessage.length > 32
          ? studentMessage.slice(0, 30).trim() + "..."
          : studentMessage.trim();
      await chatRepository.updateSessionTitle(sessionId, generatedTitle);
    }
  } catch {}
}
