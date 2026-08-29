import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/request-auth";
import { listAnalyses } from "@/lib/db";
export const runtime = "nodejs";
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Please sign in to view your analysis history." }, { status: 401 });
    return NextResponse.json({ analyses: listAnalyses(userId) });
  } catch {
    return NextResponse.json({ error: "We could not load your analysis history right now." }, { status: 500 });
  }
}
