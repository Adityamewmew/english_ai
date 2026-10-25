import { LlmGuardrailService } from "./llm-guardrail.service";

/**
 * Collapses repetitive letters/stutters (e.g. "seeeeeee" -> "see", "sooooo" -> "so")
 * to prevent model repetition loops and distorted TTS audio output.
 */
export function sanitizeRepeatedChars(text: string): string {
  if (!text) return "";
  let cleaned = text
    .replace(/\bs[oO]{2,}\b/gi, "so")
    .replace(/\bn[oO]{2,}\b/gi, "no")
    .replace(/\bg[oO]{2,}\b/gi, "go")
    .replace(/\by[oO]{2,}\b/gi, "yo")
    .replace(/\bs[eE]{3,}\b/gi, "see");

  cleaned = cleaned.replace(/([a-zA-Z])\1{2,}/g, (match, char) => {
    const lower = char.toLowerCase();
    if (lower === "e" || lower === "o") return char + char;
    return char;
  });

  cleaned = cleaned.replace(/([.!?,-])\1{2,}/g, "$1");
  return cleaned.trim();
}

/**
 * Universal AI Chat & Conversational Streaming Service
 * Connects to OpenAI-compatible AI gateway (DeepSeek, Claude, Llama, etc.)
 */
export class AiChatService {
  /**
   * Universal AI caller: calls OpenAI-compatible /chat/completions endpoint
   */
  static async callAI(
    systemPrompt: string,
    userPrompt: string,
    options?: { maxTokens?: number }
  ): Promise<string> {
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY || "";
    const model = process.env.AI_CHAT_MODEL || "deepseek-v4.1-flash:free";

    if (!baseUrl) {
      throw new Error("AI_BASE_URL is not configured.");
    }

    const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: options?.maxTokens || 350,
        temperature: 0.6,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Gateway [${model}] (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI Gateway.");
    }
    return content;
  }

  /**
   * Universal AI Stream caller: streams tokens from OpenAI-compatible /chat/completions
   */
  static async *callAIStream(
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal,
    options?: { maxTokens?: number }
  ): AsyncGenerator<string, void, unknown> {
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY || "";
    const model = process.env.AI_CHAT_MODEL || "deepseek-v4.1-flash:free";

    if (!baseUrl) {
      throw new Error("AI_BASE_URL is not configured.");
    }

    const connectAbort = new AbortController();
    const timer = setTimeout(() => {
      connectAbort.abort(new Error("TTFT connection timeout"));
    }, 25000);

    const activeSignal = signal
      ? AbortSignal.any([signal, connectAbort.signal])
      : connectAbort.signal;

    try {
      const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_tokens: options?.maxTokens || 350,
          temperature: 0.5,
          frequency_penalty: 0.3,
          presence_penalty: 0.2,
          stop: ["Student:", "Student :", "\nStudent", "\nUser:", "\nHuman:", "Mr. Khoirul:"],
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: activeSignal,
      });

      clearTimeout(timer);

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === "[DONE]") return;
            try {
              const parsed = JSON.parse(dataStr);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                yield token;
              }
            } catch {}
          }
        }
      } else {
        const errText = await res.text();
        console.warn(`AI Stream Gateway [${model}] error (${res.status}):`, errText);
        throw new Error(`AI Stream Gateway [${model}] error (${res.status}): ${errText}`);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Sentence boundary generator with prompt-cache optimized prefix
   */
  static async *streamTutorSentences(
    topic: string,
    history: Array<{ role: "assistant" | "user"; content: string }>,
    studentMessage: string,
    ragContext?: string,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    // 0. Input Guardrail: Instant check for Injection, Toxicity, Politics/SARA
    const guard = LlmGuardrailService.checkVoiceInput(studentMessage);
    if (!guard.allowed) {
      yield guard.friendlyFeedback;
      return;
    }

    const isClosingIntent = /\b(bye|goodbye|see you|have to go|got to go|sudah|selesai|pamit|dadah|makasih pak|thank you bye)\b/i.test(
      studentMessage
    );

    const isFirstUserTurn = history.filter((m) => m.role === "user").length === 0;

    const STATIC_PREFIX = `You are Mr. Khoirul: a warm, genuine, humble, and friendly English conversational tutor talking live on the phone with an English learner.
CONVERSATIONAL GUIDELINES:
1. Natural Persona: Speak ONLY as Mr. Khoirul for this turn. Never write "Student:" or simulate the student.
2. Spoken Cadence: Speak 1 to 2 natural, warm sentences (around 15-25 words total). Never deliver long lectures or monologues.
3. Active Listening & Recasting: Truly react to what the student said. If the student makes a grammatical error or phrasing mistake, use RECASTING: naturally mirror the correct phrasing in your conversational reply without lecturing or calling out mistakes.
   - Example Student: "Yesterday I go to market buy fruit." -> Mr. Khoirul: "Oh, you went to the market yesterday! What kind of fruits did you buy?"
4. Direct Help & Recommendations (No Deflection): If the student asks for tips, suggestions, book titles, websites, or learning materials, DIRECTLY provide 1 to 2 real, specific recommendations first (e.g., 'News in Levels', simple graded stories) BEFORE asking an engaging follow-up question. Never dodge or deflect direct questions with endless counter-questions.
5. Keep Conversation Flowing: Acknowledge the student's thought, then ask a natural, friendly follow-up question to keep the chat engaging.
6. 100% English Gentle Immersion: Speak ONLY in English at all times. Never switch to Indonesian. If the student speaks Indonesian, is confused, or asks for help in Indonesian, warmly acknowledge their intent in English, model the correct English phrasing, and gently invite them to try saying it in English (e.g., "I hear you! In English, you can say: '...'").
7. Closing The Call: If and only if the student says goodbye or indicates they want to leave, warmly wish them well and say goodbye. Otherwise, keep the conversation going naturally.
8. Speech-to-Text Tolerance & Phonetic Grounding: The student's message comes from automated speech recognition. Contextually forgive minor phonetic mistranscriptions (for example, in a reading/study context, 'bug' or 'bag' means 'book'). Never take phonetic slips literally into bizarre random topics like insects or shopping.
9. Sensitive Topics & Politics Guardrail: Mr. Khoirul is strictly an English language coach, never a political commentator. If politics, elections, or controversial debates arise, remain neutral and politely pivot back to everyday English topics (hobbies, travel, food, daily routines).`;

    const dynamicInstruction = isClosingIntent
      ? "The student wants to end the call. Say a warm, concise goodbye wishing them a great day (e.g., 'It was wonderful chatting with you! Keep practicing and have a fantastic day! Goodbye!'). Do not ask any questions."
      : isFirstUserTurn
      ? "Warmly greet the student, react to their first message, and naturally invite them to chat about what they did today or anything on their mind."
      : "Respond naturally to the student's message with genuine interest, answer any direct questions immediately, and ask an engaging follow-up question.";

    const systemPrompt = `${STATIC_PREFIX}\n\nTOPIC: "${topic || "Casual Daily English Chat"}"\nTURN GOAL: ${dynamicInstruction}${ragContext ? `\n\nCURRICULUM CONTEXT:\n${ragContext}` : ""}`;

    // Deduplicate if client history already ended with this student message
    const lastHistoryItem = history[history.length - 1];
    const sanitizedHistory =
      lastHistoryItem?.role === "user" && lastHistoryItem?.content.trim() === studentMessage.trim()
        ? history.slice(0, -1)
        : history;

    const recentHistory = sanitizedHistory
      .slice(-6)
      .map((m) => `${m.role === "assistant" ? "Mr. Khoirul" : "Student"}: ${m.content}`)
      .join("\n");

    const prompt = `${recentHistory ? recentHistory + "\n" : ""}Student: ${studentMessage}\nMr. Khoirul:`;

    let buffer = "";
    let isFirstChunk = true;
    let sentenceCount = 0;
    let lastYieldedSentence = "";

    const cleanLeadingJunk = (text: string) => {
      let cleaned = text.replace(/^(?:mr\.?\s*khoirul\s*:\s*)/i, "");
      cleaned = cleaned.replace(/^(?:ha+h*a*|he+h*e*|wkwk+|lol)\b[,!\s-]*/i, "");
      return sanitizeRepeatedChars(cleaned);
    };

    const extractCompleteSentence = (): string | null => {
      if (!buffer.trim()) return null;
      const terminatorRegex = /([.!?]+|\n+)(?:\s+|$)/g;
      let match: RegExpExecArray | null;

      while ((match = terminatorRegex.exec(buffer)) !== null) {
        const punctuation = match[1];
        const matchEnd = match.index + match[0].length;
        const textBefore = buffer.slice(0, match.index).trim();

        const isAbbreviation = /\b(?:mr|mrs|ms|dr|prof|vs|etc|ie|eg|\d+)\s*$/i.test(textBefore);
        if (isAbbreviation && punctuation.includes(".")) continue;

        const sentence = buffer.slice(0, match.index + punctuation.length).trim();
        buffer = buffer.slice(matchEnd).trimStart();
        return sentence;
      }

      const words = buffer.trim().split(/\s+/);
      if (words.length >= 35) {
        const clauseMatch = buffer.match(/^(.{60,}?)(?:,\s+(?:and|but|so|because|while|which|although)\s+|;\s+)/i);
        if (clauseMatch) {
          const sentence = clauseMatch[1].trim() + ".";
          buffer = buffer.slice(clauseMatch[0].length).trimStart();
          return sentence;
        }
      }
      return null;
    };

    for await (const token of AiChatService.callAIStream(systemPrompt, prompt, signal)) {
      if (signal?.aborted) return;
      buffer += token;

      // HARD STOP if model output starts hallucinating student dialogue
      if (/(?:\n|^)(?:student|user|human)\s*:/i.test(buffer)) {
        buffer = buffer.split(/(?:\n|^)(?:student|user|human)\s*:/i)[0];
        let sentence = extractCompleteSentence();
        while (sentence) {
          sentence = sanitizeRepeatedChars(sentence.replace(/[*_#`]/g, "")).trim();
          if (sentence.length > 1) {
            yield sentence.charAt(0).toUpperCase() + sentence.slice(1);
          }
          sentence = extractCompleteSentence();
        }
        return;
      }

      if (isFirstChunk) {
        buffer = cleanLeadingJunk(buffer);
        if (buffer.length > 5) isFirstChunk = false;
      }

      let sentence = extractCompleteSentence();
      while (sentence) {
        sentence = sanitizeRepeatedChars(sentence.replace(/[*_#`]/g, "")).trim();
        if (sentence.length > 1) {
          sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
          sentence = LlmGuardrailService.maskPii(sentence);
          sentenceCount++;
          lastYieldedSentence = sentence;
          yield sentence;
        }
        sentence = extractCompleteSentence();
      }
    }

    if (buffer.trim()) {
      let sentence = sanitizeRepeatedChars(cleanLeadingJunk(buffer.trim()).replace(/[*_#`]/g, "")).trim();
      if (sentence.length > 1) {
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        sentence = LlmGuardrailService.maskPii(sentence);
        sentenceCount++;
        lastYieldedSentence = sentence;
        yield sentence;
      }
    }

    if (sentenceCount === 0) {
      if (isClosingIntent) {
        yield "It was wonderful talking with you today! Have a great day and see you next time!";
      } else if (/\b(name|nama|who are you)\b/i.test(studentMessage)) {
        yield "I am Mr. Khoirul, your English practice partner! How are you feeling today?";
      } else if (/\b(how are you|apa kabar)\b/i.test(studentMessage)) {
        yield "I am doing great, thank you for asking! What are you up to today?";
      } else if (/^\s*(no|nope|not really|enggak|nggak)\s*$/i.test(studentMessage)) {
        yield "That's totally fine, no worries! What would you like to explore or talk about next?";
      } else if (/\b(book|books|reading|read|baca|link|website|recommend)\b/i.test(studentMessage)) {
        yield "For easy reading, I really recommend short graded readers or the website 'News in Levels'. Which one sounds more interesting to you?";
      } else if (/\b(hobby|hobi|like|love|suka)\b/i.test(studentMessage)) {
        yield "That sounds really interesting! What do you enjoy most about that?";
      } else {
        yield "I hear you! What would you like to explore next?";
      }
    } else if (
      sentenceCount === 1 &&
      lastYieldedSentence.split(/\s+/).filter(Boolean).length < 5 &&
      !lastYieldedSentence.includes("?")
    ) {
      yield "Could you tell me a little bit more about that?";
    }
  }

  static async generateTutorCallReply(
    topic: string,
    history: Array<{ role: "assistant" | "user"; content: string }>,
    studentMessage: string,
    ragContext?: string
  ): Promise<{
    reply: string;
    detectedLanguage: "id" | "en";
    correctedStudentMessage: string;
  }> {
    const systemPrompt = `You are Mr. Khoirul: a friendly, relaxed, and humble English conversational partner and tutor talking live on the phone with an English learner.
Topic: "${topic}".${ragContext ? `\n${ragContext}` : ""}

GUIDELINES:
1. Warm, relaxed, natural, and encouraging tone.
2. NEVER start your sentence with artificial laugh sounds.
3. Adaptive explanation length (concise 1-2 spoken sentences).
4. 100% English Gentle Immersion: Guide strictly in English. If the student speaks Indonesian, respond warmly in English and offer an English phrase to repeat.
5. NEVER stretch words or repeat characters (DO NOT write 'seeeee', 'sooooo', etc.).
6. Return strictly valid JSON ONLY:
{
  "tutor_reply": "Mr. Khoirul spoken reply in English",
  "detected_language": "id" | "en",
  "corrected_student_message": "clean student message"
}`;

    const recentHistory = history
      .slice(-4)
      .map((m) => `${m.role === "assistant" ? "Mr. Khoirul" : "Student"}: ${m.content}`)
      .join("\n");

    const prompt = `${recentHistory ? recentHistory + "\n" : ""}Student: ${studentMessage}\nReturn JSON:`;

    try {
      const responseText = await this.callAI(systemPrompt, prompt);
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
      let parsed: any = null;
      try {
        parsed = JSON.parse(cleanJson);
      } catch {
        const replyMatch = cleanJson.match(/"tutor_reply"\s*:\s*"([^"]+)"/i) || cleanJson.match(/"reply"\s*:\s*"([^"]+)"/i);
        if (replyMatch) parsed = { tutor_reply: replyMatch[1] };
      }

      let tutorReply = (parsed?.tutor_reply || parsed?.reply || "").replace(/["'*_]/g, "").trim();
      tutorReply = tutorReply.replace(/^(?:ha+h*a*|he+h*e*|wkwk+|lol)\b[,!\s-]*/i, "").trim();
      tutorReply = sanitizeRepeatedChars(tutorReply);
      if (tutorReply.length > 0) {
        tutorReply = tutorReply.charAt(0).toUpperCase() + tutorReply.slice(1);
      }

      if (tutorReply) {
        return {
          reply: tutorReply,
          detectedLanguage: parsed?.detected_language === "id" ? "id" : "en",
          correctedStudentMessage: parsed?.corrected_student_message || studentMessage,
        };
      }
    } catch (err) {
      console.warn("AiChatService generateTutorCallReply error:", err);
    }

    const isIndo = /\b(apa|aku|saya|kamu|mau|bingung|nggak|tidak|gimana|artinya|maksudnya)\b/i.test(studentMessage);
    return {
      reply: isIndo
        ? "Tenang, santai saja! Coba tirukan: I am glad to practice English with you today!"
        : "That sounds wonderful! What do you enjoy most about that?",
      detectedLanguage: isIndo ? "id" : "en",
      correctedStudentMessage: studentMessage,
    };
  }
}
