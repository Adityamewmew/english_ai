import { cors as elysiaCors } from "@elysiajs/cors";

export const corsPlugin: ReturnType<typeof elysiaCors> = elysiaCors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "x-user-id"],
});
