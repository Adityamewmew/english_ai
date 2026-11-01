/**
 * SubModuleGradingService
 * Pure, deterministic grading engine for curriculum sub-modules and capstone exams.
 * Independent of database connections for maximum testability.
 */

export interface QuestionGradingResult {
  questionId: string | number;
  question: string;
  selectedAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  explanation?: string;
}

export interface SubModuleGradingResult {
  totalQuestions: number;
  correctCount: number;
  quizScore: number;
  finalScore: number;
  questionResults: QuestionGradingResult[];
}

export class SubModuleGradingService {
  /**
   * Normalizes text by lowercasing, stripping punctuation, and trimming redundant spaces.
   */
  static cleanText(text: string | null | undefined): string {
    if (!text || typeof text !== "string") return "";
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"–—]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Extracts questions from module sections, supporting:
   * 1. 4-part Capstone Exams (parts.reading, parts.listening, parts.writing, parts.speaking)
   * 2. Practicum Questions (content.practicumQuestions)
   * 3. Standard Questions (content.questions)
   */
  static extractQuestions(quizSection: any, practiceSection?: any): any[] {
    // 1. Capstone Exam with 4 Parts
    if (quizSection?.content?.parts) {
      const parts = quizSection.content.parts;
      const combined: any[] = [];
      if (Array.isArray(parts.reading)) combined.push(...parts.reading.map((q: any) => ({ ...q, examPart: "reading" })));
      if (Array.isArray(parts.listening)) combined.push(...parts.listening.map((q: any) => ({ ...q, examPart: "listening" })));
      if (Array.isArray(parts.writing)) combined.push(...parts.writing.map((q: any) => ({ ...q, examPart: "writing" })));
      if (Array.isArray(parts.speaking)) combined.push(...parts.speaking.map((q: any) => ({ ...q, examPart: "speaking" })));
      if (combined.length > 0) return combined;
    }

    // 2. Standard Practicum & Quiz Questions
    const list =
      quizSection?.content?.practicumQuestions ||
      quizSection?.content?.questions ||
      practiceSection?.content?.practicumQuestions ||
      practiceSection?.content?.questions;

    return Array.isArray(list) ? list : [];
  }

  /**
   * Evaluates a single question against a user's answer.
   */
  static evaluateSingleQuestion(q: any, selected: any): { isCorrect: boolean; canonicalAnswer: any } {
    if (selected === undefined || selected === null) {
      return { isCorrect: false, canonicalAnswer: this.getCanonicalAnswer(q) };
    }

    // If answer provided as array of words (Sentence Assembly / Unscramble)
    const userString = Array.isArray(selected)
      ? selected.join(" ")
      : typeof selected === "string"
      ? selected
      : String(selected);

    const cleanUser = this.cleanText(userString);
    if (!cleanUser) {
      return { isCorrect: false, canonicalAnswer: this.getCanonicalAnswer(q) };
    }

    // 1. Multiple Choice Option Evaluation
    if (Array.isArray(q.options) && q.options.length > 0) {
      const options = q.options.map((opt: any) =>
        typeof opt === "string" ? opt : opt?.text || opt?.label || String(opt ?? "")
      );

      // Check numeric index match
      const correctIdx =
        q.correctIndex !== undefined
          ? Number(q.correctIndex)
          : q.answer !== undefined && typeof q.answer === "number"
          ? Number(q.answer)
          : -1;

      if (correctIdx >= 0 && options[correctIdx]) {
        const targetOptionClean = this.cleanText(options[correctIdx]);
        // User could pass index as number or string, or pass option text directly
        if (Number(selected) === correctIdx || cleanUser === targetOptionClean) {
          return { isCorrect: true, canonicalAnswer: options[correctIdx] };
        }
      }

      // Check letter match (e.g., "A", "B", "C", "D")
      if (/^[a-dA-D]$/.test(cleanUser)) {
        const letterIdx = cleanUser.toUpperCase().charCodeAt(0) - 65;
        if (letterIdx === correctIdx) {
          return { isCorrect: true, canonicalAnswer: options[correctIdx] || options[letterIdx] };
        }
      }

      // Check if user answer matches any string target in options
      const rawAns = q.answer || q.targetAnswer;
      if (rawAns && typeof rawAns === "string" && cleanUser === this.cleanText(rawAns)) {
        return { isCorrect: true, canonicalAnswer: rawAns };
      }
    }

    // 2. Sentence Transformation, Rewrite, Dictation, & Target Answers (plural/singular)
    const possibleTargets: string[] = [];
    if (Array.isArray(q.targetAnswers)) possibleTargets.push(...q.targetAnswers);
    if (typeof q.targetAnswer === "string") possibleTargets.push(q.targetAnswer);
    if (Array.isArray(q.acceptedAnswers)) possibleTargets.push(...q.acceptedAnswers);
    if (typeof q.answer === "string") possibleTargets.push(q.answer);
    if (typeof q.targetSentence === "string") possibleTargets.push(q.targetSentence);
    if (typeof q.targetWord === "string") possibleTargets.push(q.targetWord);
    if (typeof q.audioText === "string") possibleTargets.push(q.audioText);

    for (const target of possibleTargets) {
      const cleanTarget = this.cleanText(target);
      if (cleanTarget && cleanUser === cleanTarget) {
        return { isCorrect: true, canonicalAnswer: target };
      }
    }

    // 3. Oral / Speaking Expected Keywords Match
    if (Array.isArray(q.expectedKeywords) && q.expectedKeywords.length > 0) {
      const matchedCount = q.expectedKeywords.filter((kw: string) =>
        cleanUser.includes(this.cleanText(kw))
      ).length;
      const matchRatio = matchedCount / q.expectedKeywords.length;
      if (matchRatio >= 0.5) {
        return {
          isCorrect: true,
          canonicalAnswer: q.expectedKeywords.join(", "),
        };
      }
    }

    return { isCorrect: false, canonicalAnswer: this.getCanonicalAnswer(q) };
  }

  private static getCanonicalAnswer(q: any): any {
    if (Array.isArray(q.targetAnswers) && q.targetAnswers.length > 0) return q.targetAnswers[0];
    if (q.targetAnswer) return q.targetAnswer;
    if (q.targetSentence) return q.targetSentence;
    if (q.targetWord) return q.targetWord;
    if (q.answer !== undefined) return q.answer;
    if (q.correctIndex !== undefined && Array.isArray(q.options)) return q.options[q.correctIndex];
    return null;
  }

  /**
   * Main evaluation pipeline for a submodule.
   */
  static evaluate(params: {
    quizSection: any;
    practiceSection?: any;
    answers?: Record<string, any>;
    customScore?: number;
    speakingScore?: number;
  }): SubModuleGradingResult {
    const questions = this.extractQuestions(params.quizSection, params.practiceSection);
    const answers = params.answers || {};

    // Sub-module with no questions (e.g. pure informational/theory welcome stage)
    if (questions.length === 0) {
      const finalScore = params.customScore !== undefined ? Math.min(100, Math.max(0, params.customScore)) : 100;
      return {
        totalQuestions: 0,
        correctCount: 0,
        quizScore: finalScore,
        finalScore,
        questionResults: [],
      };
    }

    // Capstone 4-part Exam evaluation: require verified answers
    const isCapstoneExam = Boolean(params.quizSection?.content?.parts);
    if (isCapstoneExam) {
      const totalAnswered = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== null).length;
      if (totalAnswered === 0) {
        return {
          totalQuestions: questions.length,
          correctCount: 0,
          quizScore: 0,
          finalScore: 0,
          questionResults: [],
        };
      }
      if (params.customScore !== undefined) {
        const finalScore = Math.min(100, Math.max(0, params.customScore));
        return {
          totalQuestions: questions.length,
          correctCount: Math.round((finalScore / 100) * questions.length),
          quizScore: finalScore,
          finalScore,
          questionResults: [],
        };
      }
    }

    // Sub-module with questions: Must evaluate answers!
    let correctCount = 0;
    const questionResults: QuestionGradingResult[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = q.id !== undefined && q.id !== null ? q.id : `q-${i}`;

      // Support index-based or ID-based answer lookup
      const selected =
        answers[qId.toString()] ??
        answers[i.toString()] ??
        answers[i] ??
        answers[q.id];

      const { isCorrect, canonicalAnswer } = this.evaluateSingleQuestion(q, selected);

      if (isCorrect) correctCount++;

      questionResults.push({
        questionId: qId,
        question: q.question || q.promptText || q.prompt || q.instruction || `Question ${i + 1}`,
        selectedAnswer: selected !== undefined ? selected : null,
        correctAnswer: canonicalAnswer,
        isCorrect,
        explanation: q.explanation || "",
      });
    }

    const quizScore = Math.round((correctCount / questions.length) * 100);

    let finalScore = quizScore;
    if (params.speakingScore !== undefined && params.speakingScore >= 0) {
      finalScore = Math.round(quizScore * 0.5 + params.speakingScore * 0.5);
    }

    return {
      totalQuestions: questions.length,
      correctCount,
      quizScore,
      finalScore: Math.min(100, Math.max(0, finalScore)),
      questionResults,
    };
  }
}
