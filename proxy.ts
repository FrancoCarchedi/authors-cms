import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "better-auth.session_token";
const SECURE_SESSION_COOKIE = "__Secure-better-auth.session_token";

export function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get(SECURE_SESSION_COOKIE)?.value ??
    request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/articles/:path*", "/profile/:path*"],
};
