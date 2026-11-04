import pool from "@/config/db.config";

const getStudentActionData = async ({ rollNo, courseCode, semester, academicYear }) => {
  const result = await pool.query(
    `
      SELECT
        aa.assignment_id AS id,
        at.title,
        COALESCE(sas.status, aa.status) AS status,
        c.course_name AS subject,
        at.target_category AS category,
        activity.description,
        activity.due_date AS due_date,
        aa.created_at,
        COALESCE(sas.cloudinary_url, aa.evidence_url) AS evidence_url,
        COALESCE(sas.review_feedback, aa.review_feedback) AS review_feedback,
        COALESCE(sas.file_format, aa.evidence_format) AS evidence_format,
        sas.submitted_at
      FROM public.course_enrollment ce
      JOIN public.action_assignments aa
        ON aa.enrollment_id = ce.id
      JOIN public.action_templates at
        ON at.action_id = aa.action_id
      LEFT JOIN public.activities activity
        ON activity.activity_id = aa.activity_id
      JOIN public.courses c
        ON c.course_code = ce.course_id
      LEFT JOIN public.student_action_submissions sas
        ON sas.assignment_id = aa.assignment_id
       AND sas.student_id = ce.student_id
      WHERE ce.student_id = $1
        AND ce.course_id = $2
        AND ce.semester = $3
        AND ce.academic_year = $4
      ORDER BY aa.created_at DESC, aa.assignment_id DESC
    `,
    [rollNo, courseCode, semester, academicYear]
  );

  const actions = result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status ?? "Assigned",
    subject: row.subject,
    category: row.category,
    description: row.description,
    dueDate: row.due_date,
  }));
  const submissions = result.rows
    .filter((row) => row.evidence_url)
    .map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status ?? "Submitted",
      date: row.submitted_at || row.created_at,
      description: row.review_feedback || "Evidence submitted",
      version: row.evidence_format,
      evidenceUrl: row.evidence_url,
    }));

  return { actions, submissions };
};

export default getStudentActionData;
