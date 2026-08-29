import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

export type User = { id: string; email: string; passwordHash: string; createdAt: string };
export type StoredAnalysis = {
  id: string; userId: string; createdAt: string; cvFilename: string; jobDescription: string; cvText: string;
  result: Record<string, unknown>; improvedCv: Record<string, unknown> | null;
};
type AnalysisRow = { id: string; user_id: string; created_at: string; cv_filename: string; job_description: string; cv_text: string; result_json: string; improved_cv_json: string | null };

let database: Database.Database | undefined;
function db() {
  if (!database) {
    const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "jobpilot.sqlite");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    database = new Database(file);
    database.pragma("journal_mode = WAL");
    database.exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS analyses (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TEXT NOT NULL, cv_filename TEXT NOT NULL, job_description TEXT NOT NULL, cv_text TEXT NOT NULL, result_json TEXT NOT NULL, improved_cv_json TEXT);
      CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses(user_id);`);
  }
  return database;
}
export function findUserByEmail(email: string): User | null { return (db().prepare("SELECT id, email, password_hash as passwordHash, created_at as createdAt FROM users WHERE email = ?").get(email) as User | undefined) || null; }
export function findUserById(id: string): User | null { return (db().prepare("SELECT id, email, password_hash as passwordHash, created_at as createdAt FROM users WHERE id = ?").get(id) as User | undefined) || null; }
export function insertUser(email: string, passwordHash: string): User { const user = { id: randomUUID(), email, passwordHash, createdAt: new Date().toISOString() }; db().prepare("INSERT INTO users (id,email,password_hash,created_at) VALUES (?,?,?,?)").run(user.id,user.email,user.passwordHash,user.createdAt); return user; }
export function insertAnalysis(input: Omit<StoredAnalysis, "id" | "createdAt" | "improvedCv"> & { improvedCv?: Record<string, unknown> | null }): StoredAnalysis { const row = { id: randomUUID(), createdAt: new Date().toISOString(), improvedCv: input.improvedCv ?? null, ...input }; db().prepare("INSERT INTO analyses VALUES (?,?,?,?,?,?,?,?)").run(row.id,row.userId,row.createdAt,row.cvFilename,row.jobDescription,row.cvText,JSON.stringify(row.result),row.improvedCv ? JSON.stringify(row.improvedCv) : null); return row; }
export function listAnalyses(userId: string) { return (db().prepare("SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC").all(userId) as AnalysisRow[]).map(parseAnalysis); }
export function getAnalysis(id: string, userId: string) { const row = db().prepare("SELECT * FROM analyses WHERE id = ? AND user_id = ?").get(id,userId) as AnalysisRow | undefined; return row ? parseAnalysis(row) : null; }
export function updateImprovedCv(id: string, userId: string, improvedCv: Record<string, unknown>) { return db().prepare("UPDATE analyses SET improved_cv_json = ? WHERE id = ? AND user_id = ?").run(JSON.stringify(improvedCv),id,userId).changes > 0; }
export function deleteAnalysis(id: string, userId: string) { return db().prepare("DELETE FROM analyses WHERE id = ? AND user_id = ?").run(id,userId).changes > 0; }
function parseAnalysis(row: AnalysisRow): StoredAnalysis { return { id: row.id, userId: row.user_id, createdAt: row.created_at, cvFilename: row.cv_filename, jobDescription: row.job_description, cvText: row.cv_text, result: JSON.parse(row.result_json) as Record<string, unknown>, improvedCv: row.improved_cv_json ? JSON.parse(row.improved_cv_json) as Record<string, unknown> : null }; }
