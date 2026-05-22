import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase";
import { getConfigValue, setConfigValue } from "@/lib/config";

const ALLOWED_KEYS = ["dashboard_password", "cloud_api_key", "free_currency_api_key"] as const;

async function makeSessionToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`nagarkot:dash:${secret}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function isAuthenticated(): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return true;
  const store = await cookies();
  const token = store.get("dash_auth")?.value;
  return token === (await makeSessionToken(secret));
}

export interface SettingsInfo {
  cloud_service_url: string;
  cloud_api_key: string;
  cloud_api_key_source: "db" | "env" | "unset";
  supabase_connected: boolean;
  free_currency_set: boolean;
  dashboard_password_set: boolean;
  total_inquiries: number;
}

// GET — return current config values (requires auth)
export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();
  const { count } = await supabase
    .from("inquiry_log")
    .select("*", { count: "exact", head: true });

  const dbKey = await getConfigValue("cloud_api_key");
  const envKey = process.env.CLOUD_API_KEY ?? "";

  const [dbFreeCurrency, dbPassword] = await Promise.all([
    getConfigValue("free_currency_api_key"),
    getConfigValue("dashboard_password"),
  ]);

  const info: SettingsInfo = {
    cloud_service_url:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""),
    cloud_api_key: dbKey || envKey,
    cloud_api_key_source: dbKey ? "db" : envKey ? "env" : "unset",
    supabase_connected: !!(
      process.env.SUPABASE_URL &&
      (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY)
    ),
    free_currency_set: !!(dbFreeCurrency || process.env.FREE_CURRENCY_API_KEY),
    dashboard_password_set: !!(dbPassword || process.env.DASHBOARD_PASSWORD),
    total_inquiries: count ?? 0,
  };

  return Response.json(info);
}

// PATCH — update a config value (requires auth)
export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { key?: string; value?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { key, value } = body;
  if (!key || !ALLOWED_KEYS.includes(key as typeof ALLOWED_KEYS[number])) {
    return Response.json({ error: "Invalid key" }, { status: 400 });
  }
  if (value === undefined || value === null) {
    return Response.json({ error: "Missing value" }, { status: 400 });
  }

  await setConfigValue(key, value);
  return Response.json({ ok: true });
}
