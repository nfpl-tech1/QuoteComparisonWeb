import { createClient } from "@/lib/supabase";

/**
 * Read a config value from Supabase config table.
 * Falls back to the provided env value if the DB row is empty or missing.
 */
export async function getConfigValue(key: string, envFallback = ""): Promise<string> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", key)
      .single();
    if (data?.value) return data.value;
  } catch {
    // DB unreachable — fall through to env fallback
  }
  return envFallback;
}

/**
 * Write a config value to the Supabase config table.
 */
export async function setConfigValue(key: string, value: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("app_config").upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
}
