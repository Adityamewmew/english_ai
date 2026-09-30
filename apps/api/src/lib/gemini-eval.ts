import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { GeminiChatService } from "./gemini-chat";

/**
 * Gemini Assessment & Evaluation Service
 */
export class GeminiEvalService {
  private static getSystemPrompt(): string {
    const baseDir = (import.meta as any).dir || process.cwd();
    const promptPath = path.resolve(baseDir, "../../prompts/eval_prompt.txt");
    if (fs.existsSync(promptPath)) return fs.readFileSync(promptPath, "utf8");
    const fallbackPath = path.resolve(process.cwd(), "prompts/eval_prompt.txt");
    if (fs.existsSync(fallbackPath)) return fs.readFileSync(fallbackPath, "utf8");
    return "You are an expert CEFR English language evaluator.";
  }

  private static getAnchors(): string {
    const baseDir = (import.meta as any).dir || process.cwd();
    const anchorsPath = path.resolve(baseDir, "../../prompts/cefr_anchors.json");
    if (fs.existsSync(anchorsPath)) return fs.readFileSync(anchorsPath, "utf8");
    const fallbackPath = path.resolve(process.cwd(), "prompts/cefr_anchors.json");
    if (fs.existsSync(fallbackPath)) return fs.readFileSync(fallbackPath, "utf8");
    return "";
  }

  static async evaluateWriting(text: string): Promise<any> {
    const prompt = `Grade the following student writing response using CEFR standards:\n\nFew-shot Calibration Anchors:\n${GeminiEvalService.getAnchors()}\n\nStudent Response:\n"${text}"\n\nOutput strictly valid JSON according to schema.`;
    const responseText = await GeminiChatService.callAI(GeminiEvalService.getSystemPrompt(), prompt);
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  }

  static async evaluateConversation(
    topic: string,
    transcript: string,
    durationSeconds: number,
    ragContext?: string
  ): Promise<any> {
    const systemPrompt = `You are an official IELTS & CEFR Speaking Examiner for EDDY'S AI.
${ragContext ? `${ragContext}\n\n` : ""}Analyze the conversation session and return JSON ONLY with exact format:
{
  "fluency": 1.0-9.0,
  "lexical": 1.0-9.0,
  "grammar": 1.0-9.0,
  "pronunciation": 1.0-9.0,
  "overallBand": 1.0-9.0,
  "cefr": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "feedback_id": "Catatan evaluasi ramah dalam Bahasa Indonesia oleh Mr. Khoirul (2-3 kalimat memberi motivasi dan saran perbaikan)",
  "feedback_en": "Constructive feedback in English (2 sentences)",
  "student_facts": [
    "List of any personal facts, activities, food/meals, pets, family, hobbies, jobs, opinions, or life stories the student mentioned in this call. Return empty array [] if none."
  ]
}`;

    const prompt = `Topic: "${topic}"\nDuration: ${durationSeconds} seconds\nTranscript/Notes:\n"${transcript}"\n\nProvide the assessment now in valid JSON only.`;
    const responseText = await GeminiChatService.callAI(systemPrompt, prompt);
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  }

  static async transcribeAudioSelfIntro(base64Audio: string, mimeType: string = "audio/webm"): Promise<string> {
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
    const modelName = process.env.GEMINI_EVAL_MODEL || "gemini/gemini-3-flash-preview";

    let format = "webm";
    if (mimeType.includes("mp3")) format = "mp3";
    else if (mimeType.includes("wav")) format = "wav";
    else if (mimeType.includes("ogg")) format = "ogg";
    else if (mimeType.includes("mp4") || mimeType.includes("m4a")) format = "mp4";

    const systemPrompt = `You are Mr. Khoirul's AI speaking transcriber for Indonesian students learning English.
The student recorded an English self-introduction.
YOUR TASK:
1. Listen carefully to the student's audio.
2. Transcribe what they said accurately into coherent English sentences.
3. Accurately preserve Indonesian proper nouns (e.g. Indonesian names and regions).
4. Recognize spoken English words naturally.
5. Return ONLY the final clean transcribed English sentences. No preamble, no quotes, no markdown.`;

    if (baseUrl) {
      const transcribeModels = Array.from(new Set([modelName, "gemini/gemini-3-flash-preview"]));
      for (const m of transcribeModels) {
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
              messages: [
                { role: "system", content: systemPrompt },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Transcribe and format this student's English self-introduction audio accurately:" },
                    {
                      type: "input_audio",
                      input_audio: {
                        data: base64Audio,
                        format,
                      },
                    },
                  ],
                },
              ],
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (res.ok) {
            const data = (await res.json()) as any;
            const rawContent = data.choices?.[0]?.message?.content;
            let text = "";
            if (typeof rawContent === "string") {
              text = rawContent;
            } else if (Array.isArray(rawContent)) {
              text = rawContent.map((c: any) => c.text || "").join(" ");
            }
            text = text.replace(/```[a-z]*\n?|\n?```/gi, "").trim();
            if (text.length > 0) return text;
          }
        } catch (proxyErr: any) {
          console.warn(`Proxy transcribe audio [${m}] error:`, proxyErr?.message || proxyErr);
        }
      }
    }

    const directKey = process.env.GEMINI_API_KEY;
    if (directKey && directKey.trim().length > 10) {
      const cleanMime = mimeType.split(";")[0].trim();
      const fallbackModels = ["gemini-3.6-flash", "gemini-3.7-flash"];

      for (const modelId of fallbackModels) {
        try {
          const directGenAI = new GoogleGenerativeAI(directKey);
          const model = directGenAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt,
          });

          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: cleanMime,
                data: base64Audio,
              },
            },
            "Transcribe this English self-introduction audio accurately into clean English sentences.",
          ]);

          const text = result.response.text().trim();
          if (text && text.length > 0) return text;
        } catch (sdkErr: any) {
          console.warn(`Direct Google Gemini [${modelId}] transcribe error:`, sdkErr?.message || sdkErr);
        }
      }
    }

    return "";
  }

  static async transcribeAudioSpeakingLab(
    base64Audio: string,
    mimeType: string = "audio/webm",
    targetText?: string
  ): Promise<string> {
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
    const modelName = process.env.GEMINI_EVAL_MODEL || "gemini/gemini-3-flash-preview";

    let format = "webm";
    if (mimeType.includes("mp3")) format = "mp3";
    else if (mimeType.includes("wav")) format = "wav";
    else if (mimeType.includes("ogg")) format = "ogg";
    else if (mimeType.includes("mp4") || mimeType.includes("m4a")) format = "mp4";

    const targetSnippet = targetText ? `Target Reference Sentence: "${targetText}"\n` : "";
    const systemPrompt = `You are Mr. Khoirul's expert bilingual (Indonesian - English) speech transcriber for Indonesian students practicing spoken English.
The student is practicing English pronunciation.
${targetSnippet}
CRITICAL TRANSCRIPTION RULES:
1. Listen carefully to the student's actual audio articulation.
2. Indonesian learners often start words softly or pronounce 'We' (/wiː/) gently. Do NOT mistake 'We' for 'You', 'They', or 'He'. If the student articulated /wiː/, accurately transcribe "We".
3. Transcribe only what the student actually spoke. If they clearly mispronounced or substituted a word, transcribe what was truly articulated.
4. Do NOT hallucinate words that were not spoken.
5. Return ONLY the clean transcribed English sentence/words. No preamble, no quotation marks, no markdown explanations.`;

    if (baseUrl) {
      const transcribeModels = Array.from(new Set([modelName, "gemini/gemini-3-flash-preview"]));
      for (const m of transcribeModels) {
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
              messages: [
                { role: "system", content: systemPrompt },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Transcribe this Indonesian student's spoken English audio accurately.${targetText ? ` Target was: "${targetText}".` : ""}`,
                    },
                    {
                      type: "input_audio",
                      input_audio: {
                        data: base64Audio,
                        format,
                      },
                    },
                  ],
                },
              ],
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (res.ok) {
            const data = (await res.json()) as any;
            const rawContent = data.choices?.[0]?.message?.content;
            let text = "";
            if (typeof rawContent === "string") {
              text = rawContent;
            } else if (Array.isArray(rawContent)) {
              text = rawContent.map((c: any) => c.text || "").join(" ");
            }
            text = text.replace(/```[a-z]*\n?|\n?```/gi, "").replace(/^["']|["']$/g, "").trim();
            if (text.length > 0) return text;
          }
        } catch (proxyErr: any) {
          console.warn(`Proxy transcribe SpeakingLab audio [${m}] error:`, proxyErr?.message || proxyErr);
        }
      }
    }

    const directKey = process.env.GEMINI_API_KEY;
    if (directKey && directKey.trim().length > 10) {
      const cleanMime = mimeType.split(";")[0].trim();
      const fallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

      for (const modelId of fallbackModels) {
        try {
          const directGenAI = new GoogleGenerativeAI(directKey);
          const model = directGenAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt,
          });

          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: cleanMime,
                data: base64Audio,
              },
            },
            `Transcribe this spoken English audio accurately.${targetText ? ` Target sentence was: "${targetText}".` : ""}`,
          ]);

          let text = result.response.text().replace(/^["']|["']$/g, "").trim();
          if (text && text.length > 0) return text;
        } catch (sdkErr: any) {
          console.warn(`Direct Google Gemini [${modelId}] transcribe SpeakingLab error:`, sdkErr?.message || sdkErr);
        }
      }
    }

    return "";
  }

  static async evaluateSpeakingSelfIntro(transcript: string): Promise<any> {
    const systemPrompt = `You are Mr. Khoirul, personal English tutor & CEFR Speaking Evaluator at EDDY'S AI.
Your task is to analyze the student's spoken self-introduction based on official CEFR descriptors and calibration anchors.

STUDENT PROFILE & CONTEXT:
The student is an Indonesian native speaker introducing themselves.
CRITICAL RULES:
- DO NOT treat Indonesian names or local city/district names as grammar mistakes!
- Focus your evaluation strictly on English grammar accuracy, verb forms, sentence structure, and vocabulary.

Analyze the student's transcript and return valid JSON ONLY with this exact schema:
{
  "cefr": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "score_0_100": 0-100,
  "criteria": {
    "grammar": 1.0-5.0,
    "vocabulary": 1.0-5.0,
    "fluency": 1.0-5.0,
    "coherence": 1.0-5.0
  },
  "grammar_analysis": {
    "strengths": ["contoh struktur kalimat yang sudah benar digunakan siswa"],
    "corrections": [
      {
        "said": "kalimat asli yang diucapkan siswa",
        "better": "saran perbaikan grammar yang lebih tepat dan natural",
        "explanation": "penjelasan singkat dan mudah dipahami dalam Bahasa Indonesia"
      }
    ]
  },
  "feedback_id": "Ulasan ramah dalam Bahasa Indonesia oleh Mr. Khoirul (2-3 kalimat)",
  "feedback_en": "Encouraging feedback in English (2 sentences)"
}`;

    const prompt = `Student Spoken Self-Introduction Transcript:\n"${transcript}"\n\nEvaluate grammar, vocabulary, fluency, and CEFR level now according to the benchmark. Output JSON only.`;

    try {
      const responseText = await GeminiChatService.callAI(systemPrompt, prompt);
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error("Gemini evaluateSpeakingSelfIntro error:", err);
      return {
        cefr: "A2",
        score_0_100: 50,
        criteria: { grammar: 3.0, vocabulary: 3.0, fluency: 3.0, coherence: 3.0 },
        grammar_analysis: {
          strengths: ["Kalimat perkenalan tersampaikan dengan jelas"],
          corrections: [],
        },
        feedback_id: "Perkenalanmu sudah terdengar baik dan berani! Terus latih kelancaran dan tata bahasamu.",
        feedback_en: "Great effort in introducing yourself! Keep practicing to improve accuracy and fluency.",
      };
    }
  }
}
