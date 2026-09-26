import { GoogleGenerativeAI } from "@google/generative-ai";

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
 * Gemini Chat & Conversational Streaming Service
 */
export class GeminiChatService {
  /**
   * Universal AI caller: prioritizes fast proxy models
   */
  static async callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
    const primaryModel =
      process.env.AI_CHAT_MODEL ||
      "gemini/gemini-3.1-flash-lite";

    const proxyModels = Array.from(
      new Set([
        primaryModel,
        "gemini/gemini-3.1-flash-lite",
        "antigravity/gemini-3.7-flash-low",
        "gemini/gemini-2.5-flash-lite",
        "antigravity/gemini-3.7-flash-high",
      ])
    );

    if (baseUrl) {
      for (const m of proxyModels) {
        try {
          const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: m,
              stream: false,
              max_tokens: 800,
              temperature: 0.6,
              frequency_penalty: 0.3,
              presence_penalty: 0.2,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
            signal: AbortSignal.timeout(12000),
          });

          if (res.ok) {
            const data = (await res.json()) as any;
            const content = data.choices?.[0]?.message?.content;
            if (
              content &&
              !content.toLowerCase().includes("i'm kiro") &&
              !content.toLowerCase().includes("i am kiro") &&
              !content.toLowerCase().includes("cannot roleplay") &&
              !content.toLowerCase().includes("testing my boundaries") &&
              !content.toLowerCase().includes("development environment")
            ) {
              return content;
            }
          } else {
            const errText = await res.text();
            console.warn(`AI Proxy [${m}] (${res.status}): ${errText}`);
          }
        } catch (proxyErr: any) {
          console.warn(`AI Proxy [${m}] error:`, proxyErr?.message || proxyErr);
        }
      }
    }

    const directKey = process.env.GEMINI_API_KEY;
    if (directKey && directKey.trim().length > 10) {
      const sdkFallbackModels = ["gemini-3.7-flash", "gemini-3.6-flash"];
      for (const m of sdkFallbackModels) {
        try {
          const directGenAI = new GoogleGenerativeAI(directKey);
          const model = directGenAI.getGenerativeModel({
            model: m,
            systemInstruction: systemPrompt,
          });
          const result = await model.generateContent(userPrompt);
          const text = result.response.text();
          if (text) return text;
        } catch (err: any) {
          console.warn(`Direct Google Gemini [${m}] error:`, err?.message || err);
        }
      }
    }

    throw new Error("All configured AI models failed to respond. Check proxy at " + (baseUrl || "none"));
  }

  /**
   * Universal AI Stream caller: streams tokens from fast proxy models
   */
  static async *callAIStream(
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
    const primaryModel =
      process.env.AI_CHAT_MODEL ||
      "gemini/gemini-3.1-flash-lite";

    const proxyModels = Array.from(
      new Set([
        primaryModel,
        "gemini/gemini-3.1-flash-lite",
        "antigravity/gemini-3.7-flash-low",
        "gemini/gemini-2.5-flash-lite",
        "antigravity/gemini-3.7-flash-high",
      ])
    );

    if (baseUrl) {
      for (const m of proxyModels) {
        let hasYielded = false;
        try {
          const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: m,
              stream: true,
              max_tokens: 800,
              temperature: 0.6,
              frequency_penalty: 0.3,
              presence_penalty: 0.2,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
            signal,
          });

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
                    hasYielded = true;
                    yield token;
                  }
                } catch {}
              }
            }
            if (hasYielded) return;
          }
        } catch (proxyErr: any) {
          if (signal?.aborted) return;
          if (hasYielded) return;
          console.warn(`AI Stream Proxy [${m}] error:`, proxyErr?.message || proxyErr);
        }
      }
    }

    const directKey = process.env.GEMINI_API_KEY;
    if (directKey && directKey.trim().length > 10) {
      const sdkFallbackModels = ["gemini-3.7-flash", "gemini-3.6-flash"];
      for (const m of sdkFallbackModels) {
        try {
          const directGenAI = new GoogleGenerativeAI(directKey);
          const model = directGenAI.getGenerativeModel({
            model: m,
            systemInstruction: systemPrompt,
          });
          const resultStream = await model.generateContentStream(userPrompt);
          for await (const chunk of resultStream.stream) {
            if (signal?.aborted) return;
            const text = chunk.text();
            if (text) yield text;
          }
          return;
        } catch (err: any) {
          if (signal?.aborted) return;
          console.warn(`Direct Google Gemini Stream [${m}] error:`, err?.message || err);
        }
      }
    }
  }

  /**
   * Sentence boundary generator
   */
  static async *streamTutorSentences(
    topic: string,
    history: Array<{ role: "assistant" | "user"; content: string }>,
    studentMessage: string,
    ragContext?: string,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    const systemPrompt = `You are Mr. Khoirul: a friendly, relaxed, and humble English conversational partner and tutor talking live on the phone with an Indonesian student.
Topic: "${topic}".${ragContext ? `\n${ragContext}` : ""}

GUIDELINES:
1. Warm, relaxed, natural, and encouraging tone (santai & humble).
2. NEVER start your sentence with "Haha", "Hehe", or artificial laugh sounds.
3. ADAPTIVE LENGTH & DETAILED EXPLANATIONS:
   - When the student asks to explain something, tell a story, asks about a character, topic, or movie, provide a RICH, COMPLETE, and ENGAGING explanation (3 to 6 spoken sentences).
   - When the student gives a brief check-in or simple answer, keep it natural and balanced (1 to 2 sentences).
   - Conclude naturally with an engaging open-ended question to keep the conversation flowing.
4. If student speaks Indonesian or is confused, guide briefly in Indonesian, then give ONE simple English sentence they can repeat.
5. If student asks about past memory, warmly and accurately acknowledge it from context.
6. Speak directly as Mr. Khoirul in plain conversational spoken English.
7. Dive straight into your genuine substantive response immediately without fake filler openings.
8. Keep your very first sentence concise and punchy (around 5-10 words).
9. Output only the spoken words directly.
10. CRITICAL: NEVER stretch words, repeat characters, or stutter (NEVER write 'seeeee', 'sooooo', 'heyyy', 'ummmm', 'hmmmm'). Write proper standard dictionary spelling only.
11. CRITICAL: NEVER output only a 1-2 word filler acknowledgement (like "I see.", "Okay.", "Got it."). You MUST ALWAYS follow up with a genuine thought and an engaging question.`;

    const recentHistory = history
      .slice(-4)
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

    for await (const token of GeminiChatService.callAIStream(systemPrompt, prompt, signal)) {
      if (signal?.aborted) return;
      buffer += token;

      if (isFirstChunk) {
        buffer = cleanLeadingJunk(buffer);
        if (buffer.length > 5) isFirstChunk = false;
      }

      let sentence = extractCompleteSentence();
      while (sentence) {
        sentence = sanitizeRepeatedChars(sentence.replace(/[*_#`]/g, "")).trim();
        if (sentence.length > 1) {
          sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
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
        sentenceCount++;
        lastYieldedSentence = sentence;
        yield sentence;
      }
    }

    if (sentenceCount === 0) {
      yield "That sounds wonderful! What do you enjoy most about that?";
    } else if (
      sentenceCount === 1 &&
      lastYieldedSentence.split(/\s+/).filter(Boolean).length < 4 &&
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
    const systemPrompt = `You are Mr. Khoirul: a friendly, relaxed, and humble English conversational partner and tutor talking live on the phone with an Indonesian student.
Topic: "${topic}".${ragContext ? `\n${ragContext}` : ""}

GUIDELINES:
1. Warm, relaxed, natural, and encouraging tone (santai & humble).
2. NEVER start your sentence with artificial laugh sounds.
3. Adaptive explanation length.
4. Guide in Indonesian if confused, then offer an English sentence to repeat.
5. NEVER stretch words or repeat characters (DO NOT write 'seeeee', 'sooooo', etc.).
6. Return strictly valid JSON ONLY:
{
  "tutor_reply": "ucapan Mr. Khoirul",
  "detected_language": "id" | "en",
  "corrected_student_message": "kalimat bersih siswa"
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
      console.warn("Gemini generateTutorCallReply error:", err);
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
