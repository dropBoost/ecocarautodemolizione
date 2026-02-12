import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // esempi parametri: ?from=2026-01-01&to=2026-01-31
  const from = searchParams.get("from"); // gte
  const to = searchParams.get("to");     // lte

  let query = supabaseAdmin
    .from("certificato_demolizione")
    .select("*", { count: "exact" });

  // aggiungi filtri solo se arrivano
  if (from) query = query.gte("created_at_certificato_demolizione", from);
  if (to) query = query.lte("created_at_certificato_demolizione", to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message, details: error.details, code: error.code },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: data ?? [], count: count ?? 0 });
}
