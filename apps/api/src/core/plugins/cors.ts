import { cors as elysiaCors } from "@elysiajs/cors";

export const corsPlugin: ReturnType<typeof elysiaCors> = elysiaCors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
});
