import { cors as elysiaCors } from "@elysiajs/cors";

const allowedOrigins = [
  "https://eddys.drimland.my.id",
  "http://eddys.drimland.my.id",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
  "http://localhost:3005",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3005",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim())
    : []),
];

export const corsPlugin: ReturnType<typeof elysiaCors> = elysiaCors({
  origin: (request: Request): boolean => {
    const origin = request.headers.get("origin");
    if (!origin) return true; // Allow non-browser, server-to-server, or same-origin requests
    return allowedOrigins.includes(origin);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "x-user-id"],
});
