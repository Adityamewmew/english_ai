import { Elysia } from "elysia";
import {
  VoiceTtsQuery,
  VoiceTurnStreamBody,
  VoiceGreetingQuery,
  VoiceEvaluateBody,
} from "./voice.model";
import { getTtsAudioUsecase } from "./usecases/get-tts-audio.usecase";
import { getVoiceTokenUsecase } from "./usecases/get-voice-token.usecase";
import { getVoiceGreetingUsecase } from "./usecases/get-voice-greeting.usecase";
import { streamVoiceTurnUsecase } from "./usecases/stream-voice-turn.usecase";
import { evaluateVoiceSessionUsecase } from "./usecases/evaluate-voice-session.usecase";

export const voiceController = new Elysia({ prefix: "/api/voice" })
  .get(
    "/tts",
    async ({ query }) => {
      const result = await getTtsAudioUsecase(query.text);

      if (result.type === "stream") {
        return new Response(result.body, {
          status: 200,
          headers: {
            "Content-Type": result.contentType,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }

      return new Response(result.data, {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Content-Length": result.length.toString(),
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    },
    { query: VoiceTtsQuery }
  )
  .get("/token", async () => {
    return getVoiceTokenUsecase();
  })
  .post(
    "/turn-stream",
    async ({ body, headers }) => {
      const { topic, history, studentMessage, userId, studentCefr } = body;
      const resolvedUserId = userId || headers["x-user-id"];
      const encoder = new TextEncoder();
      let sentenceIndex = 0;
      const accumulatedSentences: string[] = [];

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const sentence of streamVoiceTurnUsecase({
              topic,
              history: history as any,
              studentMessage,
              userId: resolvedUserId,
              studentCefr,
            })) {
              accumulatedSentences.push(sentence);
              const data = JSON.stringify({
                type: "sentence",
                index: sentenceIndex++,
                text: sentence,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            const doneData = JSON.stringify({
              type: "done",
              fullReply: accumulatedSentences.join(" "),
              sentenceCount: accumulatedSentences.length,
            });
            controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          } catch (err: any) {
            console.error("Voice turn-stream error:", err);
            const fallback = "That sounds wonderful! What do you enjoy most about that?";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "sentence", index: sentenceIndex, text: fallback })}\n\n`
              )
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "done", fullReply: fallback, sentenceCount: 1 })}\n\n`
              )
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    },
    { body: VoiceTurnStreamBody }
  )
  .get(
    "/initial-greeting",
    async ({ query }) => {
      return getVoiceGreetingUsecase({
        topic: query?.topic,
        userId: query?.userId,
        fallbackName: query?.name,
        forceReturning: query?.hasCalledBefore === "true",
      });
    },
    { query: VoiceGreetingQuery }
  )
  .post(
    "/evaluate",
    async ({ body }) => {
      return evaluateVoiceSessionUsecase({
        userId: body.userId || "anonymous",
        topic: body.topic,
        durationSeconds: body.durationSeconds,
        transcript: body.transcript,
      });
    },
    { body: VoiceEvaluateBody }
  )
  .post(
    "/session",
    async ({ body }) => {
      return evaluateVoiceSessionUsecase({
        userId: body.userId || "anonymous",
        topic: body.topic,
        durationSeconds: body.durationSeconds,
        transcript: body.transcript,
      });
    },
    { body: VoiceEvaluateBody }
  );
