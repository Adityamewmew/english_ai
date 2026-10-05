import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { corsPlugin } from "./core/plugins/cors";
import { errorHandler } from "./core/plugins/error-handler";
import { curriculumController } from "./features/curriculum";
import { usersController } from "./features/users";
import { placementController } from "./features/placement";
import { voiceController } from "./features/voice";
import { adminController } from "./features/admin";

export const app = new Elysia()
  .use(corsPlugin)
  .use(errorHandler)
  .use(
    swagger({
      documentation: {
        info: {
          title: "EDDY'S AI API",
          version: "2.0.0",
          description: "Clean Feature-Based Layered ElysiaJS Backend",
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
  .use(curriculumController)
  .use(usersController)
  .use(placementController)
  .use(voiceController)
  .use(adminController);

export type App = typeof app;
