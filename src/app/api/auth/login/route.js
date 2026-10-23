import { NextResponse } from "next/server";
import pool from "@/config/db.config";
import { createTeacherSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const identifier = typeof email === "string" ? email.trim() : "";

    if (!identifier || typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Enter your email or employee ID and password." }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT u.mail_id, u.password
       FROM users u
       JOIN teachers t ON t.user_id = u.unique_id
       WHERE LOWER(u.mail_id) = LOWER($1) OR t.emp_id = $1
       LIMIT 1`,
      [identifier]
    );
    const user = result.rows[0];
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email, employee ID, or password." }, { status: 401 });
    }

    const session = createTeacherSession(user.mail_id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set("teacher_session", session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 3650,
    });
    return response;
  } catch (error) {
    console.error("Faculty sign in failed:", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
