import { Elysia, t } from "elysia";
import { voiceCallService } from "../services/voice-call.service";
import { GeminiService } from "../lib/gemini";

export const voiceRoutes = new Elysia({ prefix: "/api/voice" })
  // TTS Audio Endpoint
  .get(
    "/tts",
    async ({ query, set }) => {
      const text = query.text;
      if (!text || text.trim() === "") {
        set.status = 400;
        return { error: "Missing text parameter" };
      }

      // 1. Streaming audio attempt
      const streamRes = await GeminiService.getSpeechStream(text);
      if (streamRes && streamRes.body) {
        const contentType = streamRes.headers.get("content-type") || "audio/wav";
        return new Response(streamRes.body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }

      // 2. Buffer fallback
      const audioBuffer = await GeminiService.generateSpeech(text);
      if (!audioBuffer) {
        set.status = 500;
        return { error: "Failed to generate audio" };
      }

      const isWav = audioBuffer.length > 4 && audioBuffer.toString("utf8", 0, 4) === "RIFF";
      const contentType = isWav ? "audio/wav" : "audio/mpeg";

      return new Response(new Uint8Array(audioBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": audioBuffer.length.toString(),
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    },
    {
      query: t.Object({
        text: t.String(),
      }),
    }
  )

  // Voice Token Endpoint
  .get("/token", async () => {
    return {
      success: true,
      model: process.env.GEMINI_LIVE_MODEL || "gemini-2.0-flash",
      voice: "Fenrir",
      instructions: "You are Mr. Khoirul, personal English tutor. Speak concisely and encouragingly. Use bilingual Indonesian when student needs help.",
    };
  })

  // Streaming Turn Endpoint (SSE)
  .post(
    "/turn-stream",
    async ({ body, set }) => {
      const { topic, history, studentMessage } = body;

      const encoder = new TextEncoder();
      let sentenceIndex = 0;
      const accumulatedSentences: string[] = [];

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const sentence of voiceCallService.streamTurn({
              topic,
              history: history as any,
              studentMessage,
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
    {
      body: t.Object({
        topic: t.String(),
        history: t.Array(
          t.Object({
            role: t.Union([t.Literal("assistant"), t.Literal("user")]),
            content: t.String(),
          })
        ),
        studentMessage: t.String(),
      }),
    }
  )

  // Initial Greeting Endpoint
  .get(
    "/initial-greeting",
    async ({ query }) => {
      const topic = query.topic || "Daily Casual Chat";
      const userId = query.userId;
      const fallbackName = query.name;
      const forceReturning = query.hasCalledBefore === "true";
      const greeting = await voiceCallService.getInitialGreeting(
        topic,
        userId,
        fallbackName,
        forceReturning
      );
      return {
        greeting,
        topic,
      };
    },
    {
      query: t.Optional(
        t.Object({
          topic: t.Optional(t.String()),
          userId: t.Optional(t.String()),
          name: t.Optional(t.String()),
          hasCalledBefore: t.Optional(t.String()),
        })
      ),
    }
  )

  // Evaluate & Save Call Session
  .post(
    "/evaluate",
    async ({ body }) => {
      const result = await voiceCallService.saveAndEvaluateSession({
        userId: body.userId || "anonymous",
        topic: body.topic,
        durationSeconds: body.durationSeconds,
        transcript: body.transcript,
      });
      return result;
    },
    {
      body: t.Object({
        userId: t.Optional(t.String()),
        topic: t.String(),
        durationSeconds: t.Number(),
        transcript: t.Optional(t.String()),
      }),
    }
  );
