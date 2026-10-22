import { Elysia } from "elysia";
import {
  VoiceCreateSessionBody,
  VoiceTtsQuery,
  VoiceTtsBody,
  VoiceTurnStreamBody,
  VoiceGreetingQuery,
  VoiceEvaluateBody,
} from "../../entity/voice_entity";
import { getTtsAudioUsecase } from "../../usecase/voice/get-tts-audio.usecase";
import { getVoiceGreetingUsecase } from "../../usecase/voice/get-voice-greeting.usecase";
import { streamVoiceTurnUsecase } from "../../usecase/voice/stream-voice-turn.usecase";
import { evaluateVoiceSessionUsecase } from "../../usecase/voice/evaluate-voice-session.usecase";
import { voiceRepository } from "../../repository/voice_repository";
import { LlmGuardrailService } from "../../../lib/llm-guardrail.service";
import { jsonResponse } from "../../presenter/json";
import { checkAiQuotaUsecase } from "../../usecase/classes/check-ai-quota.usecase";

export const voiceHandler = new Elysia({ prefix: "/api/voice" })
  .post(
    "/sessions",
    async ({ body, headers, set }) => {
      const resolvedUserId = body.userId || headers["x-user-id"] || "anonymous";

      if (resolvedUserId && resolvedUserId !== "anonymous") {
        const quota = await checkAiQuotaUsecase(resolvedUserId);
        if (!quota.canVoice) {
          set.status = 403;
          return jsonResponse({
            set,
            statusCode: 403,
            message: `Batas kuota harian panggilan suara kamu sudah tercapai (${quota.voice.limitMinutes} menit). Kuota reset pukul 00:00 WIB atau upgrade paket untuk durasi lebih banyak!`,
            data: { quotaExceeded: true, quota },
          });
        }
      }

      const session = await voiceRepository.createSession({
        userId: resolvedUserId,
        topic: body.topic,
        moduleId: body.moduleId,
        sttProvider: body.sttProvider || "web-speech",
      });
      return jsonResponse({
        set,
        statusCode: 201,
        message: "Voice call session initialized",
        data: session,
      });
    },
    { body: VoiceCreateSessionBody }
  )
  .get(
    "/tts",
    async ({ query }) => {
      const result = await getTtsAudioUsecase(query.text, query.voice);

      if (result.type === "stream") {
        return new Response(result.body, {
          status: 200,
          headers: {
            "Content-Type": result.contentType,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }

      return new Response(result.data, {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Content-Length": result.length.toString(),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    },
    { query: VoiceTtsQuery }
  )
  .post(
    "/tts",
    async ({ body }) => {
      const result = await getTtsAudioUsecase(body.text, body.voice);

      if (result.type === "stream") {
        return new Response(result.body, {
          status: 200,
          headers: {
            "Content-Type": result.contentType,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }

      return new Response(result.data, {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Content-Length": result.length.toString(),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    },
    { body: VoiceTtsBody }
  )
  .post(
    "/turn-stream",
    async ({ body, headers }) => {
      const { sessionId, topic, history, studentMessage, userId, turnIndex = 0 } = body;
      const resolvedUserId = userId || headers["x-user-id"];
      const encoder = new TextEncoder();
      let sentenceIndex = 0;
      const accumulatedSentences: string[] = [];
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
            if (resolvedUserId && resolvedUserId !== "anonymous") {
              const quota = await checkAiQuotaUsecase(resolvedUserId);
              if (!quota.canVoice) {
                const limitNote = `Waktu panggilan latihan suara harian kamu (${quota.voice.limitMinutes} menit) sudah mencapai batas. Kuota reset besok pukul 00:00 WIB!`;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "sentence", index: 0, text: limitNote })}\n\n`
                  )
                );
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "done", fullReply: limitNote, sentenceCount: 1 })}\n\n`
                  )
                );
                return;
              }
            }

            for await (const sentence of streamVoiceTurnUsecase({
              topic,
              history: history as any,
              studentMessage,
              userId: resolvedUserId,
            })) {
              // Output Guardrail per sentence
              const guard = LlmGuardrailService.checkOutputSentence(sentence);
              const safeSentence = guard.sanitized || sentence;

              accumulatedSentences.push(safeSentence);
              const data = JSON.stringify({
                type: "sentence",
                index: sentenceIndex++,
                text: safeSentence,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            const fullReply = accumulatedSentences.join(" ");
            const doneData = JSON.stringify({
              type: "done",
              fullReply,
              sentenceCount: accumulatedSentences.length,
            });
            controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

            // Persist turn transcript server-side if session is active
            if (sessionId) {
              const turnTranscript = `Turn ${turnIndex + 1}:\nStudent: ${studentMessage}\nMr. Khoirul: ${fullReply}`;
              await voiceRepository.appendTranscript(sessionId, turnTranscript).catch(() => {});
            }
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

            if (sessionId) {
              const turnTranscript = `Turn ${turnIndex + 1}:\nStudent: ${studentMessage}\nMr. Khoirul: ${fallback}`;
              await voiceRepository.appendTranscript(sessionId, turnTranscript).catch(() => {});
            }
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
        sessionId: body.sessionId,
        userId: body.userId || "anonymous",
        topic: body.topic,
        durationSeconds: body.durationSeconds,
        transcript: body.transcript,
        sttProvider: body.sttProvider,
      });
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Session evaluated successfully",
        data,
      });
    },
    { body: VoiceEvaluateBody }
  )
  .get("/sessions", async ({ query, headers, set }) => {
    const resolvedUserId = (query as any)?.userId || headers["x-user-id"];
    if (!resolvedUserId) {
      return jsonResponse({
        set,
        statusCode: 200,
        message: "No user specified",
        data: [],
      });
    }
    const data = await voiceRepository.findByUserId(resolvedUserId, 10);
    return jsonResponse({
      set,
      statusCode: 200,
      message: "Voice call sessions retrieved",
      data,
    });
  });
