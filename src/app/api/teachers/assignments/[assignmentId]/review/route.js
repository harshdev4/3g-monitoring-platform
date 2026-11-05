import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

const REVIEW_STATUSES = new Set(["approved", "resubmission_required"]);
const MAX_FEEDBACK_LENGTH = 2000;

export async function PATCH(request, context) {
  try {
    const cookieStore = await cookies();
    const email = getTeacherEmailFromSession(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const teacher = email ? await getUser(email) : null;

    if (teacher?.role !== "teacher" || !teacher.empId) {
      return NextResponse.json(
        { error: "Teacher sign-in is required." },
        { status: 401 }
      );
    }

    const { assignmentId } = await context.params;
    if (!/^\d+$/.test(String(assignmentId))) {
      return NextResponse.json(
        { error: "A valid assignment is required." },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Review details must be valid JSON." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Review details must be a JSON object." },
        { status: 400 }
      );
    }

    const status = typeof body.status === "string" ? body.status : "";
    const feedback = typeof body.feedback === "string" ? body.feedback.trim() : "";

    if (!REVIEW_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Choose approve or request resubmission." },
        { status: 400 }
      );
    }
    if (feedback.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json(
        { error: `Feedback must be ${MAX_FEEDBACK_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }
    if (status === "resubmission_required" && !feedback) {
      return NextResponse.json(
        { error: "Add feedback explaining what the student should update." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE public.student_action_submissions sas
       SET status = $1,
           review_feedback = NULLIF($2, ''),
           reviewed_by_emp_id = $3,
           reviewed_at = NOW(),
           updated_at = NOW()
       FROM public.action_assignments aa
       WHERE sas.assignment_id = $4
         AND aa.assignment_id = sas.assignment_id
         AND aa.assigned_by_emp_id = $3
         AND sas.status IN ('submitted', 'under_review', 'rejected', 'resubmission_required')
       RETURNING sas.submission_id, sas.assignment_id, sas.status,
                 sas.review_feedback, sas.reviewed_at`,
      [status, feedback, teacher.empId, assignmentId]
    );

    if (!result.rows[0]) {
      const assignmentResult = await pool.query(
        `SELECT EXISTS (
           SELECT 1
           FROM public.action_assignments aa
           WHERE aa.assignment_id = $1
             AND aa.assigned_by_emp_id = $2
         ) AS is_assigned`,
        [assignmentId, teacher.empId]
      );

      if (!assignmentResult.rows[0]?.is_assigned) {
        return NextResponse.json(
          { error: "Assignment not found or you are not authorized to review it." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "This assignment has no reviewable student submission." },
        { status: 409 }
      );
    }

    return NextResponse.json({ submission: result.rows[0] });
  } catch (error) {
    console.error("Teacher student-submission review failed:", error);
    return NextResponse.json(
      { error: "Unable to save the submission review." },
      { status: 500 }
    );
  }
}
