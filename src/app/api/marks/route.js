import { NextResponse } from "next/server";
import pool from "@/config/db.config";
import cloudinary from "@/config/cloudinary.config";

export async function POST(req) {
  try {
    const body = await req.json();
    const { marksData, filters, fileMeta, teacherId } = body;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized: No teacher ID found." }, { status: 401 });
    }
    
    if (!marksData || !Array.isArray(marksData) || marksData.length === 0) {
      return NextResponse.json({ error: "No records found to insert." }, { status: 400 });
    }

    if (!filters?.assessment || !filters?.semester || !filters?.courseCode || !filters?.academicYear) {
      return NextResponse.json({ error: "Missing filters found to insert." }, { status: 400 });
    }

    // 1. Upload to Cloudinary with Sanitized Filename
    let fileUrl = null;
    if (fileMeta?.base64Data) {
      const fileExt = fileMeta.fileName.split('.').pop();
      const rawBaseName = fileMeta.fileName.substring(0, fileMeta.fileName.lastIndexOf('.')) || fileMeta.fileName;
      
      // FIX: Sanitize the base name to remove &, spaces, and parentheses
      const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_.-]/g, '_');

      const uploadResponse = await cloudinary.uploader.upload(fileMeta.base64Data, {
        resource_type: "raw",
        folder: "3gs_imports",
        public_id: `${safeBaseName}_${Date.now()}.${fileExt}` 
      });
      fileUrl = uploadResponse.secure_url;
    }

    const type = filters.assessment;
    const semester = Number(filters.semester);
    const academicYear = filters.academicYear;
    const courseId = filters.courseCode;

    // FIX: Check out a dedicated client to prevent Connection Timeouts
    const client = await pool.connect();
    
    let importId;
    let uploadedAt;

    try {
      await client.query("BEGIN");

      const importRes = await client.query(
        `INSERT INTO public.assessment_imports (
          file_name, uploaded_by_emp_id, course_code, semester, academic_year, target_sections, assessment_type, total_rows, error_count, status, file_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING import_id, uploaded_at;`,
        [
          fileMeta?.fileName || "marks_upload.csv",
          teacherId,
          courseId,
          semester,
          academicYear,
          filters.className || "All assigned classes",
          type,
          marksData.length,
          fileMeta?.errorCount || 0,
          "Success",
          fileUrl
        ]
      );

      importId = importRes.rows[0].import_id;
      uploadedAt = importRes.rows[0].uploaded_at;

      for (const record of marksData) {
        const studentRoll = record.roll;
        const obtainedMark = record.absent === "Yes" ? null : Number(record.correctedMarks || record.marks);
        const maxMark = Number(record.maxMarks) || 100;
        const attendancePct = record.attendance ? Number(record.attendance) : null;
        
        const enrollmentCheck = await client.query(
          `SELECT 1 FROM public.course_enrollment 
           WHERE course_id = $1 AND student_id = $2 AND semester = $3 AND academic_year = $4;`,
          [courseId, studentRoll, semester, academicYear]
        );

        if (enrollmentCheck.rowCount === 0) {
          throw new Error(`Student ${studentRoll} is not enrolled in course ${courseId} for the selected semester/year.`);
        }

        await client.query(
          `INSERT INTO public.assessments (
             type, max_mark, obtained_mark, attendance_pct, course_id, student_id, semester, academic_year, import_id
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [type, maxMark, obtainedMark, attendancePct, courseId, studentRoll, semester, academicYear, importId]
        );
      }

      await client.query("COMMIT");
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError; // Pass error to outer catch block
    } finally {
      client.release(); // CRITICAL: Frees the connection back to Aiven
    }

    // Format successful response
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
    console.error("Upload/Insert Error:", error);
    return NextResponse.json(
      { error: "Failed to upload marks: " + error.message },
      { status: 500 }
    );
  }
}