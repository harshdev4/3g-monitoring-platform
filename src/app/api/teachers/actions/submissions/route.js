
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
        tas.submission_id,
        tas.action_id,
        at.title,
        at.description,
        tas.program_name,
        tas.semester,
        tas.course_code,
        tas.assessment_type,
        tas.target_category,
        tas.original_filename,
        tas.cloudinary_url,
        tas.file_format,
        tas.file_size,
        tas.submitted_at,
        tas.updated_at
      FROM public.teacher_action_submissions tas
      JOIN public.action_templates at
        ON at.action_id = tas.action_id
      WHERE tas.emp_id = $1
        AND ($2::text IS NULL OR tas.program_name = $2)
        AND ($3::int IS NULL OR tas.semester = $3)
        AND ($4::text IS NULL OR tas.course_code = $4)
        AND ($5::text IS NULL OR tas.assessment_type = $5)
        AND ($6::text IS NULL OR tas.target_category = $6)
      ORDER BY tas.submitted_at DESC;
    `;

    const { rows } = await pool.query(query, [
      empId,
      program,
      semester,
      courseCode,
      assessment,
      category,
    ]);

    return NextResponse.json({ submissions: rows });
  } catch (error) {
    console.error("Fetch teacher submissions error:", error);

    return NextResponse.json(
      { message: "Failed to load teacher submissions." },
      { status: 500 }
    );
  }
}
