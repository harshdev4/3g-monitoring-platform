import { NextResponse } from "next/server";
import pool from "@/config/db.config";
import cloudinary from "@/config/cloudinary.config";
export async function POST(req) {
  try {
    const body = await req.json();
  
    const { marksData, filters, fileMeta,teacherId } = body;
    if (!teacherId) {
      return NextResponse.json(
        { error: "Unauthorized: No teacher ID found in request." },
        { status: 401 }
      );
    }
    
    if (!marksData || !Array.isArray(marksData) || marksData.length === 0) {
      return NextResponse.json(
        { error: "No records found to insert." },
        { status: 400 }
      );
    }

    if (!filters?.assessment || !filters?.semester || !filters?.courseCode || !filters?.academicYear) {
      return NextResponse.json(
        { error: "Missing filters found to insert." },
        { status: 400 }
      );
    }

  // 1. Upload to Cloudinary
    let fileUrl = null;
    if (fileMeta?.base64Data) {
      // Extract the file extension (e.g., "csv" or "xlsx")
      const fileExt = fileMeta.fileName.split('.').pop();
      // Extract the base name without the extension
      const baseName = fileMeta.fileName.substring(0, fileMeta.fileName.lastIndexOf('.')) || fileMeta.fileName;

      const uploadResponse = await cloudinary.uploader.upload(fileMeta.base64Data, {
        resource_type: "raw", // Required for non-image files
        folder: "3gs_imports",
        // Include the extension at the end of the public_id so Cloudinary knows the file type
        public_id: `${baseName}_${Date.now()}.${fileExt}` 
      });
      fileUrl = uploadResponse.secure_url;
    }

    const type = filters.assessment;
    const semester = Number(filters.semester);
    const academicYear = filters.academicYear;
    const courseId = filters.courseCode;

    
    await pool.query("BEGIN");

   const importRes = await pool.query(
      `INSERT INTO public.assessment_imports (
        file_name, uploaded_by_emp_id, course_code, semester, academic_year, target_sections, assessment_type, total_rows, error_count, status,file_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11)
      RETURNING import_id, uploaded_at;`,
      [
        fileMeta?.fileName || "marks_upload.csv",
        teacherId, // <-- Replaced "4495" with the dynamic variable
        courseId,
        semester,
        academicYear,
        filters.className || "All assigned classes",
        type,
        marksData.length,
        fileMeta?.errorCount || 0,
        "Success",
        fileUrl // NEW
      ]
    );

    const importId = importRes.rows[0].import_id;
    const uploadedAt = importRes.rows[0].uploaded_at;

    for (const record of marksData) {
      const studentRoll = record.roll;
      const obtainedMark = record.absent === "Yes" ? null : Number(record.correctedMarks || record.marks);
      const maxMark = Number(record.maxMarks) || 100;
      const attendancePct = record.attendance ? Number(record.attendance) : null;
      const Observation = record.facultyObservation || record.observation; 

      const enrollmentCheck = await pool.query(
        `SELECT 1 FROM public.course_enrollment 
         WHERE course_id = $1 AND student_id = $2 AND semester = $3 AND academic_year = $4;`,
        [courseId, studentRoll, semester, academicYear]
      );

      
      if (enrollmentCheck.rowCount === 0) {
        throw new Error(`Student ${studentRoll} is not enrolled in course ${courseId} for the selected semester/year.`);
      }

    
      await pool.query(
        `INSERT INTO public.assessments2 (
           type, 
           max_mark, 
           obtained_mark, 
           attendance_pct, 
           faculty_observation,
           course_id, 
           student_id, 
           semester, 
           academic_year,
           import_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
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
          importId // Link to the audit trail
        ]
      );
    }

  
    await pool.query("COMMIT");

    const d = new Date(uploadedAt);
    const newRecord = {
      id: "UP-" + importId,
      filename: fileMeta?.fileName || "marks_upload.csv",
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      uploader: "Prof. Harsh Sharma", 
      class: filters.className || "All assigned classes",
      subject: courseId,
      assessment: type,
      rows: marksData.length,
      errors: fileMeta?.errorCount || 0,
      status: "Success",
      fileUrl: fileUrl
    };

    return NextResponse.json({
      success: true,
      message: `${marksData.length} records successfully written to PostgreSQL.`,
      newRecord 
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Database Insert Error:", error);
    return NextResponse.json(
      { error: "Failed to upload marks: " + error.message },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  try {
    const result = await pool.query(`
      SELECT 
        import_id, file_name, uploaded_by_emp_id, target_sections, 
        course_code, assessment_type, total_rows, error_count, status, uploaded_at,file_url
      FROM public.assessment_imports
      ORDER BY uploaded_at DESC
    `);

    
    const history = result.rows.map(row => {
      const d = new Date(row.uploaded_at);
      return {
        id: "UP-" + row.import_id,
        filename: row.file_name,
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        uploader: "Prof. Harsh Sharma", // Or fetch dynamically from a JOIN on teachers table
        class: row.target_sections,
        subject: row.course_code,
        assessment: row.assessment_type,
        rows: row.total_rows,
        errors: row.error_count,
        status: row.status,
        fileUrl: row.file_url
      };
    });

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}