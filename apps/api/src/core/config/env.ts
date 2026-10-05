export const env = {
  PORT: Number(process.env.PORT || 3003),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/english_ai",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "dev-secret-key-12345",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3003",
  AI_BASE_URL: process.env.AI_BASE_URL || "http://localhost:20128/v1",
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_CHAT_MODEL: process.env.AI_CHAT_MODEL || "gemini",
} as const;
