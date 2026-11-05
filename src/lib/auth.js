import jwt from "jsonwebtoken";

const SESSION_COOKIE = "teacher_session";

function getSessionSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured for user sessions. Restart the app after updating .env.");
  return secret;
}

export function createUserSession(email, role) {
  return jwt.sign({ sub: email, role }, getSessionSecret(), { algorithm: "HS256" });
}

export function createTeacherSession(email) {
  return createUserSession(email, "teacher");
}

export function getSessionFromToken(token) {
  if (!token) return null;

  try {
    const claims = jwt.verify(token, getSessionSecret(), { algorithms: ["HS256"] });
    if (typeof claims.sub !== "string" || !claims.sub.includes("@")) return null;
    return {
      email: claims.sub,
      role: typeof claims.role === "string" ? claims.role : null,
    };
  } catch {
    return null;
  }
}

export function getTeacherEmailFromSession(token) {
  const session = getSessionFromToken(token);
  if (session?.role === "student") return null;
  return session?.email ?? null;
}

export { SESSION_COOKIE };
