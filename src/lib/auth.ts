import { getConfigValue } from "@/lib/config";

/**
 * Validate the X-API-Key header against the cloud_api_key stored in Supabase config
 * (falls back to CLOUD_API_KEY env var so existing deployments keep working).
 */
export async function validateApiKey(request: Request): Promise<Response | null> {
  const expected = await getConfigValue("cloud_api_key", process.env.CLOUD_API_KEY ?? "");
  if (!expected) {
    console.info("[auth] no cloud API key configured; allowing request");
    return null; // no key configured → open (dev convenience)
  }
  const provided = request.headers.get("x-api-key");
  if (provided !== expected) {
    console.warn("[auth] unauthorized request: x-api-key mismatch");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.info("[auth] x-api-key validated");
  return null;
}
