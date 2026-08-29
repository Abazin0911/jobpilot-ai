import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/request-auth";
import { deleteAnalysis, getAnalysis } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Please sign in to view this analysis." }, { status: 401 });
    const { id } = await context.params;
    const analysis = getAnalysis(id, userId);
    return analysis ? NextResponse.json({ analysis }) : NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "We could not load that analysis right now." }, { status: 500 });
  }
}
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Please sign in to delete this analysis." }, { status: 401 });
    const { id } = await context.params;
    return deleteAnalysis(id, userId) ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "We could not delete that analysis right now." }, { status: 500 });
  }
}
