"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/lib/session";
import { getApiUrl } from "@/lib/api-client";

export const sessionKeys = {
  current: ["auth", "session"] as const,
};

export function useSession() {
  return useQuery<SessionUser | null>({
    queryKey: sessionKeys.current,
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) return data.user;
        }
        const apiRes = await fetch(getApiUrl("/api/auth/session"), {
          credentials: "include",
        });
        if (!apiRes.ok) return null;
        const apiData = await apiRes.json();
        return apiData?.user || null;
      } catch {
        return null;
      }
    },
  });
}
