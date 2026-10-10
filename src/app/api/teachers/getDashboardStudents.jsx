import pool from "@/config/db.config";

const getDashboardStudents = async (
    filter,
    page = 1,
    pageSize = 10,
    category = "all"
) => {
    const { semester, className, courses, assessment } = filter ?? {};

    page = Math.max(1, Number.parseInt(page, 10) || 1);
    pageSize = Math.min(
        100,
        Math.max(1, Number.parseInt(pageSize, 10) || 10)
    );

    const allowedCategories = [
        "all",
        "Gradual",
        "Gallant",
        "Growing",
    ];

    if (!allowedCategories.includes(category)) {
        throw new Error("Invalid 3G category");
    }

    if (!className || !courses || !semester || !assessment) {
        throw new Error("Missing required dashboard filters");
    }

    const section = className.replace(/^MCA-/, "");
    const values = [semester, section, courses, assessment];

    const rankedStudents = `
        WITH ranked_students AS (
            SELECT
                u.name,
                s.university_roll_no AS university_roll_no,
                s.semester,
                s.section,
                a.attendance_pct,
                a.max_mark,
                a.obtained_mark,
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
              AND a.type = $4
        ),
        categorized_students AS (
            SELECT
                *,
                CASE
                    WHEN marks_rank <= 5 THEN 'Gallant'
                    WHEN obtained_mark / NULLIF(max_mark, 0) < 0.40
                        THEN 'Gradual'
                    ELSE 'Growing'
                END AS three_g_category
            FROM ranked_students
        )
    `;

    const categoryCondition =
        category === "all"
            ? ""
            : "WHERE three_g_category = $5";

    const queryValues =
        category === "all"
            ? values
            : [...values, category];

    const limitPosition = queryValues.length + 1;
    const offsetPosition = queryValues.length + 2;

    const [studentsResult, countResult] = await Promise.all([
        pool.query(
            `${rankedStudents}
             SELECT
                name,
                university_roll_no,
                semester,
                section,
                attendance_pct,
                max_mark,
                obtained_mark,
                marks_rank,
                three_g_category
             FROM categorized_students
             ${categoryCondition}
             ORDER BY university_roll_no ASC
             LIMIT $${limitPosition}
             OFFSET $${offsetPosition}`,
            [
                ...queryValues,
                pageSize,
                (page - 1) * pageSize,
            ]
        ),

        pool.query(
            `${rankedStudents}
             SELECT COUNT(*) AS total
             FROM categorized_students
             ${categoryCondition}`,
            queryValues
        ),
    ]);

    const total = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);

    console.log(total);
    

    return {
        students: studentsResult.rows,
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
        },
    };
};

export default getDashboardStudents;