import pool from "@/config/db.config";

const getStudentListForMarksUpload = async (filters) => {
  const { semester, courses, className } = filters ?? {};

  if (!semester || !courses || !className) {
    throw new Error("Missing required filters");
  }

  const section = className.split("-")[1];

  if (!section) {
    throw new Error("Invalid class name: " + className);
  }

  const result = await pool.query(
    `
      SELECT DISTINCT
        s.university_roll_no,
        u.name
      FROM students s
      JOIN users u
        ON s.user_id = u.unique_id
      JOIN course_enrollment ce
        ON s.university_roll_no = ce.student_id
      WHERE s.semester = $1
        AND ce.course_id = $2
        AND s.section = $3
      ORDER BY s.university_roll_no
    `,
    [semester, courses, section]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `No enrolled students found for course ${courses}`
    );
  }

  return result.rows;
};

export default getStudentListForMarksUpload;