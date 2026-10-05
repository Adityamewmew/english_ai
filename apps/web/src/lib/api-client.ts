import { treaty } from "@elysiajs/eden";
import type { App } from "api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export const apiClient = treaty<App>(apiUrl, {
  fetch: { credentials: "include" },
});
