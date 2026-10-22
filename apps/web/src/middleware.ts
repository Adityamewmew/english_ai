import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./lib/session";

export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("eddy_session");
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/modules") ||
    pathname.startsWith("/call") ||
    pathname.startsWith("/placement");

  const validSession = sessionCookie?.value
    ? await verifySessionToken(sessionCookie.value)
    : null;

  if (!validSession && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (validSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/modules/:path*",
    "/call/:path*",
    "/placement/:path*",
    "/login",
    "/register",
  ],
};
