import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

async function getTeacher() {
  const cookieStore = await cookies();
  const email = getTeacherEmailFromSession(
    cookieStore.get(SESSION_COOKIE)?.value
  );
  const teacher = email ? await getUser(email) : null;
  return teacher?.role === "teacher" && teacher.empId ? teacher : null;
}

export async function POST(request) {
  try {
    const teacher = await getTeacher();
    if (!teacher) {
      return NextResponse.json(
        { error: "You must be signed in as a teacher to view performance data." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const filters = body?.filters;
    const semester = Number(filters?.semester);
    const className = String(filters?.className ?? "").trim();
    const courseCode = String(filters?.courses ?? "").trim();
    const academicYear = String(filters?.academicYear ?? "").trim();

    if (
      !Number.isInteger(semester) ||
      semester < 1 ||
      !className ||
      !courseCode ||
      !academicYear
    ) {
      return NextResponse.json(
        { error: "Select a semester, class, course, and academic year." },
        { status: 400 }
      );
    }

    const section = className.replace(/^MCA-/, "");
    const assignment = await pool.query(
      `
        SELECT 1
        FROM public.assigned_courses
        WHERE emp_id = $1
          AND course_id = $2
          AND semester = $3
          AND section = $4
          AND academic_year = $5
        LIMIT 1
      `,
      [teacher.empId, courseCode, semester, section, academicYear]
    );
    if (assignment.rowCount === 0) {
      return NextResponse.json(
        { error: "You are not assigned to this course, class, semester, and academic year." },
        { status: 403 }
      );
    }

    const { rows } = await pool.query(
      `
        WITH enrolled_students AS (
          SELECT DISTINCT ce.student_id
          FROM public.course_enrollment ce
          JOIN public.students s
            ON s.university_roll_no = ce.student_id
            AND s.semester = ce.semester
            AND s.section = $2
          WHERE ce.course_id = $3
            AND ce.semester = $1
            AND ce.academic_year = $4
        ),
        baseline AS (
          SELECT
            'pre-mse'::VARCHAR AS type,
            previous_record.sgpa AS obtained_mark,
            10::NUMERIC AS max_mark,
            NULL::NUMERIC AS attendance_pct
          FROM enrolled_students es
          JOIN LATERAL (
            SELECT sar.sgpa
            FROM public.student_academic_records sar
            WHERE sar.student_id = es.student_id
              AND sar.semester = $1 - 1
              AND sar.sgpa IS NOT NULL
            ORDER BY sar.created_at DESC, sar.id DESC
            LIMIT 1
          ) previous_record ON TRUE
          WHERE $1 > 1
        ),
        assessment_checkpoints AS (
          SELECT a.type, a.obtained_mark, a.max_mark, a.attendance_pct
          FROM public.assessments a
          JOIN enrolled_students es
            ON es.student_id = a.student_id
          WHERE a.course_id = $3
            AND a.semester = $1
            AND a.academic_year = $4
            AND a.type IN ('mse-1', 'mse-2')
        )
        SELECT type, obtained_mark, max_mark, attendance_pct
        FROM baseline
        UNION ALL
        SELECT type, obtained_mark, max_mark, attendance_pct
        FROM assessment_checkpoints
      `,
      [semester, section, courseCode, academicYear]
    );

    return NextResponse.json({ students: rows });
  } catch (error) {
    console.error("Teacher checkpoint comparison failed:", error);
    return NextResponse.json(
      { error: "Unable to load checkpoint comparison." },
      { status: 500 }
    );
  }
}
