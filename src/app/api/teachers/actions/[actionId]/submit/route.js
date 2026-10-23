
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import pool from "@/config/db.config";
import cloudinary from "@/config/cloudinary.config";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_FORMATS = new Set([
  "pdf",
  "doc",
  "docx",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
  "webp",
]);

const IMAGE_FORMATS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
]);

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(
            new Error("Cloudinary returned no upload result.")
          );
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function POST(request, context) {
  let uploadedPublicId = null;
  let uploadedResourceType = null;

  try {
    const { actionId } = await context.params;
    const formData = await request.formData();

    const empId = String(
      formData.get("empId") || ""
    ).trim();

    const file = formData.get("file");

    // Dashboard filter metadata.
    const program =
      String(formData.get("program") || "").trim() || null;

    const semesterValue =
      String(formData.get("semester") || "").trim();

    const courseCode =
      String(formData.get("course_code") || "").trim() || null;

    const assessment =
      String(formData.get("assessment") || "").trim() || null;

    const category =
      String(formData.get("category") || "").trim() || null;

    const semester = semesterValue
      ? Number(semesterValue)
      : null;

    // Validate action ID and teacher ID.
    if (
      !actionId ||
      !/^\d+$/.test(String(actionId)) ||
      !empId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid action ID and teacher ID are required.",
        },
        { status: 400 }
      );
    }

    // Validate semester.
    if (
      semesterValue &&
      (!Number.isInteger(semester) || semester < 1)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid semester.",
        },
        { status: 400 }
      );
    }

    // Validate uploaded file.
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a file to upload.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "The maximum allowed file size is 10 MB.",
        },
        { status: 400 }
      );
    }

    // Extract and normalize the extension.
    const originalFilename = file.name || "";
    const extension = originalFilename.includes(".")
      ? originalFilename.split(".").pop().toLowerCase()
      : "";

    if (!ALLOWED_FORMATS.has(extension)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported extension. Upload PDF, DOC, DOCX, XLSX, JPG, JPEG, PNG, or WebP.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported file MIME type. Please select a supported document or image.",
          receivedType: file.type || "unknown",
        },
        { status: 400 }
      );
    }

    // Verify the action exists and accepts teacher submissions.
    const actionResult = await pool.query(
      `
        SELECT
          action_id,
          title,
          assessment_type,
          target_category
        FROM public.action_templates
        WHERE action_id = $1
          AND submitter_type = 'teacher'
          AND is_active = TRUE
        LIMIT 1;
      `,
      [Number(actionId)]
    );

    if (actionResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This action is unavailable or does not require a teacher submission.",
        },
        { status: 404 }
      );
    }

    const action = actionResult.rows[0];

    // Verify that the teacher exists.
    // In production, obtain empId from the authenticated session.
    const teacherResult = await pool.query(
      `
        SELECT emp_id
        FROM public.teachers
        WHERE emp_id = $1
        LIMIT 1;
      `,
      [empId]
    );

    if (teacherResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher account not found.",
        },
        { status: 404 }
      );
    }

    // Verify selected assessment and category against the action.
    if (
      assessment &&
      assessment.toLowerCase() !==
        String(action.assessment_type || "").toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "The assessment does not match this action.",
        },
        { status: 400 }
      );
    }

    if (
      category &&
      category.toLowerCase() !==
        String(action.target_category || "").toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "The 3G category does not match this action.",
        },
        { status: 400 }
      );
    }

    // Read the file after basic validation.
    const buffer = Buffer.from(await file.arrayBuffer());

    const safeEmpId = empId.replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );

    const isImage = IMAGE_FORMATS.has(extension);
    const resourceType = isImage ? "image" : "raw";

    const basePublicId =
      `teacher-action-${actionId}-${safeEmpId}-${randomUUID()}`;

    // Cloudinary raw assets should retain their file extension.
    const publicId = isImage
      ? basePublicId
      : `${basePublicId}.${extension}`;

    // Upload to Cloudinary.
    // Do not pass allowed_formats; application validation is above.
    const result = await uploadBuffer(buffer, {
      folder: "3gs/teacher-submissions",
      public_id: publicId,
      resource_type: resourceType,
      overwrite: false,
      context: {
        action_id: String(actionId),
        emp_id: empId,
      },
    });

    uploadedPublicId = result.public_id;
    uploadedResourceType = result.resource_type;

    // Save the latest submission for this teacher/action pair.
    const savedResult = await pool.query(
      `
        INSERT INTO public.teacher_action_submissions (
          action_id,
          emp_id,
          cloudinary_url,
          cloudinary_public_id,
          resource_type,
          file_format,
          original_filename,
          file_size,
          program_name,
          semester,
          course_code,
          assessment_type,
          target_category,
          submitted_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, NOW(), NOW()
        )
        ON CONFLICT (action_id, emp_id, semester)
        DO UPDATE SET
          cloudinary_url = EXCLUDED.cloudinary_url,
          cloudinary_public_id = EXCLUDED.cloudinary_public_id,
          resource_type = EXCLUDED.resource_type,
          file_format = EXCLUDED.file_format,
          original_filename = EXCLUDED.original_filename,
          file_size = EXCLUDED.file_size,
          program_name = EXCLUDED.program_name,
          semester = EXCLUDED.semester,
          course_code = EXCLUDED.course_code,
          assessment_type = EXCLUDED.assessment_type,
          target_category = EXCLUDED.target_category,
          submitted_at = NOW(),
          updated_at = NOW()
        RETURNING
          submission_id,
          submitted_at,
          updated_at,
          original_filename,
          cloudinary_url,
          cloudinary_public_id,
          resource_type,
          program_name,
          semester,
          course_code,
          assessment_type,
          target_category,
          file_size,
          file_format;
      `,
      [
        Number(actionId),
        empId,
        result.secure_url,
        result.public_id,
        result.resource_type,
        result.format || extension,
        originalFilename.slice(0, 255),
        result.bytes ?? file.size,
        program,
        semester,
        courseCode,
        assessment || action.assessment_type,
        category || action.target_category,
      ]
    );

    const savedSubmission = savedResult.rows[0];

    // Upload and database save succeeded.
    // Do not delete the Cloudinary file after this point.
    uploadedPublicId = null;
    uploadedResourceType = null;

    return NextResponse.json(
      {
        success: true,
        message: "Teacher submission uploaded successfully.",
        submission: {
          ...savedSubmission,
          action_id: action.action_id,
          action_title: action.title,
          file_url: savedSubmission.cloudinary_url,
          file_name: savedSubmission.original_filename,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Teacher action submission error:", {
      message: error.message,
      name: error.name,
      http_code: error.http_code,
      error: error,
    });

    // Clean up the newly uploaded asset if database saving failed.
    if (uploadedPublicId && uploadedResourceType) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: uploadedResourceType,
        });
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup error:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload the teacher submission.",
        ...(process.env.NODE_ENV === "development"
          ? { error: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
}
