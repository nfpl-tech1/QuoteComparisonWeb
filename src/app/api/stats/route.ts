import { createClient } from "@/lib/supabase";

export interface StatsResponse {
  total_inquiries: number;
  total_quotes: number;
  avg_quotes_per_inquiry: number;
  mode_breakdown: { mode: string; count: number }[];
  user_breakdown: {
    user_name: string;
    workstation_id: string;
    count: number;
    last_active: string;
  }[];
}

// GET /api/stats — aggregated metrics, respects same filters as /api/inquiries
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const lane = searchParams.get("lane");
  const user = searchParams.get("user");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = createClient();
  let query = supabase
    .from("inquiry_log")
    .select("vendor_count, quote_count, mode, lane, user_name, workstation_id, logged_at");

  if (mode) query = query.eq("mode", mode.toUpperCase());
  if (lane) query = query.eq("lane", lane.toLowerCase());
  if (user) query = query.eq("user_name", user);
  if (from) query = query.gte("logged_at", from);
  if (to) query = query.lte("logged_at", `${to}T23:59:59Z`);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const total = rows.length;
  const totalQuotes = rows.reduce((s, r) => s + (r.quote_count || 0), 0);

  // Mode breakdown
  const modeCounts: Record<string, number> = {};
  rows.forEach((r) => {
    modeCounts[r.mode] = (modeCounts[r.mode] || 0) + 1;
  });
  const mode_breakdown = Object.entries(modeCounts)
    .map(([m, c]) => ({ mode: m, count: c }))
    .sort((a, b) => b.count - a.count);

  // User breakdown
  const userMap: Record<
    string,
    { user_name: string; workstation_id: string; count: number; last_active: string }
  > = {};
  rows.forEach((r) => {
    const key = `${r.user_name || ""}|||${r.workstation_id}`;
    if (!userMap[key]) {
      userMap[key] = {
        user_name: r.user_name || "",
        workstation_id: r.workstation_id,
        count: 0,
        last_active: "",
      };
    }
    userMap[key].count++;
    if (!userMap[key].last_active || r.logged_at > userMap[key].last_active) {
      userMap[key].last_active = r.logged_at;
    }
  });
  const user_breakdown = Object.values(userMap).sort((a, b) => b.count - a.count);

  const result: StatsResponse = {
    total_inquiries: total,
    total_quotes: totalQuotes,
    avg_quotes_per_inquiry: total ? +(totalQuotes / total).toFixed(1) : 0,
    mode_breakdown,
    user_breakdown,
  };

  return Response.json(result);
}
