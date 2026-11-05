import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

const ASSESSMENTS = new Set(["pre-mse", "mse-1", "mse-2"]);
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
            assessment_stage_data.pre_mse_assessment_mark,
            assessment_stage_data.pre_mse_assessment_max_mark,
            assessment_stage_data.pre_mse_observation,
            assessment_stage_data.mse_1_attendance_pct,
            assessment_stage_data.mse_1_mark,
            assessment_stage_data.mse_1_max_mark,
            assessment_stage_data.mse_1_observation,
            assessment_stage_data.mse_2_attendance_pct,
            assessment_stage_data.mse_2_mark,
            assessment_stage_data.mse_2_max_mark,
            assessment_stage_data.mse_2_observation,
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
            SELECT
              MAX(obtained_mark) FILTER (WHERE type = 'pre-mse') AS pre_mse_assessment_mark,
              MAX(max_mark) FILTER (WHERE type = 'pre-mse') AS pre_mse_assessment_max_mark,
              MAX(faculty_observation) FILTER (WHERE type = 'pre-mse') AS pre_mse_observation,
              MAX(attendance_pct) FILTER (WHERE type = 'mse-1') AS mse_1_attendance_pct,
              MAX(obtained_mark) FILTER (WHERE type = 'mse-1') AS mse_1_mark,
              MAX(max_mark) FILTER (WHERE type = 'mse-1') AS mse_1_max_mark,
              MAX(faculty_observation) FILTER (WHERE type = 'mse-1') AS mse_1_observation,
              MAX(attendance_pct) FILTER (WHERE type = 'mse-2') AS mse_2_attendance_pct,
              MAX(obtained_mark) FILTER (WHERE type = 'mse-2') AS mse_2_mark,
              MAX(max_mark) FILTER (WHERE type = 'mse-2') AS mse_2_max_mark,
              MAX(faculty_observation) FILTER (WHERE type = 'mse-2') AS mse_2_observation
            FROM (
              SELECT DISTINCT ON (a.type)
                a.type,
                a.obtained_mark,
                a.max_mark,
                a.attendance_pct,
                a.faculty_observation
              FROM public.assessments a
              WHERE a.student_id = ce.student_id
                AND a.course_id = ce.course_id
                AND a.semester = ce.semester
                AND a.academic_year = ce.academic_year
                AND a.type IN ('pre-mse', 'mse-1', 'mse-2')
              ORDER BY a.type, a.id DESC
            ) latest_assessments
          ) assessment_stage_data ON TRUE
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
            COALESCE(pre_mse_assessment_mark, sgpa) AS pre_mse_mark,
            COALESCE(pre_mse_assessment_max_mark, 10) AS pre_mse_max_mark,
            CASE WHEN sgpa IS NULL THEN NULL
              ELSE DENSE_RANK() OVER (ORDER BY sgpa DESC NULLS LAST)
            END AS pre_mse_rank,
            CASE WHEN mse_1_mark IS NULL THEN NULL
              ELSE DENSE_RANK() OVER (ORDER BY mse_1_mark DESC NULLS LAST)
            END AS mse_1_rank,
            CASE WHEN mse_2_mark IS NULL THEN NULL
              ELSE DENSE_RANK() OVER (ORDER BY mse_2_mark DESC NULLS LAST)
            END AS mse_2_rank
          FROM eligible_students
        ),
        categorized_students AS (
          SELECT
            *,
            CASE
              WHEN $6 = 'pre-mse' THEN
                CASE
                  WHEN backlog THEN 'Gradual'
                  WHEN sgpa IS NULL THEN NULL
                  WHEN pre_mse_rank <= 10 THEN 'Gallant'
                  WHEN sgpa::numeric / 10 < 0.40 THEN 'Gradual'
                  ELSE 'Growing'
                END
              WHEN $6 = 'mse-1' THEN
                CASE
                  WHEN mse_1_mark IS NULL THEN NULL
                  WHEN mse_1_rank <= 10 THEN 'Gallant'
                  WHEN mse_1_mark::numeric / NULLIF(mse_1_max_mark, 0) < 0.40 THEN 'Gradual'
                  ELSE 'Growing'
                END
              ELSE
                CASE
                  WHEN mse_2_mark IS NULL THEN NULL
                  WHEN mse_2_rank <= 10 THEN 'Gallant'
                  WHEN mse_2_mark::numeric / NULLIF(mse_2_max_mark, 0) < 0.40 THEN 'Gradual'
                  ELSE 'Growing'
                END
            END AS three_g_category,
            CASE
              WHEN $6 = 'pre-mse' THEN NULL
              WHEN $6 = 'mse-1' THEN
                CASE
                  WHEN backlog THEN 'Gradual'
                  WHEN sgpa IS NULL THEN NULL
                  WHEN pre_mse_rank <= 10 THEN 'Gallant'
                  WHEN sgpa::numeric / 10 < 0.40 THEN 'Gradual'
                  ELSE 'Growing'
                END
              ELSE
                CASE
                  WHEN mse_1_mark IS NULL THEN NULL
                  WHEN mse_1_rank <= 10 THEN 'Gallant'
                  WHEN mse_1_mark::numeric / NULLIF(mse_1_max_mark, 0) < 0.40 THEN 'Gradual'
                  ELSE 'Growing'
                END
            END AS previous_three_g_category,
            CASE
              WHEN $6 = 'pre-mse' THEN pre_mse_mark
              WHEN $6 = 'mse-1' THEN mse_1_mark
              ELSE mse_2_mark
            END AS selected_mark,
            CASE
              WHEN $6 = 'pre-mse' THEN pre_mse_max_mark
              WHEN $6 = 'mse-1' THEN mse_1_max_mark
              ELSE mse_2_max_mark
            END AS selected_max_mark
          FROM ranked_students
        ),
        movement_students AS (
          SELECT
            *,
            CASE
              WHEN $6 = 'pre-mse' AND three_g_category IS NOT NULL
                THEN 'Baseline: ' || three_g_category
              WHEN three_g_category IS NULL THEN 'Not assessed'
              WHEN previous_three_g_category IS NULL
                THEN 'New in ' || three_g_category
              WHEN previous_three_g_category = three_g_category
                THEN 'Continued in ' || three_g_category
              ELSE previous_three_g_category || ' to ' || three_g_category
            END AS category_movement
          FROM categorized_students
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
          selected_mark AS obtained_mark,
          selected_max_mark AS max_mark,
          sgpa,
          CASE
            WHEN $6 = 'pre-mse' THEN pre_mse_rank
            WHEN $6 = 'mse-1' THEN mse_1_rank
            ELSE mse_2_rank
          END AS student_rank,
          three_g_category,
          category_movement,
          (three_g_category = 'Gradual' AND previous_three_g_category = 'Gradual')
            AS persistent_gradual,
          backlog,
          pre_mse_mark,
          pre_mse_max_mark,
          pre_mse_observation,
          mse_1_attendance_pct,
          mse_1_mark,
          mse_1_max_mark,
          mse_1_observation,
          mse_2_attendance_pct,
          mse_2_mark,
          mse_2_max_mark,
          mse_2_observation,
          action_data.actions_taken
        FROM movement_students categorized
        LEFT JOIN LATERAL (
          SELECT STRING_AGG(
            action_title,
            E'\n' ORDER BY action_title, action_id
          ) AS actions_taken
          FROM (
            SELECT DISTINCT
              at.action_id,
              at.title AS action_title
            FROM public.action_assignments aa
            JOIN public.action_templates at
              ON at.action_id = aa.action_id
            WHERE aa.enrollment_id = categorized.enrollment_id
              AND aa.assigned_by_emp_id = $8
              AND at.assessment_type = $6
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
        department: teacher.dept,
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
      actions: [...new Map(
        rows.flatMap((row) =>
          String(row.actions_taken || "")
            .split("\n")
            .filter(Boolean)
            .map((entry) => [entry, entry])
        )
      ).values()],
    });
  } catch (error) {
    console.error("Teacher report generation failed:", error);
    return NextResponse.json(
      { error: "Unable to generate the requested report." },
      { status: 500 }
    );
  }
}
