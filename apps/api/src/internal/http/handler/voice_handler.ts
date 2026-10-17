import { Elysia } from "elysia";
import {
  VoiceTtsQuery,
  VoiceTurnStreamBody,
  VoiceGreetingQuery,
  VoiceEvaluateBody,
} from "../../entity/voice_entity";
import { getTtsAudioUsecase } from "../../usecase/voice/get-tts-audio.usecase";
import { getVoiceGreetingUsecase } from "../../usecase/voice/get-voice-greeting.usecase";
import { streamVoiceTurnUsecase } from "../../usecase/voice/stream-voice-turn.usecase";
import { evaluateVoiceSessionUsecase } from "../../usecase/voice/evaluate-voice-session.usecase";
import { jsonResponse } from "../../presenter/json";

export const voiceHandler = new Elysia({ prefix: "/api/voice" })
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
  .post(
    "/turn-stream",
    async ({ body, headers }) => {
      const { topic, history, studentMessage, userId } = body;
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
            const msg = (studentMessage || "").toLowerCase();
            const fallback = /\b(bye|goodbye|see you|pamit|dadah)\b/.test(msg)
              ? "It was wonderful speaking with you today! Have a great day ahead!"
              : "I see! Could you tell me a little bit more about that?";
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
    async ({ body, set }) => {
      const data = await evaluateVoiceSessionUsecase({
        userId: body.userId || "anonymous",
        topic: body.topic,
        durationSeconds: body.durationSeconds,
        transcript: body.transcript,
      });
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Session evaluated successfully",
        data,
      });
    },
    { body: VoiceEvaluateBody }
  );
