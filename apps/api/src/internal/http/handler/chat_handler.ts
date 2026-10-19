import { Elysia } from "elysia";
import {
  CreateChatSessionBody,
  SendChatMessageBody,
  ChatSessionParam,
} from "../../entity/chat_entity";
import {
  listChatSessionsUsecase,
  createChatSessionUsecase,
  getChatSessionDetailUsecase,
  deleteChatSessionUsecase,
} from "../../usecase/chat/manage-chat-session.usecase";
import { streamChatTurnUsecase } from "../../usecase/chat/stream-chat-turn.usecase";
import { jsonResponse } from "../../presenter/json";

export const chatHandler = new Elysia({ prefix: "/api/chat" })
  .get("/sessions", async ({ query, headers, set }) => {
    const userId = (query as any)?.userId || headers["x-user-id"] || "anonymous";
    const data = await listChatSessionsUsecase(userId);
    return jsonResponse({
      set,
      statusCode: 200,
      message: "Chat sessions retrieved",
      data,
    });
  })
  .post(
    "/sessions",
    async ({ body, headers, set }) => {
      const resolvedUserId = body.userId || headers["x-user-id"] || "anonymous";
      const session = await createChatSessionUsecase(resolvedUserId, body.title);
      return jsonResponse({
        set,
        statusCode: 201,
        message: "Chat session created",
        data: session,
      });
    },
    { body: CreateChatSessionBody }
  )
  .get(
    "/sessions/:id",
    async ({ params, headers, set }) => {
      const userId = headers["x-user-id"];
      const session = await getChatSessionDetailUsecase(params.id, userId);
      if (!session) {
        set.status = 404;
        return { success: false, message: "Session not found" };
      }
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Chat session detail retrieved",
        data: session,
      });
    },
    { params: ChatSessionParam }
  )
  .delete(
    "/sessions/:id",
    async ({ params, headers, set }) => {
      const userId = headers["x-user-id"];
      await deleteChatSessionUsecase(params.id, userId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Chat session deleted",
        data: { id: params.id },
      });
    },
    { params: ChatSessionParam }
  )
  .post(
    "/sessions/:id/stream",
    async ({ params, body, headers }) => {
      const { message, userId, clientMessageId } = body;
      const resolvedUserId = userId || headers["x-user-id"] || "anonymous";

      const session = await getChatSessionDetailUsecase(params.id, resolvedUserId !== "anonymous" ? resolvedUserId : undefined);
      if (!session) {
        return new Response(JSON.stringify({ error: "Session not found or access denied" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const encoder = new TextEncoder();
      let heartbeatTimer: any = null;

      const stream = new ReadableStream({
        async start(controller) {
          // Heartbeat comment ping every 15s to keep proxy connections alive
          heartbeatTimer = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(": ping\n\n"));
            } catch {}
          }, 15000);

          try {
            for await (const chunk of streamChatTurnUsecase({
              sessionId: params.id,
              studentMessage: message,
              userId: resolvedUserId,
              clientMessageId,
            })) {
              const data = JSON.stringify({
                type: "token",
                text: chunk,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            const doneData = JSON.stringify({ type: "done" });
            controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          } catch (err: any) {
            console.error("Chat turn streaming error:", err);
            const errorData = JSON.stringify({
              type: "error",
              message: "An error occurred while generating response.",
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          } finally {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            try {
              controller.close();
            } catch {}
          }
        },
        cancel() {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    },
    {
      params: ChatSessionParam,
      body: SendChatMessageBody,
    }
  );
