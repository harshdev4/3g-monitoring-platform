import { randomUUID } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cloudinary from "@/config/cloudinary.config";
import pool from "@/config/db.config";
import { getSessionFromToken, SESSION_COOKIE } from "@/lib/auth";
import { getBinPath } from "compress-pdf";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const execFile = promisify(execFileCallback);

async function compressPdf(buffer) {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "student-pdf-"));
  const inputPath = path.join(tempDirectory, "input.pdf");
  const outputPath = path.join(tempDirectory, "compressed.pdf");

  try {
    await writeFile(inputPath, buffer, { flag: "wx" });
    await execFile(
      getBinPath(process.platform),
      [
        "-q",
        "-dNOPAUSE",
        "-dBATCH",
        "-dSAFER",
        "-dSimulateOverprint=true",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-dEmbedAllFonts=true",
        "-dSubsetFonts=true",
        "-dAutoRotatePages=/None",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=100",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=100",
        "-dMonoImageDownsampleType=/Bicubic",
        "-dMonoImageResolution=100",
        `-sOutputFile=${outputPath}`,
        inputPath,
      ],
      {
        windowsHide: true,
        timeout: 120_000,
        maxBuffer: 4 * 1024 * 1024,
      }
    );

    return await readFile(outputPath);
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

function uploadEvidence(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "student-evidence",
        public_id: randomUUID(),
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("Cloudinary returned no upload result."));
          return;
        }
        resolve(result);
      }
    ).end(buffer);
  });
}

async function removeUploadedEvidence(publicId, resourceType) {
  if (!publicId) return;
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType || "image",
    invalidate: true,
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary did not delete the previous evidence (${result.result}).`);
  }
}

async function cleanupUploadedEvidence(publicId, resourceType) {
  try {
    await removeUploadedEvidence(publicId, resourceType);
  } catch (error) {
    console.error("Student evidence cleanup failed:", error);
  }
}

export async function POST(request, context) {
  let uploaded;
  try {
    const cookieStore = await cookies();
    const session = getSessionFromToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (session?.role !== "student") {
      return NextResponse.json({ error: "Student sign-in is required." }, { status: 401 });
    }

    const { assignmentId } = await context.params;
    if (!/^\d+$/.test(String(assignmentId))) {
      return NextResponse.json({ error: "A valid assignment is required." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const submissionText = String(formData.get("submissionText") || "").trim();

    if (!file || typeof file.arrayBuffer !== "function" || !file.name) {
      return NextResponse.json({ error: "Choose a PDF evidence file to submit." }, { status: 400 });
    }
    if (!/\.pdf$/i.test(file.name)) {
      return NextResponse.json({ error: "Only PDF files can be submitted." }, { status: 415 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "The selected file is empty." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Files must be 10 MB or smaller." }, { status: 413 });
    }

    const assignmentResult = await pool.query(
      `SELECT aa.assignment_id, s.university_roll_no
       FROM public.action_assignments aa
       JOIN public.course_enrollment ce ON ce.id = aa.enrollment_id
       JOIN public.students s ON s.university_roll_no = ce.student_id
       JOIN public.users u ON u.unique_id = s.user_id
       WHERE aa.assignment_id = $1
         AND u.role = 'student'
         AND LOWER(u.mail_id) = LOWER($2)
       LIMIT 1`,
      [assignmentId, session.email]
    );
    const assignment = assignmentResult.rows[0];
    if (!assignment) {
      return NextResponse.json({ error: "This assignment is not assigned to your account." }, { status: 404 });
    }

    const previousSubmission = await pool.query(
      `SELECT status, cloudinary_public_id, resource_type
       FROM public.student_action_submissions
       WHERE assignment_id = $1 AND student_id = $2`,
      [assignmentId, assignment.university_roll_no]
    );
    if (previousSubmission.rows[0]?.status === "approved") {
      return NextResponse.json({ error: "This assignment has already been approved." }, { status: 409 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    if (!fileBuffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      return NextResponse.json(
        { error: "The selected file is not a valid PDF." },
        { status: 415 }
      );
    }

    let compressedBuffer;
    try {
      const compressedPdf = await compressPdf(fileBuffer);
      compressedBuffer = Buffer.from(
        compressedPdf.length < fileBuffer.length ? compressedPdf : fileBuffer
      );
    } catch (error) {
      console.error("Student evidence PDF compression failed:", error);
      return NextResponse.json(
        { error: "Unable to compress this PDF. Try another PDF file." },
        { status: 422 }
      );
    }

    if (compressedBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The compressed PDF must be 10 MB or smaller." },
        { status: 413 }
      );
    }

    uploaded = await uploadEvidence(compressedBuffer);
    const savedResult = await pool.query(
      `INSERT INTO public.student_action_submissions (
         assignment_id,
         student_id,
         submission_text,
         cloudinary_url,
         cloudinary_public_id,
         resource_type,
         file_format,
         original_filename,
         file_size,
         status,
         submitted_at,
         updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'submitted', NOW(), NOW())
       ON CONFLICT (assignment_id, student_id) DO UPDATE SET
         submission_text = EXCLUDED.submission_text,
         cloudinary_url = EXCLUDED.cloudinary_url,
         cloudinary_public_id = EXCLUDED.cloudinary_public_id,
         resource_type = EXCLUDED.resource_type,
         file_format = EXCLUDED.file_format,
         original_filename = EXCLUDED.original_filename,
         file_size = EXCLUDED.file_size,
         status = 'submitted',
         submitted_at = NOW(),
         updated_at = NOW(),
         reviewed_by_emp_id = NULL,
         reviewed_at = NULL,
         review_feedback = NULL
       WHERE public.student_action_submissions.status <> 'approved'
       RETURNING submission_id, status, original_filename, cloudinary_url, submitted_at`,
      [
        assignmentId,
        assignment.university_roll_no,
        submissionText || null,
        uploaded.secure_url,
        uploaded.public_id,
        uploaded.resource_type,
        uploaded.format || null,
        file.name,
        compressedBuffer.length,
      ]
    );

    if (!savedResult.rows[0]) {
      await cleanupUploadedEvidence(uploaded.public_id, uploaded.resource_type);
      uploaded = null;
      return NextResponse.json({ error: "This assignment has already been approved." }, { status: 409 });
    }

    const previous = previousSubmission.rows[0];
    const newPublicId = uploaded.public_id;
    uploaded = null;
    let previousEvidenceDeleted = true;
    if (previous?.cloudinary_public_id && previous.cloudinary_public_id !== newPublicId) {
      try {
        await removeUploadedEvidence(
          previous.cloudinary_public_id,
          previous.resource_type
        );
      } catch (error) {
        previousEvidenceDeleted = false;
        console.error("Previous student evidence deletion failed:", error);
      }
    }
    return NextResponse.json(
      {
        submission: savedResult.rows[0],
        ...(previousEvidenceDeleted
          ? {}
          : {
              warning:
                "Your new PDF was submitted, but the previous file could not be deleted from Cloudinary.",
            }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (uploaded) {
      await cleanupUploadedEvidence(uploaded.public_id, uploaded.resource_type);
    }
    console.error("Student evidence submission failed:", error);
    return NextResponse.json(
      {
        error: "Unable to submit your evidence right now.",
        ...(process.env.NODE_ENV === "development" ? { detail: error.message } : {}),
      },
      { status: 500 }
    );
  }
}
