import { createClient } from "@/lib/supabase";
import { validateApiKey } from "@/lib/auth";

// POST /api/inquiries — called by the desktop tool when comparison is viewed
export async function POST(request: Request) {
  console.info("[api/inquiries] POST received");
  const authError = await validateApiKey(request);
  if (authError) return authError;
  console.info("[api/inquiries] auth passed");

  let body: {
    inquiry_number: string;
    mode: string;
    lane?: string;
    workstation_id: string;
    user_name?: string;
    vendor_count: number;
    quote_count: number;
    vendor_names: string[];
  };

  try {
    body = await request.json();
    console.info("[api/inquiries] request body parsed");
  } catch (error) {
    console.error("[api/inquiries] invalid JSON", error);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { inquiry_number, mode, lane, workstation_id, user_name, vendor_count, quote_count, vendor_names } = body;
  if (!inquiry_number || !mode || !workstation_id) {
    console.error("[api/inquiries] missing required fields", {
      inquiry_number,
      mode,
      workstation_id,
    });
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  console.info("[api/inquiries] payload validated", {
    inquiry_number: inquiry_number.toUpperCase(),
    mode: mode.toUpperCase(),
    lane: (lane ?? "").toLowerCase(),
    workstation_id,
    vendor_count: vendor_count ?? 0,
    quote_count: quote_count ?? 0,
    vendor_names_count: Array.isArray(vendor_names) ? vendor_names.length : 0,
  });

  const supabase = createClient();
  console.info("[api/inquiries] upsert starting");
  const { data, error } = await supabase
    .from("inquiry_log")
    .upsert(
      {
        inquiry_number: inquiry_number.toUpperCase(),
        mode: mode.toUpperCase(),
        lane: (lane ?? "").toLowerCase(),
        workstation_id,
        user_name: user_name ?? "",
        vendor_count: vendor_count ?? 0,
        quote_count: quote_count ?? 0,
        vendor_names: vendor_names ?? [],
        logged_at: new Date().toISOString(),
      },
      { onConflict: "inquiry_number,mode" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("[api/inquiries] upsert failed", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return Response.json({ error: error.message }, { status: 500 });
  }

  console.info("[api/inquiries] upsert succeeded", { id: data.id });
  return Response.json({ id: data.id }, { status: 200 });
}

// GET /api/inquiries — called by the dashboard table
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const lane = searchParams.get("lane");
  const user = searchParams.get("user");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const supabase = createClient();
  let query = supabase
    .from("inquiry_log")
    .select("*", { count: "exact" })
    .order("logged_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (mode) query = query.eq("mode", mode.toUpperCase());
  if (lane) query = query.eq("lane", lane.toLowerCase());
  if (user) query = query.eq("user_name", user);
  if (from) query = query.gte("logged_at", from);
  if (to) query = query.lte("logged_at", `${to}T23:59:59Z`);

  const { data, error, count } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ total: count ?? 0, items: data ?? [] });
}
