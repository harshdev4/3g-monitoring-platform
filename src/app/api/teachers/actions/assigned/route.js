
import { NextResponse } from "next/server";
import pool from "@/config/db.config";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const empId = searchParams.get("empId")?.trim();
    const program = searchParams.get("program")?.trim() || null;
    const semesterValue = searchParams.get("semester")?.trim() || null;
    const courseCode = searchParams.get("course_code")?.trim() || null;
    const assessment = searchParams.get("assessment")?.trim() || null;
    const category = searchParams.get("category")?.trim() || null;

    if (!empId) {
      return NextResponse.json(
        { message: "Teacher employee ID is required." },
        { status: 400 }
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

    const query = `
      SELECT
        at.action_id,
        at.title,
        at.target_category,
        at.assessment_type,
        MIN(aa.created_at) AS assigned_on,
        COUNT(DISTINCT aa.enrollment_id)::int AS student_count
      FROM public.action_assignments aa
      JOIN public.action_templates at
        ON at.action_id = aa.action_id
      JOIN public.course_enrollment ce
        ON ce.id = aa.enrollment_id
      JOIN public.students s
        ON s.university_roll_no = ce.student_id
      WHERE aa.assigned_by_emp_id = $1
        AND at.is_active = TRUE
        AND ($2::text IS NULL OR s.program_name = $2)
        AND ($3::int IS NULL OR ce.semester = $3)
        AND ($4::text IS NULL OR ce.course_id = $4)
        AND ($5::text IS NULL OR at.assessment_type = $5)
        AND ($6::text IS NULL OR at.target_category = $6)
        AND s.semester = ce.semester
      GROUP BY
        at.action_id,
        at.title,
        at.target_category,
        at.assessment_type
      ORDER BY MIN(aa.created_at) DESC, at.title ASC;
    `;

    const { rows } = await pool.query(query, [
      empId,
      program,
      semester,
      courseCode,
      assessment,
      category,
    ]);

    return NextResponse.json({ actions: rows });
  } catch (error) {
    console.error("GET assigned actions error:", error);

    return NextResponse.json(
      { message: "Failed to fetch assigned actions." },
      { status: 500 }
    );
  }
}
