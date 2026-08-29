import { createHmac, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { findUserById, findUserByEmail, insertUser } from "./db";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "jobpilot_session";
const SESSION_TTL = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not configured.");
  return "jobpilot-development-secret-change-in-production";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error("Please enter a valid email address.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (findUserByEmail(normalizedEmail)) throw new Error("An account with this email already exists.");
  return insertUser(normalizedEmail, await hashPassword(password));
}

export async function authenticateUser(email: string, password: string) {
  const user = findUserByEmail(email.trim().toLowerCase());
  if (!user || !(await verifyPassword(password, user.passwordHash))) throw new Error("Incorrect email or password.");
  return user;
}

export function createSessionToken(userId: string) {
  const payload = `${userId}.${Date.now() + SESSION_TTL * 1000}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function getUserIdFromToken(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || Number(parts[1]) < Date.now()) return null;
  const expected = createHmac("sha256", secret()).update(`${parts[0]}.${parts[1]}`).digest("base64url");
  if (expected.length !== parts[2].length || !timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]))) return null;
  return findUserById(parts[0]) ? parts[0] : null;
}

export { SESSION_COOKIE, SESSION_TTL };
