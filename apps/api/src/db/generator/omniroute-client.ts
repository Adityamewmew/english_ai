export interface OmniRouteChatOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

export const OMNIROUTE_REASONING_CHAIN = [
  "auto/best-reasoning",
  "codex/gpt-6-luna",
  "auto/coding:reliable",
  "auto/pro-coding",
  "codex/gpt-6-luna-max",
];

export class OmniRouteClient {
  private baseUrl = (
    process.env.OMNIROUTE_BASE_URL ||
    process.env.AI_TTS_BASE_URL ||
    "https://omni.drimland.my.id/v1"
  ).replace(/\/+$/, "") + "/chat/completions";

  private apiKey =
    process.env.OMNIROUTE_API_KEY ||
    process.env.AI_TTS_API_KEY ||
    "sk-8a1c8c009c8af9a0-15746f-4c9a4a96";

  private models: string[];

  constructor(options?: {
    apiKey?: string;
    defaultModel?: string;
    baseUrl?: string;
    models?: string[];
  }) {
    if (options?.apiKey) this.apiKey = options.apiKey;
    if (options?.baseUrl) this.baseUrl = options.baseUrl;

    if (options?.models && options.models.length > 0) {
      this.models = options.models;
    } else if (options?.defaultModel) {
      this.models = [
        options.defaultModel,
        ...OMNIROUTE_REASONING_CHAIN.filter((m) => m !== options.defaultModel),
      ];
    } else {
      this.models = [...OMNIROUTE_REASONING_CHAIN];
    }
  }

  async generateJson<T>(
    systemPrompt: string,
    userPrompt: string,
    options: OmniRouteChatOptions = {}
  ): Promise<T> {
    const temperature = options.temperature ?? 0.35;
    const timeoutMs = options.timeoutMs ?? 50000; // 50s per attempt
    const modelList = options.model
      ? [options.model, ...this.models.filter((m) => m !== options.model)]
      : this.models;

    let lastError: Error | null = null;
    let feedback = "";

    // Loop through fallback models
    for (let mIdx = 0; mIdx < modelList.length; mIdx++) {
      const currentModel = modelList[mIdx];
      const maxRetriesPerModel = 2;

      for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
        let abortTimeout: any = null;
        try {
          console.log(
            `    🤖 OmniRoute [Model: ${currentModel} | Attempt ${attempt}/${maxRetriesPerModel}]...`
          );

          const messages: Array<{ role: string; content: string }> = [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: feedback
                ? `${userPrompt}\n\nIMPORTANT: Previous attempt failed with JSON parse error: ${feedback}. Return ONLY valid, complete JSON without markdown fences.`
                : userPrompt,
            },
          ];

          const controller = new AbortController();
          abortTimeout = setTimeout(() => {
            controller.abort(new Error(`Timeout after ${timeoutMs / 1000}s`));
          }, timeoutMs);

          const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: currentModel,
              messages,
              temperature,
            }),
            signal: controller.signal,
          });

          clearTimeout(abortTimeout);

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`OmniRoute error (${res.status}): ${errText}`);
          }

          const data = (await res.json()) as any;
          const rawContent = data?.choices?.[0]?.message?.content || "";

          const cleaned = this.extractJsonString(rawContent);
          const parsed = JSON.parse(cleaned) as T;
          return parsed;
        } catch (err: any) {
          if (abortTimeout) clearTimeout(abortTimeout);
          lastError = err;
          feedback = err.message;
          console.warn(
            `    ⚠️ [${currentModel}] Attempt ${attempt} failed: ${err.message.slice(0, 160)}`
          );

          // If rate limited, cooldown, 400, 403, or timeout, immediately switch to next model!
          const isFatalForModel =
            err.name === "AbortError" ||
            err.message.includes("Timeout") ||
            err.message.includes("429") ||
            err.message.includes("403") ||
            err.message.includes("400") ||
            err.message.includes("cooldown") ||
            err.message.includes("reset after");

          if (isFatalForModel) {
            console.log(
              `    🔄 Model ${currentModel} limit/timeout. Auto-switching to next model in chain...`
            );
            break; // Skip to next model
          }

          await new Promise((r) => setTimeout(r, 1200 * attempt));
        }
      }
    }

    throw new Error(
      `All models in chain failed to generate valid JSON: ${lastError?.message}`
    );
  }

  private extractJsonString(raw: string): string {
    let text = raw.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else {
      startIdx = Math.max(firstBrace, firstBracket);
    }

    if (startIdx !== -1) {
      const lastBrace = text.lastIndexOf("}");
      const lastBracket = text.lastIndexOf("]");
      const endIdx = Math.max(lastBrace, lastBracket);
      if (endIdx > startIdx) {
        text = text.substring(startIdx, endIdx + 1);
      }
    }

    return text.trim();
  }
}
