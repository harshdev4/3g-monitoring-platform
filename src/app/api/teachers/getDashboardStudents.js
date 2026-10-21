import pool from "@/config/db.config";

const getDashboardStudents = async (filter) => {
  const { semester, className, courses, assessment } = filter ?? {};

  if (!className || !courses || !semester || !assessment) {
    throw new Error("Missing required dashboard filters");
  }

  const section = className.replace(/^MCA-/, "");

  if (assessment == 'pre-mse') {
    const query = `
    WITH ranked_students AS (
      SELECT
        u.name,
        s.university_roll_no,
        s.semester,
        s.section,
        sar.sgpa,

        CASE
          WHEN sar.sgpa IS NULL THEN NULL
          ELSE DENSE_RANK() OVER (
            ORDER BY sar.sgpa DESC NULLS LAST
          ) 
        END AS marks_rank

      FROM public.students s

      JOIN public.users u
        ON s.user_id = u.unique_id

      LEFT JOIN public.student_academic_records sar
        ON s.university_roll_no = sar.student_id
        AND sar.semester = s.semester

      WHERE s.semester = $1
        AND s.section = $2
    )

    SELECT
      name,
      university_roll_no,
      semester,
      section,
      sgpa,
      CASE
        WHEN marks_rank IS NULL THEN NULL
        WHEN marks_rank <= 10 THEN 'Gallant'
        WHEN sgpa::numeric / 10 < 0.40 THEN 'Gradual'
        ELSE 'Growing'
      END AS three_g_category

    FROM ranked_students

    ORDER BY university_roll_no ASC;
  `;

    const { rows } = await pool.query(query, [
      semester,
      section
    ]);
    return rows;
  }


  else {
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
        CASE
          WHEN a.obtained_mark IS NULL THEN NULL
          ELSE DENSE_RANK() OVER (
            ORDER BY a.obtained_mark DESC NULLS LAST
          )
        END AS marks_rank

      FROM public.students s

      JOIN public.users u
        ON s.user_id = u.unique_id

      LEFT JOIN public.assessments a
        ON s.university_roll_no = a.student_id
        AND a.semester = $1
        AND a.course_id = $3
        AND a.type = $4

      WHERE s.semester = $1
        AND s.section = $2
    )

    SELECT
      name,
      university_roll_no,
      semester,
      section,
      attendance_pct,
      obtained_mark,
       max_mark,
      CASE
        WHEN marks_rank IS NULL THEN NULL
        WHEN marks_rank <= 10 THEN 'Gallant'
        WHEN obtained_mark::numeric
             / NULLIF(max_mark, 0) < 0.40
          THEN 'Gradual'
        ELSE 'Growing'
      END AS three_g_category

    FROM ranked_students

    ORDER BY university_roll_no ASC;
  `;

    const { rows } = await pool.query(query, [
      semester,
      section,
      courses,
      assessment,
    ]);
    return rows;
  }
};

export default getDashboardStudents;