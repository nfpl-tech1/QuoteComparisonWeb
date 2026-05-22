import { createClient } from "@/lib/supabase";
import { validateApiKey } from "@/lib/auth";
import { getConfigValue } from "@/lib/config";

const FALLBACK_RATES: Record<string, number> = {
  INR: 84.5, EUR: 0.92, GBP: 0.79, AED: 3.67,
  SGD: 1.35, CNY: 7.24, JPY: 149.5, AUD: 1.53,
  CAD: 1.36, THB: 35.2, MYR: 4.7, HKD: 7.82,
  CHF: 0.89, KRW: 1330.0,
};

export async function GET(request: Request) {
  const authError = await validateApiKey(request);
  if (authError) return authError;

  const today = new Date().toISOString().split("T")[0];
  const supabase = createClient();

  // Try DB cache first
  const { data: cached } = await supabase
    .from("exchange_rates_cache")
    .select("rates_json, fetched_at")
    .eq("rate_date", today)
    .single();

  if (cached) {
    return Response.json({
      rates: cached.rates_json,
      fetched_at: cached.fetched_at,
      source: "cached",
    });
  }

  // Fetch live from freecurrencyapi.com (key from DB config, fallback to env)
  const apiKey = await getConfigValue("free_currency_api_key", process.env.FREE_CURRENCY_API_KEY ?? "");
  if (apiKey) {
    try {
      const resp = await fetch(
        `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`,
        { signal: AbortSignal.timeout(10_000) }
      );
      if (resp.ok) {
        const json = await resp.json();
        const rates = json.data as Record<string, number>;
        const fetched_at = new Date().toISOString();

        await supabase.from("exchange_rates_cache").upsert({
          rate_date: today,
          rates_json: rates,
          fetched_at,
        });

        return Response.json({ rates, fetched_at, source: "live" });
      }
    } catch {
      // fall through to fallback
    }
  }

  // Last-resort: return hardcoded fallback rates (always 200, desktop handles display)
  return Response.json({
    rates: FALLBACK_RATES,
    fetched_at: new Date().toISOString(),
    source: "fallback",
  });
}
