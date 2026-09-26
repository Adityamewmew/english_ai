import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { voiceRoutes } from "./routes/voice";
import { placementRoutes } from "./routes/placement";
import { curriculumRoutes } from "./routes/curriculum";
import { userRoutes } from "./routes/user";

export const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "EDDY'S AI API",
          version: "1.0.0",
          description: "ElysiaJS Backend for EDDY'S AI English Learning Platform",
        },
      },
    })
  )
  .get("/", () => ({
    status: "ok",
    service: "EDDY'S AI Backend (ElysiaJS)",
    version: "1.0.0",
    database: "PostgreSQL (english_ai)",
  }))
  .use(voiceRoutes)
  .use(placementRoutes)
  .use(curriculumRoutes)
  .use(userRoutes)
  .listen(Number(process.env.PORT || 3001));

console.log(
  `🚀 Elysia Backend running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
