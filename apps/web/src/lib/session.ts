import { cookies } from "next/headers";

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  accessType: number; // 1 = Admin, 2 = Student (Siswa)
  currentCefr: string;
}

const SESSION_COOKIE_NAME = "eddy_session";

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  const sessionData = Buffer.from(JSON.stringify(user)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const raw = Buffer.from(sessionCookie.value, "base64").toString("utf8");
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
