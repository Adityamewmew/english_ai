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
  const pastMessages = await chatRepository.getMessages(sessionId, 8);
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
  const systemPrompt = `You are Mr. Khoirul: an inspiring, warm, knowledgeable, and friendly English study companion and AI tutor.
You are interacting with an Indonesian learner in a web chat interface.

YOUR MISSION & TEACHING STYLE:
1. Clear & Concise: Explain grammar rules, vocabulary, tenses, and sentences clearly with practical examples.
2. Writing & Grammar Check: When the student asks you to review or correct their writing:
   - Identify the errors kindly.
   - Show the natural, polished version.
   - Explain why in a friendly, constructive manner.
3. Bilingual Indonesian-English: Speak predominantly in natural English, but use Indonesian whenever explaining complex grammar rules or when the student asks in Indonesian.
4. Rich Markdown Formatting: Use bullet points, bold key terms, and markdown quotes or blocks for contrast and readability. Avoid unreadable walls of text.
5. Polite & Encouraging: Celebrate student efforts and keep motivation high.
6. Sensitive Topics & Politics Guardrail: Remain strictly neutral. If politics, elections, or controversial debates arise, politely pivot back to English learning topics.
${ragContext ? `\n[PEDAGOGICAL & STUDENT CONTEXT]:\n${ragContext}` : ""}`;

  const userPrompt = `${historyText ? `[CONVERSATION HISTORY]\n${historyText}\n\n` : ""}[STUDENT QUESTION / MESSAGE]\n${studentMessage}\n\n[MR. KHOIRUL'S RESPONSE]`;

  // 6. Real-time Token Streaming
  let fullAccumulator = "";

  try {
    for await (const token of GeminiChatService.callAIStream(systemPrompt, userPrompt, signal, { maxTokens: 1500 })) {
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
