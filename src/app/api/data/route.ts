import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/server-supabase";

const TABLES = new Set([
  "clients_v2","devices_v2","pilots_v2","karts_v2","tracks_v2","track_layouts_v2",
  "events_v2","event_entries_v2","setups_v2","maintenance_v2","inventory_items_v2",
  "inventory_movements_v2","financial_entries_v2","lap_notes_v2","session_changes_v2",
  "audit_log_v2","admin_users_v2"
]);
const IDENTIFIER = /^[a-zA-Z0-9_-]{1,80}$/;
export async function GET(req: NextRequest) {
  try {
    const table = req.nextUrl.searchParams.get("table") || "";
    if (!TABLES.has(table)) return NextResponse.json({error:"Tabela não permitida."},{status:400});
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") || 100),1),500);
    const db = getServerSupabase();
    const {data,error} = await db.from(table).select("*").order("created_at",{ascending:false}).limit(limit);
    if (error) return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  } catch (e) { return NextResponse.json({error:e instanceof Error?e.message:"Erro interno"},{status:500}); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const table = String(body.table || "");
    if (!TABLES.has(table) || !body.record || typeof body.record !== "object") return NextResponse.json({error:"Tabela ou registro inválido."},{status:400});
    delete body.record.id;
    delete body.record.created_at;
    delete body.record.updated_at;
    const db = getServerSupabase();
    const {data,error} = await db.from(table).insert(body.record).select().single();
    if (error) return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data},{status:201});
  } catch (e) { return NextResponse.json({error:e instanceof Error?e.message:"Erro interno"},{status:500}); }
}
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const table = String(body.table || ""), id = String(body.id || "");
    if (!TABLES.has(table) || !IDENTIFIER.test(id) || !body.record || typeof body.record !== "object") return NextResponse.json({error:"Tabela, ID ou registro inválido."},{status:400});
    const record = {...body.record}; delete record.id; delete record.created_at; delete record.updated_at;
    const db = getServerSupabase();
    const {data,error} = await db.from(table).update(record).eq("id",id).select().single();
    if (error) return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  } catch (e) { return NextResponse.json({error:e instanceof Error?e.message:"Erro interno"},{status:500}); }
}
