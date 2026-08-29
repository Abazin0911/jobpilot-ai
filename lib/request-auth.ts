import { cookies } from "next/headers";
import { getUserIdFromToken, SESSION_COOKIE } from "./auth";

export async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  return getUserIdFromToken(cookieStore.get(SESSION_COOKIE)?.value);
}
