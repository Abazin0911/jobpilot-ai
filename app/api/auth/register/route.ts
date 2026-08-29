import { NextResponse } from "next/server";
import { registerUser, createSessionToken, SESSION_COOKIE, SESSION_TTL } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerUser(String(body.email ?? ""), String(body.password ?? ""));
    const response = NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: SESSION_TTL, path: "/" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 400 });
  }
}
