import jwt from "jsonwebtoken";

const SESSION_COOKIE = "teacher_session";

function getSessionSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured for faculty sessions. Restart the app after updating .env.");
  return secret;
}

export function createTeacherSession(email) {
  return jwt.sign({ sub: email }, getSessionSecret(), { algorithm: "HS256" });
}

export function getTeacherEmailFromSession(token) {
  if (!token) return null;

  try {
    const claims = jwt.verify(token, getSessionSecret(), { algorithms: ["HS256"] });
    return typeof claims.sub === "string" && claims.sub.includes("@") ? claims.sub : null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
