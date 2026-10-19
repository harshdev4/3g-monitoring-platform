import { NextResponse } from "next/server";
import { Pool } from "pg";

// PostgreSQL Pool configured for Aiven SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function POST(req) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { marksData, filters } = body;
    
    if (!marksData || !Array.isArray(marksData) || marksData.length === 0) {
      return NextResponse.json(
        { error: "No records found to insert." },
        { status: 400 }
      );
    }
      
    // Map UI dropdown labels to PostgreSQL Enum / Check Constraints

    const type = filters.assessment;
    const semester = Number(filters?.semester) ;
    const academicYear = filters?.academicYear || "2026-27";
    const courseId = filters?.courseCode;

    console.log(type);
    console.log(semester);
    console.log(academicYear);
    console.log(courseId);
    
    // Start SQL Transaction
    await client.query("BEGIN");

    for (const record of marksData) {
      const studentRoll = record.roll;
      const obtainedMark = record.absent === "Yes" ? null : Number(record.correctedMarks || record.marks);
      const maxMark = Number(record.maxMarks) || 100;
      const attendancePct = record.attendance ? Number(record.attendance) : null;
      const Observation=record.facultyObservation ;

   
      const enrollmentCheck = await client.query(
  `SELECT 1 FROM public.course_enrollment 
   WHERE course_id = $1 AND student_id = $2 AND semester = $3 AND academic_year = $4;`,
  [courseId, studentRoll, semester, academicYear]
);

// If no record is found, stop the process and throw an error
if (enrollmentCheck.rowCount === 0) {
  throw new Error(`Student ${studentRoll} is not enrolled in course ${courseId} for the selected semester/year.`);
}

      // 2. Insert record into public.assessments
      await client.query(
        `INSERT INTO public.assessments2 (
           type, 
           max_mark, 
           obtained_mark, 
           attendance_pct, 
           faculty_observation,
           course_id, 
           student_id, 
           semester, 
           academic_year
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9);`,
        [
          type,
          maxMark,
          obtainedMark,
          attendancePct,
          Observation, 
          courseId,
          studentRoll,
          semester,
          academicYear,
        ]
      );
    }

    // Commit Transaction
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `${marksData.length} records successfully written to PostgreSQL.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database Insert Error:", error);
    return NextResponse.json(
      { error: "Failed to upload marks: " + error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}