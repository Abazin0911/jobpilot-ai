import { NextResponse } from "next/server";
import { findUserById } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/request-auth";
export async function GET() {
  const id = await getAuthenticatedUserId();
  return NextResponse.json({ user: id ? (() => { const user = findUserById(id); return user ? { id: user.id, email: user.email } : null; })() : null });
}
