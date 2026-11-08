import { cookies } from "next/headers";

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  accessType: number; // 1 = Admin, 2 = Student (Siswa)
  currentCefr: string;
  exp?: number;
  iat?: number;
}

const SESSION_COOKIE_NAME = "eddy_session";

function getSessionSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return "eddy_build_placeholder_secret";
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL SECURITY CONFIGURATION: BETTER_AUTH_SECRET must be configured in production environment!");
    }
    return "eddy_english_ai_dev_secret_insecure_do_not_use_in_prod";
  }
  return secret;
}

/**
 * Sign session payload using native Web Crypto HMAC-SHA256 (Constant-time verification)
 */
export async function signSessionToken(user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 86400; // 7 days cryptographic expiration (SK10)
  const payloadWithExpiry: SessionUser = {
    ...user,
    iat: user.iat || now,
    exp: user.exp || exp,
  };
  const payloadString = JSON.stringify(payloadWithExpiry);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadString)
  );

  const payloadBase64 = Buffer.from(payloadString, "utf8").toString("base64url");
  const sigBase64 = Buffer.from(signature).toString("base64url");
  return `${payloadBase64}.${sigBase64}`;
}

/**
 * Verify and decode session token, preventing tampering and cookie forgery
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadBase64, sigBase64] = parts;
    const payloadString = Buffer.from(payloadBase64, "base64url").toString("utf8");

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(getSessionSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBuffer = Buffer.from(sigBase64, "base64url");
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      encoder.encode(payloadString)
    );

    if (!isValid) return null;
    const session = JSON.parse(payloadString) as SessionUser;

    // SK10: Enforce expiration check (prevent indefinitely valid stateless tokens)
    const now = Math.floor(Date.now() / 1000);
    if (session.exp && session.exp < now) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  const token = await signSessionToken(user);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
