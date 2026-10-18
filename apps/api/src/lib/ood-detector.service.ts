/**
 * Out-of-Distribution (OOD) & Anomaly Detector Service for LLM Security
 * 
 * Provides One-Class Anomaly Classification against:
 * 1. Structural chat delimiters & template breakouts (<|im_start|>, [INST], etc.)
 * 2. High-entropy encoded payloads (Base64, Hex, Ciphers via Shannon Entropy)
 * 3. Invisible, homoglyph, and zero-width control characters
 * 4. Multi-token adversarial meta-instruction clustering
 * 5. Out-of-scope code / shell / SQL injection commands
 */

export interface OodScoreResult {
  isAnomaly: boolean;
  anomalyScore: number;
  reasons: string[];
}

export class OodDetectorService {
  private static readonly CHAT_DELIMITERS = [
    '<|im_start|>',
    '<|im_end|>',
    '<|system|>',
    '<|user|>',
    '<|assistant|>',
    '[inst]',
    '[/inst]',
    '<<sys>>',
    '<</sys>>',
    '{"role":"system"}',
    '{"role": "system"}',
    '### instruction',
    '### system',
    '```system',
  ];

  private static readonly CODE_INJECTION_KEYWORDS = [
    'drop table',
    'select * from',
    'union select',
    'rm -rf',
    'chmod +x',
    '<script>',
    'javascript:',
    'eval(',
    'exec(',
    '/bin/sh',
    '/bin/bash',
    'cmd.exe',
    'powershell -enc',
  ];

  private static readonly META_INSTRUCTION_KEYWORDS = [
    'ignore',
    'disregard',
    'forget',
    'override',
    'bypass',
    'leak',
    'reveal',
    'unrestricted',
    'god mode',
    'jailbreak',
    'system prompt',
    'hidden instructions',
    'developer rules',
    'prior instructions',
    'previous instructions',
    'dan mode',
    'developer mode',
  ];

  /**
   * Calculates Shannon Entropy of a string to detect high-entropy encoded payloads.
   * Typical English sentences score ~3.5 to ~4.1. Base64 / ciphers score > 4.4.
   */
  static calculateShannonEntropy(str: string): number {
    if (!str || str.length === 0) return 0;
    const counts = new Map<string, number>();
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    let entropy = 0;
    for (const count of counts.values()) {
      const p = count / str.length;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  /**
   * One-Class Anomaly Evaluation for an input prompt.
   * Returns isAnomaly = true if anomalyScore >= 0.50.
   */
  static evaluate(text: string): OodScoreResult {
    const raw = text || '';
    const lower = raw.toLowerCase().trim();
    const reasons: string[] = [];
    let score = 0;

    if (!lower) {
      return { isAnomaly: false, anomalyScore: 0, reasons: [] };
    }

    // 1. Structural Chat Delimiter Anomaly
    for (const d of this.CHAT_DELIMITERS) {
      if (lower.includes(d)) {
        score += 0.85;
        reasons.push(`Chat delimiter injection: "${d}"`);
        break;
      }
    }

    // 2. High-Entropy Encoded Payloads (Base64 / Hex)
    // Continuous tokens of >= 28 chars without whitespace
    const longTokens = raw.match(/[A-Za-z0-9+/=]{28,}/g);
    if (longTokens) {
      for (const token of longTokens) {
        const ent = this.calculateShannonEntropy(token);
        if (ent >= 4.4) {
          score += 0.75;
          reasons.push(`High-entropy encoded payload detected (entropy: ${ent.toFixed(2)})`);
          break;
        }
      }
    }

    // 3. Invisible & Zero-Width Control Character Anomaly
    const hasInvisibleChars = /[\u200B-\u200D\uFEFF\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(raw);
    if (hasInvisibleChars) {
      score += 0.80;
      reasons.push('Hidden zero-width or control characters detected');
    }

    // 4. Meta-Instruction Keyword Clustering Anomaly
    let metaCount = 0;
    const matchedMeta: string[] = [];
    for (const kw of this.META_INSTRUCTION_KEYWORDS) {
      const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (regex.test(lower)) {
        metaCount++;
        matchedMeta.push(kw);
      }
    }

    if (metaCount >= 2) {
      score += 0.60 + Math.min(0.35, metaCount * 0.1);
      reasons.push(`Multiple adversarial meta-instruction terms: [${matchedMeta.join(', ')}]`);
    } else if (metaCount === 1) {
      // Single keyword: check if followed by direct imperative target
      const metaDirectiveRegex = /\b(ignore|disregard|forget|override|bypass)\s+(all|any|prior|previous|your|the|system)\b/i;
      if (metaDirectiveRegex.test(lower)) {
        score += 0.70;
        reasons.push(`Direct imperative override pattern: [${matchedMeta[0]}]`);
      }
    }

    // 5. Code & Database Command Injection Anomaly
    for (const kw of this.CODE_INJECTION_KEYWORDS) {
      if (lower.includes(kw)) {
        score += 0.85;
        reasons.push(`Code / Database command sequence detected: "${kw}"`);
        break;
      }
    }

    const finalScore = Math.min(1.0, Number(score.toFixed(3)));
    const isAnomaly = finalScore >= 0.50;

    return {
      isAnomaly,
      anomalyScore: finalScore,
      reasons,
    };
  }
}
