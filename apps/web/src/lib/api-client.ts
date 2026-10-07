import { treaty } from "@elysiajs/eden";
import type { App } from "api";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const apiUrl = API_BASE_URL || "http://localhost:3003";

export const apiClient = treaty<App>(apiUrl, {
  fetch: { credentials: "include" },
});

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return cleanPath;
  return `${API_BASE_URL}${cleanPath}`;
}
