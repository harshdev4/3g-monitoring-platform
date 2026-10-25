import pool from "@/config/db.config";

const getDashboardStudents = async (filter) => {
  const { semester, className, courses, assessment, academicYear } = filter ?? {};
  const selectedAcademicYear =
    typeof academicYear === "string" && academicYear.trim()
      ? academicYear.trim()
      : null;

  if (!className || !courses || !semester || !assessment) {
    throw new Error("Missing required dashboard filters");
  }

  const section = className.replace(/^MCA-/, "");

  if (assessment == 'pre-mse') {
    const query = `
    WITH pre_mse_students AS (
      SELECT
        u.name,
        s.university_roll_no,
        s.semester,
        s.section,
        s.academic_year,
        sar.sgpa,
        sar.sgpa AS previous_sgpa,
        sar.student_id AS previous_record_id,
        COALESCE(sar.backlog, FALSE) AS backlog,
        (
          SELECT COUNT(*)::INT
          FROM public.action_assignments aa
          JOIN public.course_enrollment ce
            ON ce.id = aa.enrollment_id
          WHERE ce.student_id = s.university_roll_no
            AND ce.course_id = $3
            AND ce.semester = s.semester
            AND ce.academic_year = s.academic_year
        ) AS assigned_actions_count,
        (
          SELECT COUNT(*)::INT
          FROM public.action_assignments aa
          JOIN public.course_enrollment ce
            ON ce.id = aa.enrollment_id
          WHERE ce.student_id = s.university_roll_no
            AND ce.course_id = $3
            AND ce.semester = s.semester
            AND ce.academic_year = s.academic_year
            AND aa.evidence_url IS NOT NULL
        ) AS evidence_submitted_count
      FROM public.students s

      JOIN public.users u
        ON s.user_id = u.unique_id

      LEFT JOIN LATERAL (
        SELECT sar.student_id, sar.sgpa, sar.backlog
        FROM public.student_academic_records sar
        WHERE sar.student_id = s.university_roll_no
          AND sar.semester + 1 = s.semester
        ORDER BY sar.created_at DESC, sar.id DESC
        LIMIT 1
      ) sar ON TRUE

      WHERE s.semester = $1
        AND s.section = $2
        AND EXISTS (
          SELECT 1
          FROM public.course_enrollment ce
          WHERE ce.student_id = s.university_roll_no
            AND ce.course_id = $3
            AND ce.semester = s.semester
            AND ($4::VARCHAR IS NULL OR ce.academic_year = $4)
        )
    ),
    ranked_students AS (
      SELECT
        *,
        CASE
          WHEN sgpa IS NULL THEN NULL
          ELSE DENSE_RANK() OVER (ORDER BY sgpa DESC NULLS LAST)
        END AS marks_rank
      FROM pre_mse_students
    )

    SELECT
      name,
      university_roll_no,
      semester,
      section,
      academic_year,
      sgpa,
      sgpa AS previous_sgpa,
      backlog,
      assigned_actions_count,
      evidence_submitted_count,
      CASE
        WHEN backlog THEN 'Gradual'
        WHEN marks_rank IS NULL THEN NULL
        WHEN marks_rank <= 10 THEN 'Gallant'
        WHEN sgpa::numeric / 10 < 0.40 THEN 'Gradual'
        ELSE 'Growing'
      END AS three_g_category

    FROM ranked_students

    ORDER BY university_roll_no ASC;
  `;

    const { rows } = await pool.query(query, [
      Number(semester),
      section,
      courses,
      selectedAcademicYear,
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
        s.academic_year,
        a.attendance_pct,
        a.max_mark,
        a.obtained_mark,
        previous_record.sgpa AS previous_sgpa,
        previous_record.student_id AS previous_record_id,
        COALESCE(previous_record.backlog, FALSE) AS backlog,
        (
          SELECT COUNT(*)::INT
          FROM public.action_assignments aa
          JOIN public.course_enrollment ce
            ON ce.id = aa.enrollment_id
          WHERE ce.student_id = s.university_roll_no
            AND ce.course_id = $3
            AND ce.semester = s.semester
            AND ce.academic_year = s.academic_year
        ) AS assigned_actions_count,
        (
          SELECT COUNT(*)::INT
          FROM public.action_assignments aa
          JOIN public.course_enrollment ce
            ON ce.id = aa.enrollment_id
          WHERE ce.student_id = s.university_roll_no
            AND ce.course_id = $3
            AND ce.semester = s.semester
            AND ce.academic_year = s.academic_year
            AND aa.evidence_url IS NOT NULL
        ) AS evidence_submitted_count,
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
        AND ($5::VARCHAR IS NULL OR a.academic_year = $5)
      LEFT JOIN LATERAL (
        SELECT sar.student_id, sar.sgpa, sar.backlog
        FROM public.student_academic_records sar
        WHERE sar.student_id = s.university_roll_no
          AND sar.semester + 1 = s.semester
        ORDER BY sar.created_at DESC, sar.id DESC
        LIMIT 1
      ) previous_record ON TRUE

      WHERE s.semester = $1
        AND s.section = $2
    )

    SELECT
      name,
      university_roll_no,
      semester,
      section,
      academic_year,
      attendance_pct,
      obtained_mark,
      max_mark,
      previous_sgpa,
      previous_record_id,
      backlog,
      assigned_actions_count,
      evidence_submitted_count,
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
      selectedAcademicYear,
    ]);

    return rows;
  }
};

export default getDashboardStudents;