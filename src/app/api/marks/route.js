import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import cloudinary from "@/config/cloudinary.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

async function getAuthenticatedTeacher() {
  const cookieStore = await cookies();
  const email = getTeacherEmailFromSession(
    cookieStore.get(SESSION_COOKIE)?.value
  );
  const teacher = email ? await getUser(email) : null;
  return teacher?.role === "teacher" && teacher.empId ? teacher : null;
}

export async function POST(req) {
  let client;
  let transactionStarted = false;
  let fileArchiveWarning = null;

  try {
    const body = await req.json();
  
    const { marksData, filters, fileMeta } = body;
    const teacher = await getAuthenticatedTeacher();
    if (!teacher) {
      return NextResponse.json(
        { error: "You must be signed in as a teacher to upload marks." },
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

    const type = filters.assessment;
    const semester = Number(filters.semester);
    const academicYear = filters.academicYear;
    const courseId = filters.courseCode;
    const section = String(filters.className).replace(/^MCA-/, "");
    const assignmentResult = await pool.query(
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
      [teacher.empId, courseId, semester, section, academicYear]
    );
    if (assignmentResult.rowCount === 0) {
      return NextResponse.json(
        { error: "You are not assigned to this course, class, semester, and academic year." },
        { status: 403 }
      );
    }

    let fileUrl = null;
    if (fileMeta?.base64Data) {
      try {
        const fileName = String(fileMeta.fileName || "marks_upload.xlsx");
        const extension = fileName.includes(".")
          ? fileName.split(".").pop().toLowerCase()
          : "xlsx";
        const baseName = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
        const uploadResponse = await cloudinary.uploader.upload(
          fileMeta.base64Data,
          {
            resource_type: "raw",
            folder: "3gs_imports",
            public_id: `${baseName}_${Date.now()}.${extension}`,
          }
        );
        fileUrl = uploadResponse.secure_url;
      } catch (archiveError) {
        console.error("Assessment workbook archival failed:", {
          name: archiveError.name,
          httpCode: archiveError.http_code,
        });
        fileArchiveWarning =
          "Marks will be saved, but the source workbook could not be archived. Check the Cloudinary credentials and try uploading the workbook again to retain a downloadable copy.";
      }
    }

    
    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

   const importRes = await client.query(
      `INSERT INTO public.assessment_imports (
        file_name, uploaded_by_emp_id, course_code, semester, academic_year, target_sections, assessment_type, total_rows, error_count, status,file_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11)
      RETURNING import_id, uploaded_at;`,
      [
        fileMeta?.fileName || "marks_upload.xlsx",
        teacher.empId,
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
      const observationValue = record.facultyObservation ?? record.observation;
      const observation =
        typeof observationValue === "string" && observationValue.trim()
          ? observationValue.trim()
          : null;

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
          observation,
          courseId,
          studentRoll,
          semester,
          academicYear,
          importId // Link to the audit trail
        ]
      );
    }

  
    await client.query("COMMIT");
    transactionStarted = false;

    const d = new Date(uploadedAt);
    const newRecord = {
      id: "UP-" + importId,
      filename: fileMeta?.fileName || "marks_upload.xlsx",
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      uploadedAt,
      uploader: [teacher.prefix, teacher.name].filter(Boolean).join(" "),
      class: filters.className,
      subject: courseId,
      assessment: type,
      academicYear,
      rows: marksData.length,
      errors: fileMeta?.errorCount || 0,
      status: "Success",
      fileUrl: fileUrl
    };

    return NextResponse.json({
      success: true,
      message: `${marksData.length} records successfully written to PostgreSQL.`,
      warning: fileArchiveWarning,
      newRecord 
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back marks upload:", rollbackError);
      }
    }
    console.error("Database Insert Error:", error);
    return NextResponse.json(
      { error: "Failed to upload marks: " + error.message },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}


export async function GET() {
  try {
    const teacher = await getAuthenticatedTeacher();
    if (!teacher) {
      return NextResponse.json(
        { error: "You must be signed in as a teacher to view upload history." },
        { status: 401 }
      );
    }

    const result = await pool.query(`
      SELECT 
        ai.import_id, ai.file_name, ai.uploaded_by_emp_id, ai.target_sections,
        ai.course_code, ai.semester, ai.academic_year, ai.assessment_type,
        ai.total_rows, ai.error_count, ai.status, ai.uploaded_at, ai.file_url,
        u.prefix, u.name AS uploader_name
      FROM public.assessment_imports ai
      LEFT JOIN public.teachers t ON t.emp_id = ai.uploaded_by_emp_id
      LEFT JOIN public.users u ON u.unique_id = t.user_id
      WHERE ai.uploaded_by_emp_id = $1
      ORDER BY ai.uploaded_at DESC
    `, [teacher.empId]);

    
    const history = result.rows.map(row => {
      const d = new Date(row.uploaded_at);
      return {
        id: "UP-" + row.import_id,
        filename: row.file_name,
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        uploadedAt: row.uploaded_at,
        uploader: [row.prefix, row.uploader_name].filter(Boolean).join(" "),
        class: row.target_sections,
        subject: row.course_code,
        assessment: row.assessment_type,
        academicYear: row.academic_year,
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