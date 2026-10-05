"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/lib/session";

export const sessionKeys = {
  current: ["auth", "session"] as const,
};

export function useSession() {
  return useQuery<SessionUser | null>({
    queryKey: sessionKeys.current,
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return null;
        const data = await res.json();
        return data?.user || null;
      } catch {
        return null;
      }
    },
  });
}
