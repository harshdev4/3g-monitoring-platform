import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teacherEmail = getTeacherEmailFromSession(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const teacher = teacherEmail ? await getUser(teacherEmail) : null;

    if (!teacher || teacher.role !== "teacher" || !teacher.empId) {
      return NextResponse.json(
        { error: "You must be signed in as a teacher to view this information." },
        { status: 401 }
      );
    }

    const [summaryResult, activityResult] = await Promise.all([
      pool.query(
        `
          SELECT
            COUNT(*)::int AS assignment_count,
            COUNT(*) FILTER (
              WHERE LOWER(BTRIM(COALESCE(aa.status, ''))) IN (
                'completed', 'complete', 'approved', 'done'
              )
            )::int AS completed_count,
            COUNT(*) FILTER (
              WHERE LOWER(BTRIM(COALESCE(aa.status, ''))) IN (
                'in progress',
                'evidence submitted',
                'submitted',
                'pending review',
                'under review'
              )
            )::int AS in_progress_count,
            COUNT(*) FILTER (
              WHERE NULLIF(BTRIM(aa.evidence_url), '') IS NOT NULL
            )::int AS student_evidence_count,
            (
              SELECT COUNT(*)::int
              FROM public.teacher_action_submissions tas
              WHERE tas.emp_id = $1
            ) AS teacher_evidence_count
          FROM public.action_assignments aa
          WHERE aa.assigned_by_emp_id = $1
        `,
        [teacher.empId]
      ),
      pool.query(
        `
          SELECT
            recent.id,
            recent.action_id,
            recent.title,
            recent.activity_type,
            recent.description,
            recent.occurred_at
          FROM (
            SELECT
              aa.assignment_id::text AS id,
              aa.action_id::text AS action_id,
              at.title,
              'Action assigned'::text AS activity_type,
              CONCAT_WS(
                ' · ',
                COALESCE(NULLIF(BTRIM(u.name), ''), s.university_roll_no),
                ce.course_id,
                COALESCE(NULLIF(BTRIM(aa.status), ''), 'Assigned')
              ) AS description,
              aa.created_at AS occurred_at
            FROM public.action_assignments aa
            JOIN public.action_templates at
              ON at.action_id = aa.action_id
            JOIN public.course_enrollment ce
              ON ce.id = aa.enrollment_id
            JOIN public.students s
              ON s.university_roll_no = ce.student_id
            LEFT JOIN public.users u
              ON u.unique_id = s.user_id
            WHERE aa.assigned_by_emp_id = $1

            UNION ALL

            SELECT
              tas.submission_id::text AS id,
              tas.action_id::text AS action_id,
              at.title,
              'Evidence submitted'::text AS activity_type,
              CONCAT_WS(
                ' · ',
                tas.original_filename,
                NULLIF(tas.course_code, ''),
                CASE
                  WHEN tas.semester IS NOT NULL
                    THEN 'Semester ' || tas.semester::text
                END
              ) AS description,
              tas.submitted_at AS occurred_at
            FROM public.teacher_action_submissions tas
            JOIN public.action_templates at
              ON at.action_id = tas.action_id
            WHERE tas.emp_id = $1
          ) recent
          ORDER BY recent.occurred_at DESC NULLS LAST, recent.id DESC
          LIMIT 5
        `,
        [teacher.empId]
      ),
    ]);

    const summary = summaryResult.rows[0];
    return NextResponse.json({
      monitoring: {
        assignmentCount: summary.assignment_count,
        completedCount: summary.completed_count,
        inProgressCount: summary.in_progress_count,
        assignedCount:
          summary.assignment_count -
          summary.completed_count -
          summary.in_progress_count,
        studentEvidenceCount: summary.student_evidence_count,
        teacherEvidenceCount: summary.teacher_evidence_count,
        recentActivities: activityResult.rows,
      },
    });
  } catch (error) {
    console.error("Teacher action monitoring fetch failed:", error);
    return NextResponse.json(
      { error: "Unable to load action and evidence monitoring." },
      { status: 500 }
    );
  }
}
