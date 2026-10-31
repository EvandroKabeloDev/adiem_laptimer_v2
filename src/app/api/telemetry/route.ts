import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/server-supabase";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") || 100),1),500);
    const db = getServerSupabase();
    let query = db.from("rt004_laps").select("*").order("created_at",{ascending:false}).limit(limit);
    if (sessionId) query = query.eq("session_id",sessionId);
    const {data,error} = await query;
    if (error) return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  } catch (e) { return NextResponse.json({error:e instanceof Error?e.message:"Erro interno"},{status:500}); }
}
