import pool from "@/config/db.config";

const getProgressionData = async (filter) => {
    const { semester, className, courses } = filter ?? {};

    if (!className || !courses || !semester) {
        throw new Error("Missing required dashboard filters");
    }

    const section = className.replace(/^MCA-/, "");

    const query = `
    WITH ranked_students AS (
      SELECT
        u.name,
        s.university_roll_no,
        s.semester,
        s.section,
        a.attendance_pct,
        a.max_mark,
        a.obtained_mark,
        a.type,
        ROW_NUMBER() OVER (
          ORDER BY
            a.obtained_mark DESC NULLS LAST,
            s.university_roll_no ASC
        ) AS marks_rank
      FROM public.students s
      JOIN public.users u
        ON s.user_id = u.unique_id
      JOIN public.assessments a
        ON s.university_roll_no = a.student_id
      WHERE s.semester = $1
        AND s.section = $2
        AND a.course_id = $3
    )
    SELECT
      *,
      CASE
        WHEN marks_rank <= 5 THEN 'Gallant'
        WHEN obtained_mark / NULLIF(max_mark, 0) < 0.40
          THEN 'Gradual'
        ELSE 'Growing'
      END AS three_g_category
    FROM ranked_students
    ORDER BY university_roll_no ASC;
  `;

    const { rows } = await pool.query(query, [
        semester,
        section,
        courses
    ]);

    return rows;
}

export default getProgressionData;