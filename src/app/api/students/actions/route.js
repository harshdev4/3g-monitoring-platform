import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/config/db.config";
import { getSessionFromToken, SESSION_COOKIE } from "@/lib/auth";

async function getStudentSession() {
  const cookieStore = await cookies();
  const session = getSessionFromToken(cookieStore.get(SESSION_COOKIE)?.value);
  return session?.role === "student" ? session : null;
}

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Student sign-in is required." }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT
         aa.assignment_id,
         aa.status AS assignment_status,
         aa.created_at AS assigned_at,
         at.title AS action_title,
         at.description AS action_description,
         at.target_category,
         COALESCE(act.title, at.title) AS title,
         COALESCE(act.description, at.description) AS description,
         COALESCE(act.assessment_type, at.assessment_type) AS assessment_type,
         COALESCE(act.target_category, at.target_category) AS assigned_category,
         act.due_date,
         ce.semester,
         ce.academic_year,
         COALESCE(act.course_code, ce.course_id) AS course_code,
         c.course_name,
         COALESCE(category_record.category, act.target_category, at.target_category) AS student_category,
         sas.submission_id,
         sas.status AS submission_status,
         sas.submission_text,
         sas.cloudinary_url,
         sas.original_filename,
         sas.submitted_at,
         sas.review_feedback
       FROM public.users u
       JOIN public.students s ON s.user_id = u.unique_id
       JOIN public.course_enrollment ce ON ce.student_id = s.university_roll_no
       JOIN public.action_assignments aa ON aa.enrollment_id = ce.id
       JOIN public.action_templates at ON at.action_id = aa.action_id
       LEFT JOIN public.activities act ON act.activity_id = aa.activity_id
       LEFT JOIN public.courses c
         ON c.course_code = COALESCE(act.course_code, ce.course_id)
       LEFT JOIN LATERAL (
         SELECT sar.category
         FROM public.student_academic_records sar
         WHERE sar.student_id = s.university_roll_no
           AND sar.semester = ce.semester
           AND sar.academic_year = ce.academic_year
         ORDER BY sar.created_at DESC
         LIMIT 1
       ) category_record ON TRUE
       LEFT JOIN public.student_action_submissions sas
         ON sas.assignment_id = aa.assignment_id
        AND sas.student_id = s.university_roll_no
       WHERE u.role = 'student'
         AND LOWER(u.mail_id) = LOWER($1)
       ORDER BY act.due_date ASC NULLS LAST, aa.created_at DESC`,
      [session.email]
    );

    return NextResponse.json({ assignments: rows });
  } catch (error) {
    console.error("GET student assignments failed:", error);
    return NextResponse.json({ error: "Unable to load your assignments." }, { status: 500 });
  }
}
