import { db } from "../../db";
import { chatSessions, chatMessages } from "../../db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import crypto from "crypto";

export const chatRepository = {
  createSession: async (userId: string, title = "Percakapan Baru") => {
    const id = crypto.randomUUID();
    const [session] = await db
      .insert(chatSessions)
      .values({
        id,
        userId,
        title,
      })
      .returning();
    return session;
  },

  listSessions: async (userId: string, limit = 30) => {
    return db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(limit);
  },

  getSession: async (sessionId: string, userId?: string) => {
    const conditions = [eq(chatSessions.id, sessionId)];
    if (userId) conditions.push(eq(chatSessions.userId, userId));

    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(...conditions))
      .limit(1);
    return session || null;
  },

  updateSessionTitle: async (sessionId: string, title: string) => {
    const [updated] = await db
      .update(chatSessions)
      .set({ title, updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId))
      .returning();
    return updated || null;
  },

  deleteSession: async (sessionId: string, userId?: string) => {
    const conditions = [eq(chatSessions.id, sessionId)];
    if (userId) conditions.push(eq(chatSessions.userId, userId));

    await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId));
    const [deleted] = await db
      .delete(chatSessions)
      .where(and(...conditions))
      .returning();
    return deleted || null;
  },

  getMessages: async (sessionId: string, limit = 50) => {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);
  },

  addMessage: async (
    sessionId: string,
    role: "user" | "assistant",
    content: string,
    metadata?: any
  ) => {
    const id = crypto.randomUUID();
    const [msg] = await db
      .insert(chatMessages)
      .values({
        id,
        sessionId,
        role,
        content,
        metadata,
      })
      .returning();

    // Touch session updatedAt
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId));

    return msg;
  },
};
