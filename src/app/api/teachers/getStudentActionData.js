import pool from "@/config/db.config";

const getStudentActionData = async ({ rollNo, courseCode, semester, academicYear }) => {
  const result = await pool.query(
    `
      SELECT
        aa.assignment_id AS id,
        at.title,
        aa.status,
        c.course_name AS subject,
        at.target_category AS category,
        activity.description,
        activity.due_date AS due_date,
        aa.created_at,
        aa.evidence_url,
        aa.review_feedback,
        aa.evidence_format
      FROM public.course_enrollment ce
      JOIN public.action_assignments aa
        ON aa.enrollment_id = ce.id
      JOIN public.action_templates at
        ON at.action_id = aa.action_id
      JOIN public.activities activity
        ON activity.activity_id = aa.activity_id
      JOIN public.courses c
        ON c.course_code = ce.course_id
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
      date: row.created_at,
      description: row.review_feedback || "Evidence submitted",
      version: row.evidence_format,
      evidenceUrl: row.evidence_url,
    }));

  return { actions, submissions };
};

export default getStudentActionData;
