import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

const ASSESSMENTS = new Set(["pre-mse", "mse-1", "mse-2", "ese"]);
const MAX_OBSERVATION_LENGTH = 2000;

async function getTeacher() {
  const cookieStore = await cookies();
  const email = getTeacherEmailFromSession(
    cookieStore.get(SESSION_COOKIE)?.value
  );
  const teacher = email ? await getUser(email) : null;
  return teacher?.role === "teacher" && teacher.empId ? teacher : null;
}

async function getAssignedEnrollment(
  teacherId,
  studentId,
  courseCode,
  semester,
  academicYear
) {
  const result = await pool.query(
    `
      SELECT ce.academic_year
      FROM public.assigned_courses ac
      JOIN public.course_enrollment ce
        ON ce.course_id = ac.course_id
        AND ce.semester = ac.semester
        AND ce.academic_year = ac.academic_year
      JOIN public.students s
        ON s.university_roll_no = ce.student_id
        AND s.section = ac.section
        AND s.semester = ce.semester
      WHERE ac.emp_id = $1
        AND ce.student_id = $2
        AND ac.course_id = $3
        AND ac.semester = $4
        AND ac.academic_year = $5
      LIMIT 1
    `,
    [teacherId, studentId, courseCode, semester, academicYear]
  );
  return result.rows[0] ?? null;
}

function isValidContext({ studentId, courseCode, semester, academicYear }) {
  return Boolean(
    studentId &&
      courseCode &&
      academicYear &&
      Number.isInteger(semester) &&
      semester >= 1
  );
}

export async function GET(request) {
  try {
    const teacher = await getTeacher();
    if (!teacher) {
      return NextResponse.json(
        { error: "You must be signed in as a teacher to view observations." },
        { status: 401 }
      );
    }

    const params = new URL(request.url).searchParams;
    const context = {
      studentId: params.get("student_id")?.trim(),
      courseCode: params.get("course_code")?.trim(),
      semester: Number(params.get("semester")),
      academicYear: params.get("academic_year")?.trim(),
    };

    if (!isValidContext(context)) {
      return NextResponse.json(
        { error: "A valid student, course, semester, and academic year are required." },
        { status: 400 }
      );
    }

    const enrollment = await getAssignedEnrollment(
      teacher.empId,
      context.studentId,
      context.courseCode,
      context.semester,
      context.academicYear
    );
    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not assigned to this student's course and semester." },
        { status: 403 }
      );
    }

    const { rows } = await pool.query(
      `
        SELECT DISTINCT ON (type)
          type AS assessment,
          faculty_observation AS observation,
          id
        FROM public.assessments
        WHERE student_id = $1
          AND course_id = $2
          AND semester = $3
          AND academic_year = $4
          AND faculty_observation IS NOT NULL
          AND BTRIM(faculty_observation) <> ''
        ORDER BY type, id DESC
      `,
      [
        context.studentId,
        context.courseCode,
        context.semester,
        enrollment.academic_year,
      ]
    );

    return NextResponse.json({
      observations: rows.map(({ assessment, observation }) => ({
        assessment,
        observation,
      })),
    });
  } catch (error) {
    console.error("Teacher observations fetch failed:", error);
    return NextResponse.json(
      { error: "Unable to load student observations." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const teacher = await getTeacher();
    if (!teacher) {
      return NextResponse.json(
        { error: "You must be signed in as a teacher to save observations." },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid observation request." },
        { status: 400 }
      );
    }
    const context = {
      studentId: String(body.student_id ?? "").trim(),
      courseCode: String(body.course_code ?? "").trim(),
      semester: Number(body.semester),
      academicYear: String(body.academic_year ?? "").trim(),
    };
    const assessment = String(body.assessment ?? "").trim().toLowerCase();
    const observation = String(body.observation ?? "").trim();

    if (
      !isValidContext(context) ||
      !ASSESSMENTS.has(assessment) ||
      observation.length > MAX_OBSERVATION_LENGTH
    ) {
      return NextResponse.json(
        { error: "Provide a valid student, course, assessment, semester, academic year, and observation." },
        { status: 400 }
      );
    }

    const enrollment = await getAssignedEnrollment(
      teacher.empId,
      context.studentId,
      context.courseCode,
      context.semester,
      context.academicYear
    );
    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not assigned to this student's course and semester." },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `
        UPDATE public.assessments
        SET faculty_observation = NULLIF($1, '')
        WHERE student_id = $2
          AND course_id = $3
          AND semester = $4
          AND academic_year = $5
          AND type = $6
        RETURNING type AS assessment, faculty_observation AS observation
      `,
      [
        observation,
        context.studentId,
        context.courseCode,
        context.semester,
        enrollment.academic_year,
        assessment,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "No record exists for this assessment yet. Upload its assessment data before adding an observation." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      observation: {
        assessment,
        observation: result.rows[0].observation ?? "",
      },
    });
  } catch (error) {
    console.error("Teacher observation save failed:", error);
    return NextResponse.json(
      { error: "Unable to save the observation." },
      { status: 500 }
    );
  }
}
