
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request, context) {
  try {
    const { actionId } = await context.params;
    const { searchParams } = new URL(request.url);

    const cookieStore = await cookies();
    const email = getTeacherEmailFromSession(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const teacher = email ? await getUser(email) : null;
    const empId = teacher?.role === "teacher" ? teacher.empId : null;
    const program = searchParams.get("program")?.trim() || null;
    const semesterValue = searchParams.get("semester")?.trim() || null;
    const courseCode = searchParams.get("course_code")?.trim() || null;
    const section = searchParams.get("section")?.trim() || null;
    const assessment = searchParams.get("assessment")?.trim() || null;
    const category = searchParams.get("category")?.trim() || null;

    if (!actionId || !empId) {
      return NextResponse.json(
        { message: "Teacher sign-in is required." },
        { status: 401 }
      );
    }

    const semester = semesterValue ? Number(semesterValue) : null;

    if (
      semesterValue &&
      (!Number.isInteger(semester) || semester < 1)
    ) {
      return NextResponse.json(
        { message: "Invalid semester." },
        { status: 400 }
      );
    }

    // Confirm that this teacher has assigned this action.
    const actionQuery = `
      SELECT
        at.action_id,
        at.title,
        at.target_category,
        at.assessment_type
      FROM public.action_templates at
      WHERE at.action_id = $1
        AND EXISTS (
          SELECT 1
          FROM public.action_assignments aa
          WHERE aa.action_id = at.action_id
            AND aa.assigned_by_emp_id = $2
        )
        AND ($3::text IS NULL OR at.assessment_type = $3)
        AND ($4::text IS NULL OR at.target_category = $4)
      LIMIT 1;
    `;

    const actionResult = await pool.query(actionQuery, [
      actionId,
      empId,
      assessment,
      category,
    ]);

    if (actionResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Action not found or you are not authorized to view it." },
        { status: 404 }
      );
    }

    const studentsQuery = `
      SELECT
        aa.assignment_id,
        aa.enrollment_id,
        aa.created_at AS assigned_on,
        COALESCE(sas.status, aa.status, 'Assigned') AS status,
        COALESCE(sas.cloudinary_url, aa.evidence_url) AS evidence_url,
        sas.original_filename,
        sas.submission_text,
        sas.submitted_at,
        sas.reviewed_at,
        COALESCE(sas.review_feedback, aa.review_feedback) AS review_feedback,
        sas.submission_id,

        s.university_roll_no AS student_id,
        u.name AS student_name,

        ce.course_id,
        c.course_name,
        ce.semester,
        ce.academic_year

      FROM public.action_assignments aa

      JOIN public.action_templates at
        ON at.action_id = aa.action_id

      JOIN public.course_enrollment ce
        ON ce.id = aa.enrollment_id

      JOIN public.students s
        ON s.university_roll_no = ce.student_id

      LEFT JOIN public.users u
        ON u.unique_id = s.user_id

      LEFT JOIN public.courses c
        ON c.course_code = ce.course_id
      LEFT JOIN public.student_action_submissions sas
        ON sas.assignment_id = aa.assignment_id
       AND sas.student_id = s.university_roll_no

      WHERE aa.action_id = $1
        AND aa.assigned_by_emp_id = $2
        AND ($3::text IS NULL OR s.program_name = $3)
        AND ($4::int IS NULL OR ce.semester = $4)
        AND ($5::text IS NULL OR ce.course_id = $5)
        AND ($6::text IS NULL OR at.assessment_type = $6)
        AND ($7::text IS NULL OR at.target_category = $7)
        AND ($8::text IS NULL OR s.section = $8)
        AND s.semester = ce.semester

      ORDER BY u.name ASC NULLS LAST, s.university_roll_no ASC;
    `;

    const studentsResult = await pool.query(studentsQuery, [
      actionId,
      empId,
      program,
      semester,
      courseCode,
      assessment,
      category,
      section,
    ]);

    return NextResponse.json({
      action: actionResult.rows[0],
      students: studentsResult.rows,
    });
  } catch (error) {
    console.error("GET action students error:", error);

    return NextResponse.json(
      { message: "Failed to fetch students for this action." },
      { status: 500 }
    );
  }
}
