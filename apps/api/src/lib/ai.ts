import { AiChatService } from "./ai-chat";
import { AiEvalService } from "./ai-eval";
import { AiTtsService } from "./ai-tts";

/**
 * Unified AiService façade
 * Delegates to modular AI services (chat, evaluation, text-to-speech)
 */
export class AiService {
  // Chat & Streaming
  static callAI = AiChatService.callAI;
  static callAIStream = AiChatService.callAIStream;
  static streamTutorSentences = AiChatService.streamTutorSentences;
  static generateTutorCallReply = AiChatService.generateTutorCallReply;

  // Evaluation & Assessment
  static evaluateWriting = AiEvalService.evaluateWriting;
  static evaluateConversation = AiEvalService.evaluateConversation;
  static transcribeAudioSelfIntro = AiEvalService.transcribeAudioSelfIntro;
  static evaluateSpeakingSelfIntro = AiEvalService.evaluateSpeakingSelfIntro;

  // Text-To-Speech
  static generateSpeech = (text: string, voice?: string) => AiTtsService.generateSpeech(text, voice);
  static getSpeechStream = (text: string) => AiTtsService.getSpeechStream(text);
}

export { AiChatService, AiEvalService, AiTtsService };
