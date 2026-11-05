
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import getUser from "@/app/api/users/getUser";
import pool from "@/config/db.config";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

const VALID_CATEGORIES = ["Gradual", "Growing", "Gallant"];
const DUPLICATE_ASSIGNMENT_MESSAGE =
    "This action has already been assigned to one or more eligible students for the selected assessment, course, section, semester, program, and category.";

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
        const section = typeof body.section === "string" ? body.section.trim() : "";
        const dueAt = typeof body.due_at === "string" ? new Date(body.due_at) : null;

        if (
            !actionId ||
            !/^\d+$/.test(String(actionId)) ||
            !program ||
            !Number.isInteger(semester) ||
            semester < 1 ||
            !courseCode ||
            !section
        ) {
            return NextResponse.json(
                {
                    error: "A valid action, program, semester, course, and section are required.",
                },
                { status: 400 }
            );
        }

        if (!dueAt || Number.isNaN(dueAt.getTime())) {
            return NextResponse.json(
                { error: "A valid due date and time are required." },
                { status: 400 }
            );
        }

        if (dueAt <= new Date()) {
            return NextResponse.json(
                { error: "The due date and time must be in the future." },
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
             title,
             description,
             target_category,
             assessment_type,
             submitter_type
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
            `SELECT ac.academic_year
       FROM public.assigned_courses ac
       JOIN public.teachers t
         ON t.emp_id = ac.emp_id
       WHERE t.emp_id = $1
         AND ac.course_id = $2
         AND ac.semester = $3
         AND ac.section = $4
       ORDER BY ac.academic_year DESC
       LIMIT 1`,
            [empId, courseCode, semester, section]
        );

        if (teachingAssignment.rowCount === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                {
                    error: "You are not assigned to teach this course, section, and semester.",
                },
                { status: 403 }
            );
        }

        const assignmentScope = [
            action.action_id,
            program,
            courseCode,
            section,
            semester,
            assessment,
            category,
        ].join(":");
        await client.query(
            "SELECT pg_advisory_xact_lock(hashtext($1))",
            [assignmentScope]
        );

        const existingAssignmentResult = await client.query(
            `SELECT aa.assignment_id
       FROM public.action_assignments aa
       JOIN public.activities activity
         ON activity.activity_id = aa.activity_id
       JOIN public.course_enrollment ce
         ON ce.id = aa.enrollment_id
       JOIN public.students s
         ON s.university_roll_no = ce.student_id
       WHERE aa.action_id = $1
         AND activity.course_code = $2
         AND activity.semester = $3
         AND activity.academic_year = $8
         AND ce.course_id = $2
         AND ce.semester = $3
         AND ce.academic_year = $8
         AND s.program_name = $4
         AND s.section = $5
         AND activity.assessment_type = $6
         AND activity.target_category = $7
         AND s.semester = ce.semester
       LIMIT 1`,
            [
                action.action_id,
                courseCode,
                semester,
                program,
                section,
                assessment,
                category,
                teachingAssignment.rows[0].academic_year,
            ]
        );

        if (existingAssignmentResult.rowCount > 0) {
            await client.query("COMMIT");
            transactionStarted = false;
            return NextResponse.json({
                error: "This action has already been assigned to students in the selected assessment, course, section, semester, program, and category.",
            }, { status: 409 });
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
            AND s.section = $5
            AND ce.academic_year = $6
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

            queryParams = [
                courseCode,
                semester,
                program,
                category,
                section,
                teachingAssignment.rows[0].academic_year,
            ];
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
            AND s.section = $6
            AND ce.academic_year = $7
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
                section,
                teachingAssignment.rows[0].academic_year,
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

        const duplicateStudentAssignment = await client.query(
            `SELECT aa.assignment_id
       FROM public.action_assignments aa
       JOIN UNNEST($1::bigint[]) AS eligible(enrollment_id)
         ON eligible.enrollment_id = aa.enrollment_id
       WHERE aa.action_id = $2
       LIMIT 1`,
            [
                eligibleStudents.map((student) => student.enrollment_id),
                action.action_id,
            ]
        );

        if (duplicateStudentAssignment.rowCount > 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;
            return NextResponse.json(
                { error: DUPLICATE_ASSIGNMENT_MESSAGE },
                { status: 409 }
            );
        }

        const activityResult = await client.query(
            `INSERT INTO public.activities (
         title,
         description,
         course_code,
         created_by_emp_id,
         semester,
         academic_year,
         assessment_type,
         target_category,
         submitter_type,
         due_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'student'), $10)
       RETURNING activity_id`,
            [
                action.title,
                action.description,
                courseCode,
                empId,
                semester,
                teachingAssignment.rows[0].academic_year,
                assessment,
                category,
                action.submitter_type,
                dueAt.toISOString(),
            ]
        );

        /*
         * Each student assignment must reference an activity. Locking
         * eligible enrollments above serializes concurrent assignments for
         * the same action and avoids relying on an undeclared unique index.
         */
        const insertResult = await client.query(
            `INSERT INTO public.action_assignments (
         action_id,
         activity_id,
         enrollment_id,
         assigned_by_emp_id,
         status
       )
       SELECT
         $1,
         $2,
         eligible.enrollment_id,
         $4,
         'Assigned'
       FROM UNNEST($3::bigint[]) AS eligible(enrollment_id)
       RETURNING assignment_id`,
            [
                action.action_id,
                activityResult.rows[0].activity_id,
                eligibleStudents.map((student) => student.enrollment_id),
                empId,
            ]
        );

        await client.query("COMMIT");
        transactionStarted = false;

        const insertedCount = insertResult.rowCount;
        return NextResponse.json({
            message:
                insertedCount > 0
                    ? `Action assigned to ${insertedCount} student(s).`
                    : "All eligible students already have this action assigned.",
            eligibleCount: eligibleStudents.length,
            insertedCount,
            alreadyAssignedCount: 0,
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Assignment rollback failed:", rollbackError);
            }
        }

        if (
            error.code === "23505" &&
            error.constraint === "uq_student_action_assignment"
        ) {
            return NextResponse.json(
                { error: DUPLICATE_ASSIGNMENT_MESSAGE },
                { status: 409 }
            );
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
