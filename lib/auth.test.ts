import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const directory = mkdtempSync(path.join(tmpdir(), "jobpilot-auth-"));
process.env.DATABASE_PATH = path.join(directory, "test.sqlite");
let auth: typeof import("./auth");
let database: typeof import("./db");
async function modules() {
  auth ??= await import("./auth");
  database ??= await import("./db");
}

test("users are registered with hashed passwords and can sign in", async () => {
  await modules();
  const user = await auth.registerUser("person@example.com", "secure-password");
  assert.notEqual(user.passwordHash, "secure-password");
  assert.equal(await auth.verifyPassword("secure-password", user.passwordHash), true);
  assert.equal((await auth.authenticateUser("person@example.com", "secure-password")).id, user.id);
  await assert.rejects(() => auth.authenticateUser("person@example.com", "wrong-password"), /Incorrect email or password/);
});

test("analyses are scoped to their owner for view and delete", async () => {
  await modules();
  const owner = await auth.registerUser("owner@example.com", "secure-password");
  const other = await auth.registerUser("other@example.com", "secure-password");
  const analysis = database.insertAnalysis({ userId: owner.id, cvFilename: "cv.pdf", jobDescription: "Support", cvText: "CV", result: { overallMatchScore: 80 } });
  assert.equal(database.getAnalysis(analysis.id, owner.id)?.id, analysis.id);
  assert.equal(database.getAnalysis(analysis.id, other.id), null);
  assert.equal(database.deleteAnalysis(analysis.id, other.id), false);
  assert.equal(database.listAnalyses(owner.id).length, 1);
  assert.equal(database.deleteAnalysis(analysis.id, owner.id), true);
  rmSync(directory, { recursive: true, force: true });
});
