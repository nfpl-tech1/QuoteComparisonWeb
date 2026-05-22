import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConfigValue } from "@/lib/config";

const COOKIE = "dash_auth";

async function makeSessionToken(): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? "dev-secret";
  const data = new TextEncoder().encode(`nagarkot:dash:${secret}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  return token === (await makeSessionToken());
}

// GET — check if current session is valid
export async function GET() {
  return Response.json({ ok: await isAuthenticated() });
}

// POST — log in
export async function POST(request: Request) {
  let body: { password?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Read password from Supabase config, fall back to env var
  const expected = await getConfigValue("dashboard_password", process.env.DASHBOARD_PASSWORD ?? "");
  if (!expected) {
    return Response.json({ error: "Dashboard password not configured" }, { status: 503 });
  }

  if (body.password !== expected) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await makeSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return res;
}

// DELETE — log out
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
