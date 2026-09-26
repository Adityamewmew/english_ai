import { GeminiChatService } from "./gemini-chat";
import { GeminiEvalService } from "./gemini-eval";
import { GeminiTtsService } from "./gemini-tts";

/**
 * Unified GeminiService façade
 * Delegates to modular services, keeping all files strictly under 300 lines
 */
export class GeminiService {
  // Chat & Streaming
  static callAI = GeminiChatService.callAI;
  static callAIStream = GeminiChatService.callAIStream;
  static streamTutorSentences = GeminiChatService.streamTutorSentences;
  static generateTutorCallReply = GeminiChatService.generateTutorCallReply;

  // Evaluation & Assessment
  static evaluateWriting = GeminiEvalService.evaluateWriting;
  static evaluateConversation = GeminiEvalService.evaluateConversation;
  static transcribeAudioSelfIntro = GeminiEvalService.transcribeAudioSelfIntro;
  static evaluateSpeakingSelfIntro = GeminiEvalService.evaluateSpeakingSelfIntro;

  // Text-To-Speech
  static generateSpeech = GeminiTtsService.generateSpeech;
  static getSpeechStream = GeminiTtsService.getSpeechStream;
}

export { GeminiChatService, GeminiEvalService, GeminiTtsService };
