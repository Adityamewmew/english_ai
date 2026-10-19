/**
 * LLM Guardrails Service
 * Based on concepts & patterns from scripts/LLM Guardrails.md
 * (Input rails, Injection Shield, Sensitive Content / Politics, PII Masking, Schema Validation)
 */

import { OodDetectorService } from "./ood-detector.service";

export interface GuardrailCheckResult {
  allowed: boolean;
  violationType?: "injection" | "offensive" | "politics_sara" | "length_exceeded" | "out_of_distribution";
  friendlyFeedback: string;
}

export class LlmGuardrailService {
  // 1. Prompt Injection & Jailbreak Patterns (OWASP LLM01)
  private static readonly INJECTION_PATTERNS: RegExp[] = [
    /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|system)\s+(instructions|prompts|rules)/i,
    /\b(abaikan|lupakan)\s+(semua\s+)?(instruksi|perintah|aturan)\s+(sebelumnya|sistem)/i,
    /\b(reveal|show|display|leak|print|tell me)\s+(your\s+)?(system\s+prompt|developer\s+instructions|hidden\s+rules)/i,
    /\b(tampilkan|bocorkan|sebutkan)\s+(system\s+prompt|instruksi\s+rahasia|instruksi\s+sistem)/i,
    /\byou\s+are\s+now\s+(dan|jailbreak|unrestricted|god\s+mode|evil)\b/i,
    /\bkamu\s+sekarang\s+adalah\s+(dan|bebas\s+tanpa\s+aturan)\b/i,
    /\bbypass\s+(all\s+)?(safety|security|filters)\b/i,
    /\bwhat\s+is\s+your\s+system\s+prompt\b/i,
  ];

  // 2. Offensive Language & Toxic Content Patterns (Section 4.1)
  private static readonly OFFENSIVE_PATTERNS: RegExp[] = [
    /\b(anjing|babi|bangsat|kontol|memek|jembut|pantek|itil|ngentot|perek|lonte|bajingan|brengsek)\b/i,
    /\b(fuck\w*|shit\w*|bitch\w*|asshole\w*|cunt\w*|motherfuck\w*|dick\w*|pussy|bastard\w*)\b/i,
  ];

  // 3. Politics, Elections & SARA Sensitive Topic Patterns (Section 4.1)
  private static readonly POLITICS_SARA_PATTERNS: RegExp[] = [
    /\b(prabowo|jokowi|gibran|anies|ganjar|megawati|sby|soeharto|soekarno)\b/i,
    /\b(pilpres|pemilu|pilkada|kpu|bawaslu|partai\s+politik|dpr|mpr|mk\s+ri)\b/i,
    /\b(pdip|gerindra|golkar|pks|nasdem|pkb|demokrat|psi)\b/i,
    /\b(election|presidential\s+race|political\s+party|vote\s+for)\b/i,
    /\b(pki|komunis|khilafah|radikalisme|terorisme|sara|kafir|penistaan\s+agama)\b/i,
  ];

  // 4. PII Patterns for Sensitive Info Masking (Section 8.1 & 8.2)
  private static readonly PII_PATTERNS: Record<string, RegExp> = {
    EMAIL: /[\w.+-]+@[\w-]+\.[\w.]+/gi,
    PHONE_ID: /(?:\+62|0)8\d{8,11}\b/gi,
    NIK_ID: /\b\d{16}\b/gi,
  };

  /**
   * Input Rail: Validates incoming student text against injection, toxicity, and politics.
   */
  static checkVoiceInput(text: string, maxLength = 1500): GuardrailCheckResult {
    const trimmed = (text || "").trim();

    if (!trimmed) {
      return { allowed: true, friendlyFeedback: "" };
    }

    // Length boundary (OWASP Unbounded Consumption)
    if (trimmed.length > maxLength) {
      return {
        allowed: false,
        violationType: "length_exceeded",
        friendlyFeedback:
          "That was quite long! Let's keep our spoken sentences shorter and conversational. What is the main point you'd like to share?",
      };
    }

    // Check Prompt Injection / Jailbreak
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          violationType: "injection",
          friendlyFeedback:
            "I'm here solely as your English conversation coach! Let's keep our focus on practicing English. What would you like to talk about today?",
        };
      }
    }

    // Check Offensive Language
    for (const pattern of this.OFFENSIVE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          violationType: "offensive",
          friendlyFeedback:
            "Let's keep our English practice respectful and friendly! Could you try phrasing that in a polite, positive way?",
        };
      }
    }

    // Check Politics & SARA (Sensitive Content Rail)
    for (const pattern of this.POLITICS_SARA_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          violationType: "politics_sara",
          friendlyFeedback:
            "Politics and elections are quite complex topics! In our English speaking practice, let's keep it light and talk about daily routines, food, hobbies, or travel. What do you enjoy doing on your days off?",
        };
      }
    }

    // Check Out-of-Distribution (OOD) / Anomaly Detection (One-Class Classification)
    const oodResult = OodDetectorService.evaluate(trimmed);
    if (oodResult.isAnomaly) {
      return {
        allowed: false,
        violationType: "out_of_distribution",
        friendlyFeedback:
          "I specialize exclusively in English speaking & vocabulary practice! Let's talk about everyday topics like travel, hobbies, family, or work. What would you like to explore?",
      };
    }

    return { allowed: true, friendlyFeedback: "" };
  }

  /**
   * General Input Rail for Written Assessments & Submissions
   */
  static checkGeneralInput(text: string, maxLength = 3000): { allowed: boolean; reason?: string } {
    const trimmed = (text || "").trim();
    if (trimmed.length > maxLength) {
      return { allowed: false, reason: "Text exceeds maximum character limit." };
    }

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return { allowed: false, reason: "Security violation: prompt injection attempt detected." };
      }
    }

    for (const pattern of this.OFFENSIVE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return { allowed: false, reason: "Content violation: inappropriate or offensive language." };
      }
    }

    const oodResult = OodDetectorService.evaluate(trimmed);
    if (oodResult.isAnomaly) {
      return {
        allowed: false,
        reason: `Anomaly detected: Out-of-Distribution payload (${oodResult.reasons.join(", ")})`,
      };
    }

    return { allowed: true };
  }

  /**
   * Output Rail: Masks PII (Email, Phone, NIK) from text before delivering to client or DB.
   */
  static maskPii(text: string): string {
    if (!text) return "";
    let masked = text;
    masked = masked.replace(this.PII_PATTERNS.EMAIL, "[EMAIL_MASKED]");
    masked = masked.replace(this.PII_PATTERNS.PHONE_ID, "[PHONE_MASKED]");
    masked = masked.replace(this.PII_PATTERNS.NIK_ID, "[ID_MASKED]");
    return masked;
  }

  /**
   * Output Rail: Validates outgoing sentence chunks from LLM before sending via SSE/TTS.
   * Protects against leaked system instructions, toxic phrases, or unmasked PII.
   */
  static checkOutputSentence(sentence: string): { allowed: boolean; sanitized: string } {
    if (!sentence || !sentence.trim()) {
      return { allowed: true, sanitized: "" };
    }

    const trimmed = sentence.trim();

    // 1. Guard against leaking system instructions / role prompt
    if (
      /\b(you are mr\.?\s*khoirul|system prompt|developer instructions|hidden rules)\b/i.test(trimmed)
    ) {
      return {
        allowed: false,
        sanitized: "I am ready! Let's continue our English practice.",
      };
    }

    // 2. Guard against offensive/toxic content in AI response
    for (const pattern of this.OFFENSIVE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          sanitized: "Let's keep our English practice positive and encouraging!",
        };
      }
    }

    // 3. Mask any accidental PII in the sentence
    return {
      allowed: true,
      sanitized: this.maskPii(trimmed),
    };
  }

  /**
   * Output Rail: Validates JSON structure and required keys (Section 4.5 & 8.1).
   */
  static validateJson<T = any>(rawText: string, requiredKeys: string[] = []): T | null {
    if (!rawText) return null;
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleaned);
      if (typeof parsed !== "object" || parsed === null) return null;

      for (const k of requiredKeys) {
        if (!(k in parsed)) return null;
      }
      return parsed as T;
    } catch {
      return null;
    }
  }
}
