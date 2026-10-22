import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { corsPlugin } from "./common/plugins/cors";
import { errorHandlerPlugin } from "./common/errors/error-handler";
import { curriculumHandler } from "./internal/http/handler/curriculum_handler";
import { userHandler } from "./internal/http/handler/user_handler";
import { placementHandler } from "./internal/http/handler/placement_handler";
import { voiceHandler } from "./internal/http/handler/voice_handler";
import { chatHandler } from "./internal/http/handler/chat_handler";
import { certificateHandler } from "./internal/http/handler/certificate_handler";
import { classHandler } from "./internal/http/handler/class_handler";
import { authPlugin } from "./lib/auth";

export const app = new Elysia()
  .use(corsPlugin)
  .use(errorHandlerPlugin)
  .use(authPlugin)
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "EDDY'S AI API",
          version: "2.0.0",
          description: "Clean Architecture ElysiaJS Backend for EDDY'S English AI Tutor",
        },
        tags: [
          { name: "Curriculum", description: "Curriculum and module endpoints" },
          { name: "Users", description: "User and auth endpoints" },
          { name: "Placement", description: "CEFR placement test endpoints" },
          { name: "Voice", description: "Voice conversation and TTS endpoints" },
          { name: "Chat", description: "Chatbot and study companion endpoints" },
          { name: "Certificates", description: "CEFR certificate endpoints" },
        ],
      },
    })
  )
  .get("/", () => ({
    status: "ok",
    service: "EDDY'S AI Backend (ElysiaJS Starter Kit Architecture)",
    version: "2.0.0",
    architecture: "Clean Architecture (Handler -> Usecase -> Repository -> Entity)",
    database: "PostgreSQL (Drizzle ORM)",
  }))
  .use(curriculumHandler)
  .use(userHandler)
  .use(placementHandler)
  .use(voiceHandler)
  .use(chatHandler)
  .use(certificateHandler)
  .use(classHandler);

export type App = typeof app;
