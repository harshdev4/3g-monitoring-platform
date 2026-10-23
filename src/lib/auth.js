import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "teacher_session";
const JWT_HEADER = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

function getSessionSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured for faculty sessions. Restart the app after updating .env.");
  return secret;
}

function sign(input) {
  return createHmac("sha256", getSessionSecret()).update(input).digest("base64url");
}

export function createTeacherSession(email) {
  const payload = Buffer.from(JSON.stringify({ sub: email, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const input = `${JWT_HEADER}.${payload}`;
  return `${input}.${sign(input)}`;
}

export function getTeacherEmailFromSession(token) {
  if (!token) return null;
  const [header, payload, signature, extra] = token.split(".");
  if (!header || !payload || !signature || extra || header !== JWT_HEADER) return null;

  try {
    const expected = Buffer.from(sign(`${header}.${payload}`));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof claims.sub === "string" && claims.sub.includes("@") ? claims.sub : null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
