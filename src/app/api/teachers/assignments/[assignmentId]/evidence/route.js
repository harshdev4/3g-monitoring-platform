import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_EVIDENCE_SIZE = 10 * 1024 * 1024;

function safeFilenamePart(value) {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
  return normalized || "evidence";
}

function encodeInlineContentDispositionFilename(filename) {
  const fallback = filename.replace(/[^\x20-\x7E]|["\\;]/g, "_");
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `inline; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function getCloudinaryUrl(value) {
  try {
    const url = new URL(value);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      !cloudName ||
      url.pathname.split("/")[1] !== cloudName
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export async function GET(_request, context) {
  try {
    const cookieStore = await cookies();
    const email = getTeacherEmailFromSession(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const teacher = email ? await getUser(email) : null;

    if (teacher?.role !== "teacher" || !teacher.empId) {
      return NextResponse.json(
        { error: "Teacher sign-in is required." },
        { status: 401 }
      );
    }

    const { assignmentId } = await context.params;
    if (!/^\d+$/.test(String(assignmentId))) {
      return NextResponse.json(
        { error: "A valid assignment is required." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT
         COALESCE(sas.cloudinary_url, aa.evidence_url) AS evidence_url,
         COALESCE(sas.original_filename, aa.evidence_format) AS original_filename,
         COALESCE(NULLIF(BTRIM(u.name), ''), s.university_roll_no) AS student_name,
         at.title AS assignment_name
       FROM public.action_assignments aa
       JOIN public.action_templates at
         ON at.action_id = aa.action_id
       JOIN public.course_enrollment ce
         ON ce.id = aa.enrollment_id
       JOIN public.students s
         ON s.university_roll_no = ce.student_id
       LEFT JOIN public.users u
         ON u.unique_id = s.user_id
       LEFT JOIN public.student_action_submissions sas
         ON sas.assignment_id = aa.assignment_id
        AND sas.student_id = s.university_roll_no
       WHERE aa.assignment_id = $1
         AND aa.assigned_by_emp_id = $2
       LIMIT 1`,
      [assignmentId, teacher.empId]
    );

    const evidence = result.rows[0];
    if (!evidence) {
      return NextResponse.json(
        { error: "Assignment not found or you are not authorized to download it." },
        { status: 404 }
      );
    }

    if (!evidence.evidence_url) {
      return NextResponse.json(
        { error: "No evidence has been submitted for this assignment." },
        { status: 404 }
      );
    }

    const evidenceUrl = getCloudinaryUrl(evidence.evidence_url);
    if (!evidenceUrl) {
      return NextResponse.json(
        { error: "The evidence file URL is invalid or unsupported." },
        { status: 502 }
      );
    }

    const upstream = await fetch(evidenceUrl, {
      cache: "no-store",
      redirect: "error",
    });

    if (!upstream.ok) {
      console.error("Cloudinary evidence download failed:", upstream.status);
      return NextResponse.json(
        {
          error:
            upstream.status === 401
              ? "Cloudinary denied file delivery. Enable PDF/ZIP delivery in the Cloudinary Security settings if this is a PDF."
              : "Unable to download the evidence file from Cloudinary.",
        },
        { status: 502 }
      );
    }

    const contentLength = Number(upstream.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_EVIDENCE_SIZE) {
      return NextResponse.json(
        { error: "The evidence file exceeds the 10 MB download limit." },
        { status: 413 }
      );
    }

    const file = await upstream.arrayBuffer();
    if (file.byteLength > MAX_EVIDENCE_SIZE) {
      return NextResponse.json(
        { error: "The evidence file exceeds the 10 MB download limit." },
        { status: 413 }
      );
    }

    const extension = (
      evidence.original_filename?.match(/\.([a-zA-Z0-9]{1,10})$/)?.[1] ||
      evidenceUrl.pathname.match(/\.([a-zA-Z0-9]{1,10})$/)?.[1] ||
      "bin"
    ).toLowerCase();
    if (extension !== "pdf") {
      return NextResponse.json(
        { error: "Only PDF evidence can be previewed." },
        { status: 415 }
      );
    }

    const pdf = Buffer.from(file);
    if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      return NextResponse.json(
        { error: "The submitted file is not a valid PDF." },
        { status: 415 }
      );
    }

    const filename = `${safeFilenamePart(evidence.student_name)}_${safeFilenamePart(
      evidence.assignment_name
    )}.${extension}`;

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": encodeInlineContentDispositionFilename(filename),
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "frame-ancestors 'self'",
      },
    });
  } catch (error) {
    console.error("Teacher evidence download failed:", error);
    return NextResponse.json(
      { error: "Unable to download this evidence file." },
      { status: 500 }
    );
  }
}
