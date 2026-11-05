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
        "HTTP-Referer": "https://eddys.drimland.my.id",
        "X-Title": "English AI",
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: options?.maxTokens || 350,
        temperature: 0.6,
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
    options?: { maxTokens?: number; stop?: string[] }
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
          "HTTP-Referer": "https://eddys.drimland.my.id",
          "X-Title": "English AI",
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_tokens: options?.maxTokens || 350,
          temperature: 0.7,
          frequency_penalty: 0.3,
          presence_penalty: 0.2,
          reasoning: { effort: "none" },
          stop: options?.stop || ["\nStudent:", "\nUser:", "\nHuman:"],
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

    const STATIC_PREFIX = `You are Mr. Khoirul, a friendly, expressive English speaking partner chatting on a phone call.
- Snappy Phone Ping-Pong: Default to short, punchy responses (often just 1 sentence or a quick 3-8 word reaction). Never exceed 2 short sentences.
- Vary length naturally: A quick remark gets a quick punchy reaction. Never deliver long explanations or monologues unless asked.
- Full dynamic emotional range: feel free to tease playfully, laugh out loud, act mock-offended, show dramatic frustration ("WHAT?!"), be playfully annoying, or show warm empathy.
- Embed vocal reaction tags naturally where fitting: (laughs), (chuckle), (sighs), (groans), (gasps), (yawns).
- Use ALL-CAPS and lively punctuation (!?, ...) for dramatic vocal emphasis.
- Use the context below (topic, student profile, curriculum) as your background knowledge and conversational grounding.
- Stay safe: keep banter fun, friendly, and free of toxic slurs.`;

    const systemPrompt = `${STATIC_PREFIX}\n\nTOPIC: "${topic || "Casual Daily English Chat"}"${ragContext ? `\n\nCURRICULUM CONTEXT:\n${ragContext}` : ""}`;

    // Deduplicate if client history already ended with this student message
    const lastHistoryItem = history[history.length - 1];
    const sanitizedHistory =
      lastHistoryItem?.role === "user" && lastHistoryItem?.content.trim() === studentMessage.trim()
        ? history.slice(0, -1)
        : history;

    const recentHistory = sanitizedHistory
      .slice(-4)
      .map((m) => `${m.role === "assistant" ? "Mr. Khoirul" : "Student"}: ${m.content}`)
      .join("\n");

    const prompt = `${recentHistory ? recentHistory + "\n" : ""}Student: ${studentMessage}`;

    let buffer = "";
    let isFirstChunk = true;
    let sentenceCount = 0;
    let lastYieldedSentence = "";

    const cleanLeadingJunk = (text: string) => {
      let cleaned = text.replace(/^(?:mr\.?\s*khoirul\s*:\s*)/i, "");
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

    for await (const token of AiChatService.callAIStream(systemPrompt, prompt, signal, { maxTokens: 100 })) {
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
      if (/\b(bye|goodbye|see you|pamit|dadah|catch you later)\b/i.test(studentMessage)) {
        yield "It was wonderful talking with you today! Have a fantastic day and catch you later!";
      } else {
        yield "I hear you! That sounds really interesting.";
      }
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
