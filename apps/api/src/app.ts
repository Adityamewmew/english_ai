import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { corsPlugin } from "./core/plugins/cors";
import { errorHandler } from "./core/plugins/error-handler";
import { voiceRoutes } from "./routes/voice";
import { placementRoutes } from "./routes/placement";
import { curriculumRoutes } from "./routes/curriculum";
import { userRoutes } from "./routes/user";

export const app = new Elysia()
  .use(corsPlugin)
  .use(errorHandler)
  .use(
    swagger({
      documentation: {
        info: {
          title: "EDDY'S AI API",
          version: "2.0.0",
          description: "Clean Layered ElysiaJS Backend for EDDY'S AI Platform",
        },
      },
    })
  )
  .get("/", () => ({
    status: "ok",
    service: "EDDY'S AI Backend (ElysiaJS)",
    version: "2.0.0",
    architecture: "Feature-Based Clean Layered",
    database: "PostgreSQL (english_ai)",
  }))
  .use(voiceRoutes)
  .use(placementRoutes)
  .use(curriculumRoutes)
  .use(userRoutes);

export type App = typeof app;
