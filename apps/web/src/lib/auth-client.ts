import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NODE_ENV === "production"
    ? "https://eddys.drimland.my.id"
    : "http://localhost:3003";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});
