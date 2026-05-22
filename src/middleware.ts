import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function makeSessionToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`nagarkot:dash:${secret}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes use X-API-Key auth — never block at middleware level
  // Login page is the auth entry point — always allow
  if (pathname.startsWith("/api/") || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) return NextResponse.next(); // No secret set → open (local dev)

  const token = request.cookies.get("dash_auth")?.value;
  const expected = await makeSessionToken(secret);

  if (token !== expected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)).*)"],
};
