import { chatRepository } from "../../repository/chat_repository";

export async function listChatSessionsUsecase(userId: string) {
  if (!userId) return [];
  return chatRepository.listSessions(userId);
}

export async function createChatSessionUsecase(userId: string, title?: string) {
  const resolvedUserId = userId || "anonymous";
  return chatRepository.createSession(resolvedUserId, title || "Percakapan Baru");
}

export async function getChatSessionDetailUsecase(sessionId: string, userId?: string) {
  const session = await chatRepository.getSession(sessionId, userId);
  if (!session) return null;

  const messages = await chatRepository.getMessages(sessionId);
  return {
    ...session,
    messages,
  };
}

export async function deleteChatSessionUsecase(sessionId: string, userId?: string) {
  return chatRepository.deleteSession(sessionId, userId);
}
