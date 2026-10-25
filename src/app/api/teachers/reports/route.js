import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

const ASSESSMENTS = new Set(["pre-mse", "mse-1", "mse-2", "ese"]);
const CATEGORIES = new Set(["Gradual", "Growing", "Gallant"]);

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const teacherEmail = getTeacherEmailFromSession(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const teacher = teacherEmail ? await getUser(teacherEmail) : null;

    if (!teacher || teacher.role !== "teacher" || !teacher.empId) {
      return NextResponse.json(
        { error: "You must be signed in as a teacher to generate reports." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const program = searchParams.get("program")?.trim();
    const semester = Number(searchParams.get("semester"));
    const section = searchParams.get("section")?.trim();
    const courseCode = searchParams.get("course_code")?.trim();
    const academicYear = searchParams.get("academic_year")?.trim();
    const assessment = searchParams.get("assessment")?.trim();
    const reportType = searchParams.get("report_type")?.trim();

    if (
      !program ||
      !Number.isInteger(semester) ||
      semester < 1 ||
      !section ||
      !courseCode ||
      !academicYear ||
      !ASSESSMENTS.has(assessment) ||
      !["master", ...CATEGORIES].includes(reportType)
    ) {
      return NextResponse.json(
        { error: "Select a valid program, semester, class, course, year, assessment, and report type." },
        { status: 400 }
      );
    }

    if (assessment === "pre-mse" && semester === 1) {
      return NextResponse.json(
        { error: "Pre-MSE reports are not available for semester 1." },
        { status: 400 }
      );
    }

    const assignmentResult = await pool.query(
      `
        SELECT 1
        FROM public.assigned_courses ac
        WHERE ac.emp_id = $1
          AND ac.course_id = $2
          AND ac.semester = $3
          AND ac.section = $4
          AND ac.academic_year = $5
        LIMIT 1
      `,
      [teacher.empId, courseCode, semester, section, academicYear]
    );

    if (assignmentResult.rowCount === 0) {
      return NextResponse.json(
        { error: "You are not assigned to this course, class, semester, and academic year." },
        { status: 403 }
      );
    }

    const { rows } = await pool.query(
      `
        WITH eligible_students AS (
          SELECT
            ce.id AS enrollment_id,
            ce.student_id,
            ce.course_id,
            ce.semester,
            ce.academic_year,
            s.program_name,
            s.section,
            u.name AS student_name,
            c.course_name,
            assessment_data.obtained_mark,
            assessment_data.max_mark,
            assessment_data.attendance_pct,
            assessment_data.faculty_observation,
            assessment_data.assessment_uploaded_at,
            academic_data.sgpa,
            academic_data.backlog AS backlog
          FROM public.course_enrollment ce
          JOIN public.students s
            ON s.university_roll_no = ce.student_id
            AND s.semester = ce.semester
          JOIN public.users u
            ON u.unique_id = s.user_id
          JOIN public.courses c
            ON c.course_code = ce.course_id
          LEFT JOIN LATERAL (
            SELECT
              a.obtained_mark,
              a.max_mark,
              a.attendance_pct,
              a.faculty_observation,
              ai.uploaded_at AS assessment_uploaded_at
            FROM public.assessments a
            LEFT JOIN public.assessment_imports ai
              ON ai.import_id = a.import_id
            WHERE a.student_id = ce.student_id
              AND a.course_id = ce.course_id
              AND a.semester = ce.semester
              AND a.academic_year = ce.academic_year
              AND a.type = $6
            ORDER BY a.id DESC
            LIMIT 1
          ) assessment_data ON TRUE
          LEFT JOIN LATERAL (
            SELECT sar.sgpa, sar.backlog
            FROM public.student_academic_records sar
            WHERE sar.student_id = ce.student_id
              AND sar.semester + 1 = ce.semester
            ORDER BY sar.created_at DESC, sar.id DESC
            LIMIT 1
          ) academic_data ON TRUE
          WHERE ce.course_id = $1
            AND ce.semester = $2
            AND ce.academic_year = $3
            AND s.program_name = $4
            AND s.section = $5
        ),
        ranked_students AS (
          SELECT
            *,
            CASE
              WHEN $6 = 'pre-mse' AND sgpa IS NOT NULL THEN
                DENSE_RANK() OVER (
                  ORDER BY CASE WHEN $6 = 'pre-mse' THEN sgpa END DESC NULLS LAST
                )
              WHEN $6 <> 'pre-mse' AND obtained_mark IS NOT NULL THEN
                DENSE_RANK() OVER (
                  ORDER BY CASE WHEN $6 <> 'pre-mse' THEN obtained_mark END DESC NULLS LAST
                )
              ELSE NULL
            END AS student_rank
          FROM eligible_students
        ),
        categorized_students AS (
          SELECT
            *,
            CASE
              WHEN $6 = 'pre-mse' AND backlog THEN 'Gradual'
              WHEN student_rank IS NULL THEN NULL
              WHEN student_rank <= 10 THEN 'Gallant'
              WHEN $6 = 'pre-mse' AND sgpa::numeric / 10 < 0.40 THEN 'Gradual'
              WHEN $6 <> 'pre-mse'
                AND obtained_mark::numeric / NULLIF(max_mark, 0) < 0.40
                THEN 'Gradual'
              ELSE 'Growing'
            END AS three_g_category,
            CASE
              WHEN $6 = 'pre-mse' THEN sgpa::numeric / 10 * 100
              ELSE obtained_mark::numeric / NULLIF(max_mark, 0) * 100
            END AS obtained_percentage
          FROM ranked_students
        )
        SELECT
          student_name,
          student_id AS university_roll_no,
          program_name,
          semester,
          section,
          academic_year,
          course_id AS course_code,
          course_name,
          $6::text AS assessment_type,
          obtained_mark,
          max_mark,
          ROUND(obtained_percentage, 2) AS obtained_percentage,
          attendance_pct,
          sgpa,
          student_rank,
          three_g_category,
          backlog,
          faculty_observation,
          assessment_uploaded_at,
          action_data.actions_taken
        FROM categorized_students categorized
        LEFT JOIN LATERAL (
          SELECT STRING_AGG(
            action_entry,
            E'\n' ORDER BY action_title, action_id
          ) AS actions_taken
          FROM (
            SELECT DISTINCT
              at.action_id,
              at.title AS action_title,
              at.title AS action_entry
            FROM public.action_assignments aa
            JOIN public.action_templates at
              ON at.action_id = aa.action_id
            WHERE aa.enrollment_id = categorized.enrollment_id
              AND aa.assigned_by_emp_id = $8
              AND at.submitter_type IS DISTINCT FROM 'teacher'
              AND at.assessment_type = $6
              AND at.target_category = categorized.three_g_category

            UNION

            SELECT DISTINCT
              at.action_id,
              at.title AS action_title,
              at.title || ' — Evidence: ' || tas.cloudinary_url AS action_entry
            FROM public.teacher_action_submissions tas
            JOIN public.action_templates at
              ON at.action_id = tas.action_id
            WHERE tas.emp_id = $8
              AND tas.program_name = categorized.program_name
              AND tas.semester = categorized.semester
              AND tas.course_code = categorized.course_id
              AND tas.assessment_type = $6
              AND tas.target_category = categorized.three_g_category
              AND at.submitter_type = 'teacher'
          ) student_actions
        ) action_data ON TRUE
        WHERE $7 = 'master' OR categorized.three_g_category = $7
        ORDER BY
          CASE WHEN categorized.student_id ~ '^[0-9]+$' THEN 0 ELSE 1 END,
          CASE
            WHEN categorized.student_id ~ '^[0-9]+$'
              THEN categorized.student_id::NUMERIC
            ELSE NULL
          END,
          categorized.student_id ASC
      `,
      [
        courseCode,
        semester,
        academicYear,
        program,
        section,
        assessment,
        reportType,
        teacher.empId,
      ]
    );

    return NextResponse.json({
      teacher: {
        name: teacher.name,
        empId: teacher.empId,
      },
      filters: {
        program,
        semester,
        section,
        courseCode,
        academicYear,
        assessment,
        reportType,
      },
      rows,
    });
  } catch (error) {
    console.error("Teacher report generation failed:", error);
    return NextResponse.json(
      { error: "Unable to generate the requested report." },
      { status: 500 }
    );
  }
}
