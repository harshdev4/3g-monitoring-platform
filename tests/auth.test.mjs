import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createUserSession,
  getSessionFromToken,
  getTeacherEmailFromSession,
} from "../src/lib/auth.js";

process.env.JWT_SECRET = "student-session-test-secret";

test("student session records the registered email and role", () => {
  const token = createUserSession("student@example.edu", "student");

  assert.deepEqual(getSessionFromToken(token), {
    email: "student@example.edu",
    role: "student",
  });
});

test("teacher session helper rejects student sessions", () => {
  const token = createUserSession("student@example.edu", "student");

  assert.equal(getTeacherEmailFromSession(token), null);
});

test("invalid session tokens are rejected", () => {
  assert.equal(getSessionFromToken("not-a-valid-token"), null);
});
