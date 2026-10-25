
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

const VALID_CATEGORIES = ["Gradual", "Growing", "Gallant"];

export async function POST(request, { params }) {
    let client;
    let transactionStarted = false;

    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const email = getTeacherEmailFromSession(
            cookieStore.get(SESSION_COOKIE)?.value
        );
        const teacher = email ? await getUser(email) : null;
        const empId = teacher?.role === "teacher" ? teacher.empId : null;

        if (!empId) {
            return NextResponse.json(
                { error: "You must be signed in as a teacher." },
                { status: 401 }
            );
        }

        const { actionId } = await params;

        const program = body.program;
        const semester = Number(body.semester);
        const courseCode = body.course_code;

        if (
            !actionId ||
            !/^\d+$/.test(String(actionId)) ||
            !program ||
            !Number.isInteger(semester) ||
            semester < 1 ||
            !courseCode
        ) {
            return NextResponse.json(
                {
                    error: "A valid action, program, semester, and course are required.",
                },
                { status: 400 }
            );
        }

        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // Confirm that this action is active.
        const actionResult = await client.query(
            `SELECT
         action_id,
         target_category,
         assessment_type
       FROM public.action_templates
       WHERE action_id = $1
         AND is_active = TRUE
       FOR SHARE`,
            [actionId]
        );

        if (actionResult.rowCount === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                { error: "Action not found or inactive." },
                { status: 404 }
            );
        }

        const action = actionResult.rows[0];
        const category = action.target_category;
        const assessment = action.assessment_type;

        if (!VALID_CATEGORIES.includes(category)) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                { error: "The action has an invalid target category." },
                { status: 400 }
            );
        }

        if (!["pre-mse", "mse-1", "mse-2", "ese"].includes(assessment)) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                { error: "The action has an invalid assessment type." },
                { status: 400 }
            );
        }

        // Verify that the authenticated teacher is assigned to this course,
        // semester and academic year. Resolve the current academic year from
        // the matching student enrollments, rather than trusting the browser.
        const teachingAssignment = await client.query(
            `SELECT 1
       FROM public.assigned_courses ac
       JOIN public.teachers t
         ON t.emp_id = ac.emp_id
       WHERE t.emp_id = $1
         AND ac.course_id = $2
         AND ac.semester = $3
       LIMIT 1`,
            [empId, courseCode, semester]
        );

        if (teachingAssignment.rowCount === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                {
                    error: "You are not assigned to teach this course and semester.",
                },
                { status: 403 }
            );
        }

        /*
         * Match the dashboard category logic.
         *
         * Pre-MSE:
         *   Rank students by previous semester SGPA.
         *
         * MSE-1, MSE-2, ESE:
         *   Rank students by obtained marks for the selected assessment.
         *
         * Eligible students must be enrolled in the selected course and
         * semester and belong to the selected program.
         *
         * Pre-MSE students with a backlog are Gradual even without an SGPA.
         * Other students without the score needed for categorization are excluded.
         */
        let categoryQuery;
        let queryParams;

        if (assessment === "pre-mse") {
            categoryQuery = `
        WITH enrolled AS (
          SELECT
            ce.id AS enrollment_id,
            ce.student_id,
            ce.academic_year,
            sar.sgpa,
            COALESCE(sar.backlog, FALSE) AS backlog
          FROM public.course_enrollment ce
          JOIN public.students s
            ON s.university_roll_no = ce.student_id
          LEFT JOIN LATERAL (
            SELECT sar.sgpa, sar.backlog
            FROM public.student_academic_records sar
            WHERE sar.student_id = ce.student_id
              AND sar.semester + 1 = ce.semester
            ORDER BY sar.created_at DESC, sar.id DESC
            LIMIT 1
          ) sar ON TRUE
          WHERE ce.course_id = $1
            AND ce.semester = $2
            AND s.program_name = $3
            AND s.semester = ce.semester
        ),
        ranked AS (
          SELECT
            *,
            CASE
              WHEN sgpa IS NULL THEN NULL
              ELSE DENSE_RANK() OVER (
                ORDER BY sgpa DESC NULLS LAST
              )
            END AS marks_rank
          FROM enrolled
        ),
        categorized AS (
          SELECT
            enrollment_id,
            student_id,
            CASE
              WHEN backlog THEN 'Gradual'
              WHEN marks_rank IS NULL THEN NULL
              WHEN marks_rank <= 10 THEN 'Gallant'
              WHEN sgpa::numeric / 10 < 0.40 THEN 'Gradual'
              ELSE 'Growing'
            END AS three_g_category
          FROM ranked
        )
        SELECT enrollment_id, student_id
        FROM categorized
        WHERE three_g_category = $4
        ORDER BY student_id
        FOR UPDATE
      `;

            queryParams = [courseCode, semester, program, category];
        } else {
            categoryQuery = `
        WITH enrolled AS (
          SELECT
            ce.id AS enrollment_id,
            ce.student_id,
            ce.academic_year,
            a.obtained_mark,
            a.max_mark
          FROM public.course_enrollment ce
          JOIN public.students s
            ON s.university_roll_no = ce.student_id
          LEFT JOIN LATERAL (
            SELECT
              a.obtained_mark,
              a.max_mark
            FROM public.assessments a
            WHERE a.student_id = ce.student_id
              AND a.course_id = ce.course_id
              AND a.semester = ce.semester
              AND a.academic_year = ce.academic_year
              AND a.type = $4
            ORDER BY a.id DESC
            LIMIT 1
          ) a ON TRUE
          WHERE ce.course_id = $1
            AND ce.semester = $2
            AND s.program_name = $3
            AND s.semester = ce.semester
        ),
        ranked AS (
          SELECT
            *,
            CASE
              WHEN obtained_mark IS NULL THEN NULL
              ELSE DENSE_RANK() OVER (
                ORDER BY obtained_mark DESC NULLS LAST
              )
            END AS marks_rank
          FROM enrolled
        ),
        categorized AS (
          SELECT
            enrollment_id,
            student_id,
            CASE
              WHEN marks_rank IS NULL THEN NULL
              WHEN marks_rank <= 10 THEN 'Gallant'
              WHEN obtained_mark::numeric
                   / NULLIF(max_mark, 0) < 0.40
                THEN 'Gradual'
              ELSE 'Growing'
            END AS three_g_category
          FROM ranked
        )
        SELECT enrollment_id, student_id
        FROM categorized
        WHERE three_g_category = $5
        ORDER BY student_id
        FOR UPDATE
      `;

            queryParams = [
                courseCode,
                semester,
                program,
                assessment,
                category,
            ];
        }

        const eligibleResult = await client.query(
            categoryQuery,
            queryParams
        );

        const eligibleStudents = eligibleResult.rows;

        if (eligibleStudents.length === 0) {
            await client.query("COMMIT");
            transactionStarted = false;

            return NextResponse.json({
                message: "No eligible students found for this category.",
                eligibleCount: 0,
                insertedCount: 0,
                alreadyAssignedCount: 0,
            });
        }

        /*
         * Insert one assignment per eligible enrollment.
         *
         * assigned_by_emp_id is mandatory in your schema, so use the
         * authenticated teacher's emp_id.
         *
         * activity_id remains NULL because its relationship to actions
         * has not been established.
         *
         * Requires a unique constraint/index on (action_id, enrollment_id)
         * for ON CONFLICT to work.
         */
        const insertResult = await client.query(
            `INSERT INTO public.action_assignments (
         action_id,
         enrollment_id,
         assigned_by_emp_id,
         status
       )
       SELECT
         $1,
         eligible.enrollment_id,
         $3,
         'Assigned'
       FROM UNNEST($2::bigint[]) AS eligible(enrollment_id)
       ON CONFLICT (action_id, enrollment_id) DO NOTHING
       RETURNING assignment_id`,
            [
                action.action_id,
                eligibleStudents.map((student) => student.enrollment_id),
                empId,
            ]
        );

        await client.query("COMMIT");
        transactionStarted = false;

        const insertedCount = insertResult.rowCount;
        const alreadyAssignedCount =
            eligibleStudents.length - insertedCount;

        return NextResponse.json({
            message:
                insertedCount > 0
                    ? `Action assigned to ${insertedCount} student(s).`
                    : "All eligible students already have this action assigned.",
            eligibleCount: eligibleStudents.length,
            insertedCount,
            alreadyAssignedCount,
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Assignment rollback failed:", rollbackError);
            }
        }

        console.error("Assign action error:", error);

        return NextResponse.json(
            { error: "Failed to assign action to students." },
            { status: 500 }
        );
    } finally {
        client?.release();
    }
}
