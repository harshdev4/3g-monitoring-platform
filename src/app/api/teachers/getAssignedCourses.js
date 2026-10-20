import pool from "@/config/db.config";

const getAssignedCourses = async (empId) => {
  const result = await pool.query(
    `
      SELECT
        COUNT(DISTINCT s.university_roll_no) AS total_students,
        c.course_name,
        c.course_code,
        ac.section,
        ac.semester
      FROM assigned_courses ac

      JOIN courses c
        ON ac.course_id = c.course_code

      LEFT JOIN course_enrollment ce
        ON ce.course_id = c.course_code
        AND ce.semester = ac.semester

      LEFT JOIN students s
        ON s.university_roll_no = ce.student_id
        AND s.section = ac.section
        AND s.semester = ac.semester

      WHERE ac.emp_id = $1

      GROUP BY
        c.course_name,
        c.course_code,
        ac.section,
        ac.semester

      ORDER BY
        ac.semester,
        ac.section,
        c.course_code
    `,
    [empId]
  );

  return result.rows.map((data) => ({
    program: "MCA",
    semester: data.semester,
    className: `MCA-${data.section}`,
    course: data.course_name,
    course_code: data.course_code,
    student_count: Number(data.total_students),
  }));
};

export default getAssignedCourses;