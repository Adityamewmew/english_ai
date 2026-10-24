import { AppError } from "../common/errors/app-error";

export interface OmniRouteChatOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

export const OMNIROUTE_REASONING_CHAIN = [
  "antigravity/gemini-3.8-flash-tiered",
  "antigravity/gemini-3-flash",
  "codex/gpt-6-luna",
  "codex/gpt-6-luna-max",
  "codex/gpt-5.6-luna",
];

export class OmniRouteClient {
  private baseUrl: string;
  private apiKey: string;
  private models: string[];

  constructor(options?: {
    apiKey?: string;
    defaultModel?: string;
    baseUrl?: string;
    models?: string[];
  }) {
    const rawBaseUrl =
      options?.baseUrl ||
      process.env.OMNIROUTE_BASE_URL ||
      process.env.AI_TTS_BASE_URL ||
      "https://omni.drimland.my.id/v1";

    this.baseUrl = rawBaseUrl.replace(/\/+$/, "") + "/chat/completions";

    const resolvedApiKey =
      options?.apiKey ||
      process.env.OMNIROUTE_API_KEY ||
      process.env.AI_TTS_API_KEY;

    if (!resolvedApiKey) {
      throw new AppError(
        "OMNIROUTE_API_KEY atau AI_TTS_API_KEY belum dikonfigurasi di file .env",
        500
      );
    }

    this.apiKey = resolvedApiKey;

    const configuredModel =
      options?.defaultModel ||
      process.env.AI_MODEL ||
      process.env.OMNIROUTE_MODEL;

    if (options?.models && options.models.length > 0) {
      this.models = options.models;
    } else if (configuredModel) {
      this.models = [
        configuredModel,
        ...OMNIROUTE_REASONING_CHAIN.filter((m) => m !== configuredModel),
      ];
    } else {
      this.models = [...OMNIROUTE_REASONING_CHAIN];
    }
  }

  async generateJson<T>(
    systemPrompt: string,
    userPrompt: string | any[],
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

          let userContent: any = userPrompt;
          if (feedback) {
            if (typeof userPrompt === "string") {
              userContent = `${userPrompt}\n\nIMPORTANT: Previous attempt failed with JSON parse error: ${feedback}. Return ONLY valid, complete JSON without markdown fences.`;
            } else if (Array.isArray(userPrompt)) {
              userContent = userPrompt.map((item) =>
                item.type === "text"
                  ? {
                      ...item,
                      text: `${item.text}\n\nIMPORTANT: Previous attempt failed with JSON parse error: ${feedback}. Return ONLY valid, complete JSON without markdown fences.`,
                    }
                  : item
              );
            }
          }

          const messages: Array<{ role: string; content: any }> = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
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
          feedback = err?.message || String(err);
          console.warn(
            `    ⚠️ Attempt ${attempt} failed with ${currentModel}: ${err?.message}`
          );
        }
      }
    }

    throw new AppError(
      `OmniRoute generation failed after all fallback models. Last error: ${lastError?.message}`,
      502
    );
  }

  private extractJsonString(raw: string): string {
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();

    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");

    if (firstBrace === -1 && firstBracket === -1) {
      return cleaned;
    }

    let start = 0;
    let end = cleaned.length;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      const lastBrace = cleaned.lastIndexOf("}");
      if (lastBrace !== -1) end = lastBrace + 1;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      const lastBracket = cleaned.lastIndexOf("]");
      if (lastBracket !== -1) end = lastBracket + 1;
    }

    return cleaned.slice(start, end).trim();
  }
}
