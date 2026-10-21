import pool from "@/config/db.config";

const getProgressionData = async (filter) => {
  const { semester, className, courses } = filter ?? {};

  if (
    !semester ||
    !className ||
    !courses ||
    (Array.isArray(courses) && courses.length === 0)
  ) {
    throw new Error("Missing required dashboard filters");
  }

  const section = className.replace(/^MCA-/, "");

  // This query expects one course ID.
  if (Array.isArray(courses)) {
    throw new Error(
      "getProgressionData expects a single course ID"
    );
  }

  const query = `
    WITH ranked_assessments AS (
      SELECT
        a.type,
        a.course_id,
        a.student_id,
        a.obtained_mark,
        a.max_mark,

        Dense_Rank() OVER (
          PARTITION BY a.type, a.course_id
          ORDER BY
            a.obtained_mark DESC NULLS LAST
        ) AS marks_rank

      FROM public.assessments a

      JOIN public.students s
        ON s.university_roll_no = a.student_id

      WHERE s.semester = $1
        AND s.section = $2
        AND a.semester = $1
        AND a.course_id = $3
    ),

    categorized_assessments AS (
      SELECT
        type,
        course_id,
        student_id,

        CASE
          WHEN marks_rank <= 10 THEN 'Gallant'
          WHEN obtained_mark::numeric / NULLIF(max_mark, 0) < 0.40
            THEN 'Gradual'
          ELSE 'Growing'
        END AS three_g_category

      FROM ranked_assessments
    ),

    assessment_categories AS (
      SELECT
        type,
        three_g_category,
        COUNT(DISTINCT student_id)::INT AS student_count

      FROM categorized_assessments

      GROUP BY type, three_g_category
    )

    SELECT
      assessment_types.type,
      categories.three_g_category,
      COALESCE(ac.student_count, 0)::INT AS student_count

    FROM (
      VALUES
        ('pre-mse', 1),
        ('mse-1', 2),
        ('mse-2', 3),
        ('ese', 4)
    ) AS assessment_types(type, sort_order)

    CROSS JOIN (
      VALUES
        ('Gradual'),
        ('Growing'),
        ('Gallant')
    ) AS categories(three_g_category)

    LEFT JOIN assessment_categories ac
      ON ac.type = assessment_types.type
      AND ac.three_g_category = categories.three_g_category

    WHERE $1 <> 1
    OR assessment_types.type <> 'pre-mse'
    
    ORDER BY
      assessment_types.sort_order,
      CASE categories.three_g_category
        WHEN 'Gradual' THEN 1
        WHEN 'Growing' THEN 2
        WHEN 'Gallant' THEN 3
      END;
  `;

  const { rows } = await pool.query(query, [
    semester,
    section,
    courses,
  ]);

  return rows;
};

//  New Code
export const getStudentProgressionHistory = async (filter) => {
  const { semester, className, courses, rollNo } = filter ?? {};

  if (!semester || !className || !courses || !rollNo) {
    throw new Error("Missing required student progression filters");
  }

  if (Array.isArray(courses)) {
    throw new Error("Expected a single course ID");
  }

  const section = className.replace(/^MCA-/, "");
  const semesterNumber = Number(semester);

  const query = `
    WITH ranked_assessments AS (
      SELECT
        a.type,
        a.course_id,
        a.student_id,
        a.obtained_mark,
        a.max_mark,
        CASE
          WHEN a.obtained_mark IS NULL THEN NULL
          ELSE DENSE_RANK() OVER (
            PARTITION BY a.type, a.course_id
            ORDER BY a.obtained_mark DESC NULLS LAST
        ) 
        END AS marks_rank

      FROM public.assessments a

      JOIN public.students s
        ON s.university_roll_no = a.student_id

      WHERE s.semester = $1
        AND s.section = $2
        AND a.semester = $1
        AND a.course_id = $3
    ),

    categorized_assessments AS (
      SELECT
        type,
        student_id,
        obtained_mark,
        max_mark,

        CASE
          WHEN obtained_mark IS NULL
            OR max_mark IS NULL
            OR max_mark <= 0
            THEN NULL
          WHEN marks_rank <= 10 THEN 'Gallant'
          WHEN obtained_mark::numeric / NULLIF(max_mark, 0) < 0.40
            THEN 'Gradual'
          ELSE 'Growing'
        END AS category

      FROM ranked_assessments
    ),

    checkpoints AS (
  SELECT *
  FROM (
    VALUES
      ('mse-1', 'MSE 1', 1),
      ('mse-2', 'MSE 2', 2),
      ('ese', 'ESE', 3)
  ) AS cp(type, checkpoint, sort_order)
  WHERE $4 <> 1 OR type <> 'pre-mse'
)

    SELECT
      cp.checkpoint,
      ca.category,
      ca.obtained_mark AS marks,
      ca.max_mark,
      cp.sort_order

    FROM checkpoints cp

    LEFT JOIN categorized_assessments ca
      ON ca.type = cp.type
      AND ca.student_id = $5

    ORDER BY cp.sort_order;
  `;

  const { rows } = await pool.query(query, [
    semester,
    section,
    courses,
    semesterNumber,
    String(rollNo),
  ]);

  return rows;
};


export default getProgressionData;