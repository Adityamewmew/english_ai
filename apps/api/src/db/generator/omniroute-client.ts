export interface OmniRouteChatOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
}

export class OmniRouteClient {
  private baseUrl = process.env.AI_BASE_URL ? `${process.env.AI_BASE_URL.replace(/\/+$/, "")}/chat/completions` : "http://localhost:20128/v1/chat/completions";
  private apiKey = process.env.AI_API_KEY || "sk-96f2316f84884524-44ce7a-a0ee3336";
  private defaultModel = "antigravity/claude-opus-4-6-thinking";

  constructor(options?: { apiKey?: string; defaultModel?: string; baseUrl?: string }) {
    if (options?.apiKey) this.apiKey = options.apiKey;
    if (options?.defaultModel) this.defaultModel = options.defaultModel;
    if (options?.baseUrl) this.baseUrl = options.baseUrl;
  }

  async generateJson<T>(
    systemPrompt: string,
    userPrompt: string,
    options: OmniRouteChatOptions = {}
  ): Promise<T> {
    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.5;
    const maxRetries = options.maxRetries ?? 6;

    let lastError: Error | null = null;
    let feedback = "";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`    🤖 OmniRoute request [attempt ${attempt}/${maxRetries}] using ${model}...`);
        
        const messages: Array<{ role: string; content: string }> = [
          { role: "system", content: systemPrompt },
          { role: "user", content: feedback ? `${userPrompt}\n\nIMPORTANT: Previous attempt failed with JSON parse error: ${feedback}. Please return ONLY clean, valid JSON.` : userPrompt }
        ];

        const res = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
          }),
        });

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
        lastError = err;
        feedback = err.message;
        console.warn(`    ⚠️ Attempt ${attempt} failed: ${err.message}`);
        
        const waitSec = this.parseWaitSeconds(err.message);
        if (waitSec > 0) {
          const sleepTime = Math.min(waitSec + 5, 900); // Wait up to 15 mins if provider specifies
          console.log(`    ⏳ Upstream cooldown detected (${waitSec}s). Waiting ${sleepTime}s before retry...`);
          await new Promise((r) => setTimeout(r, sleepTime * 1000));
        } else {
          await new Promise((r) => setTimeout(r, 3000 * attempt));
        }
      }
    }

    throw new Error(`Failed to generate valid JSON after ${maxRetries} attempts: ${lastError?.message}`);
  }

  private parseWaitSeconds(errMsg: string): number {
    const matchJson = errMsg.match(/"reset_seconds"\s*:\s*(\d+)/);
    if (matchJson) return parseInt(matchJson[1], 10);

    const matchMinSec = errMsg.match(/reset after\s+(?:(\d+)m\s*)?(\d+)s/i);
    if (matchMinSec) {
      const mins = matchMinSec[1] ? parseInt(matchMinSec[1], 10) : 0;
      const secs = parseInt(matchMinSec[2], 10);
      return mins * 60 + secs;
    }

    const matchSec = errMsg.match(/reset after\s+(\d+)s/i);
    if (matchSec) return parseInt(matchSec[1], 10);

    return 0;
  }

  private extractJsonString(raw: string): string {
    let text = raw.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // If still surrounded by markdown or leading text, find first { or [ and last } or ]
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
