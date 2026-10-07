import dotenv from "dotenv";

dotenv.config({ path: ".env" });

import pg from "pg";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(
  __dirname,
  "../data/Book1.xlsx"
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
});

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const ACADEMIC_YEAR = "2026-27";

const DEPARTMENT_CODE = "DCA";
const DEPARTMENT_NAME =
  "Department Of Computer Applications";

const PROGRAM_NAME =
  "Master of Computer Applications";

const TEACHER_NAME = "Ms. Annu Yadav";
const TEACHER_EMAIL = "annu.yadav@3gs.local";

const COURSE_CODE = "MCA-OS-301";
const COURSE_NAME = "Operating System";

const SEMESTER = 3;

const SECTIONS = ["A", "B", "C", "D"];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function cleanString(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value).trim();
}

function cleanNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}

/*
 * 60 students / 4 sections = 15 students
 *
 * A = 1-15
 * B = 16-30
 * C = 31-45
 * D = 46-60
 */

function getSection(index) {
  const sectionIndex = Math.floor(index / 15);

  return SECTIONS[sectionIndex] || "D";
}

/*
|--------------------------------------------------------------------------
| Main seed
|--------------------------------------------------------------------------
*/

async function seed() {
  const client = await pool.connect();

  try {
    console.log("");
    console.log("========================================");
    console.log("3Gs Project - Excel Database Seeder");
    console.log("========================================");
    console.log("");

    /*
    |--------------------------------------------------------------------------
    | Read Excel
    |--------------------------------------------------------------------------
    */

    console.log("Reading Excel file...");
    console.log(`File: ${excelPath}`);

    const workbook = XLSX.readFile(excelPath);

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error(
        "No worksheet found in Excel file."
      );
    }

    console.log(`Worksheet: ${sheetName}`);

    const worksheet =
      workbook.Sheets[sheetName];

    const rows =
      XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
      });

    /*
    |--------------------------------------------------------------------------
    | Excel structure
    |--------------------------------------------------------------------------
    |
    | Row 1 -> title
    | Row 2 -> description
    | Row 3 -> blank
    | Row 4 -> headers
    | Row 5 onwards -> students
    |
    */

    const headers = rows[3];

    if (!headers) {
      throw new Error(
        "Could not find the Excel header row."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Build column index
    |--------------------------------------------------------------------------
    */

    const columnIndex = {};

    headers.forEach((header, index) => {
      if (
        header !== null &&
        header !== undefined &&
        String(header).trim() !== ""
      ) {
        columnIndex[
          String(header).trim()
        ] = index;
      }
    });

    console.log("");
    console.log("Excel columns found:");

    Object.keys(columnIndex).forEach(
      (column) => {
        console.log(`  - ${column}`);
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Validate required columns
    |--------------------------------------------------------------------------
    |
    | We only require columns that are actually
    | needed by the current database schema.
    |
    */

    const requiredColumns = [
      "Univ. Roll No.",
      "Student Name",
      "MSE-1 Att (%)",
      "MSE-1 Marks (/30)",
      "MSE-2 Att (%)",
      "MSE-2 Marks (/30)",
    ];

    for (const column of requiredColumns) {
      if (columnIndex[column] === undefined) {
        throw new Error(
          `Required Excel column not found: "${column}"`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Get cell value
    |--------------------------------------------------------------------------
    */

    function getValue(row, columnName) {
      const index =
        columnIndex[columnName];

      if (index === undefined) {
        return null;
      }

      return row[index];
    }

    /*
    |--------------------------------------------------------------------------
    | Get student rows
    |--------------------------------------------------------------------------
    */

    const studentRows = rows
      .slice(4)
      .filter((row) => {
        if (!row) {
          return false;
        }

        const rollNo = getValue(
          row,
          "Univ. Roll No."
        );

        return (
          rollNo !== null &&
          rollNo !== undefined &&
          String(rollNo).trim() !== ""
        );
      });

    console.log("");
    console.log(
      `Student rows found: ${studentRows.length}`
    );

    if (studentRows.length === 0) {
      throw new Error(
        "No student records found in Excel."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Parse students
    |--------------------------------------------------------------------------
    */

    const students = studentRows.map(
      (row) => {
        return {
          rollNo: cleanString(
            getValue(
              row,
              "Univ. Roll No."
            )
          ),

          fullName: cleanString(
            getValue(
              row,
              "Student Name"
            )
          ),

          // Read for future use.
          // Current schema does not have a
          // suitable field for Pre-MSE CGPA.
          preMseCgpa: cleanNumber(
            getValue(
              row,
              "Pre-MSE CGPA"
            )
          ),

          preMseRank: cleanNumber(
            getValue(
              row,
              "Pre-MSE Rank"
            )
          ),

          preMseCategory: cleanString(
            getValue(
              row,
              "Pre-MSE Category"
            )
          ),

          /*
          |--------------------------------------------------------------------------
          | MSE-1
          |--------------------------------------------------------------------------
          */

          mse1Attendance: cleanNumber(
            getValue(
              row,
              "MSE-1 Att (%)"
            )
          ),

          mse1Marks: cleanNumber(
            getValue(
              row,
              "MSE-1 Marks (/30)"
            )
          ),

          mse1Category: cleanString(
            getValue(
              row,
              "MSE-1 Category"
            )
          ),

          /*
          |--------------------------------------------------------------------------
          | MSE-2
          |--------------------------------------------------------------------------
          */

          mse2Attendance: cleanNumber(
            getValue(
              row,
              "MSE-2 Att (%)"
            )
          ),

          mse2Marks: cleanNumber(
            getValue(
              row,
              "MSE-2 Marks (/30)"
            )
          ),

          mse2Category: cleanString(
            getValue(
              row,
              "MSE-2 Category"
            )
          ),
        };
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Validate students
    |--------------------------------------------------------------------------
    */

    for (const student of students) {
      if (!student.rollNo) {
        throw new Error(
          "A student is missing University Roll No."
        );
      }

      if (!student.fullName) {
        throw new Error(
          `Student ${student.rollNo} is missing a name.`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Sort students alphabetically
    |--------------------------------------------------------------------------
    |
    | Temporary section allocation:
    |
    | First 15 -> A
    | Next 15  -> B
    | Next 15  -> C
    | Last 15  -> D
    |
    */

    students.sort((a, b) => {
      return a.fullName.localeCompare(
        b.fullName,
        "en",
        {
          sensitivity: "base",
        }
      );
    });

    /*
    |--------------------------------------------------------------------------
    | Start transaction
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log(
      "Starting database transaction..."
    );

    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | 1. Department
    |--------------------------------------------------------------------------
    */

    console.log(
      "Creating department..."
    );

    const departmentResult =
      await client.query(
        `
          INSERT INTO departments (
            dept_code,
            dept_name
          )
          VALUES ($1, $2)

          ON CONFLICT (dept_code)
          DO UPDATE SET
            dept_name = EXCLUDED.dept_name

          RETURNING unique_id;
        `,
        [
          DEPARTMENT_CODE,
          DEPARTMENT_NAME,
        ]
      );

    const departmentId =
      departmentResult.rows[0].unique_id;

    /*
    |--------------------------------------------------------------------------
    | 2. Teacher User
    |--------------------------------------------------------------------------
    */

    console.log(
      "Creating teacher user..."
    );

    const teacherUserResult =
      await client.query(
        `
          INSERT INTO users (
            role,
            mail_id,
            phone_number,
            name,
            dept_id
          )
          VALUES (
            'teacher',
            $1,
            $2,
            $3,
            $4
          )

          ON CONFLICT (mail_id)
          DO UPDATE SET
            name = EXCLUDED.name,
            dept_id = EXCLUDED.dept_id

          RETURNING unique_id;
        `,
        [
          TEACHER_EMAIL,
          null,
          TEACHER_NAME,
          departmentId,
        ]
      );

    const teacherUserId =
      teacherUserResult.rows[0].unique_id;

    /*
    |--------------------------------------------------------------------------
    | 3. Teacher
    |--------------------------------------------------------------------------
    */

    console.log(
      "Creating teacher..."
    );

    const teacherResult =
      await client.query(
        `
          INSERT INTO teachers (
            user_id
          )
          VALUES ($1)

          ON CONFLICT (user_id)
          DO UPDATE SET
            user_id = EXCLUDED.user_id

          RETURNING teacher_id;
        `,
        [teacherUserId]
      );

    const teacherId =
      teacherResult.rows[0].teacher_id;

    /*
    |--------------------------------------------------------------------------
    | 4. Course
    |--------------------------------------------------------------------------
    */

    console.log(
      "Creating course..."
    );

    const courseResult =
      await client.query(
        `
          INSERT INTO courses (
            course_code,
            dept_id,
            course_name
          )
          VALUES ($1, $2, $3)

          ON CONFLICT (course_code)
          DO UPDATE SET
            dept_id = EXCLUDED.dept_id,
            course_name = EXCLUDED.course_name

          RETURNING course_code;
        `,
        [
          COURSE_CODE,
          departmentId,
          COURSE_NAME,
        ]
      );

    const courseCode =
      courseResult.rows[0].course_code;

    /*
    |--------------------------------------------------------------------------
    | 5. Assigned Courses
    |--------------------------------------------------------------------------
    */

    console.log(
      "Creating teacher-course assignments..."
    );

    for (const section of SECTIONS) {
      await client.query(
        `
          INSERT INTO assigned_courses (
            course_id,
            teacher_id,
            section,
            semester,
            academic_year
          )
          VALUES ($1, $2, $3, $4, $5)

          ON CONFLICT (
            course_id,
            teacher_id,
            section,
            semester,
            academic_year
          )
          DO NOTHING;
        `,
        [
          courseCode,
          teacherId,
          section,
          SEMESTER,
          ACADEMIC_YEAR,
        ]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Students
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log(
      "Importing students..."
    );
    console.log("");

    let studentCount = 0;
    let enrollmentCount = 0;
    let mse1Count = 0;
    let mse2Count = 0;

    for (
      let index = 0;
      index < students.length;
      index++
    ) {
      const student =
        students[index];

      const section =
        getSection(index);

      /*
      |--------------------------------------------------------------------------
      | 6A. Student User
      |--------------------------------------------------------------------------
      |
      | Temporary development email because
      | the Excel does not contain student emails.
      |
      */

      const studentEmail =
        `${student.rollNo.toLowerCase()}@3gs.local`;

      const studentUserResult =
        await client.query(
          `
            INSERT INTO users (
              role,
              mail_id,
              phone_number,
              name,
              dept_id
            )
            VALUES (
              'student',
              $1,
              $2,
              $3,
              $4
            )

            ON CONFLICT (mail_id)
            DO UPDATE SET
              name = EXCLUDED.name,
              dept_id = EXCLUDED.dept_id

            RETURNING unique_id;
          `,
          [
            studentEmail,
            null,
            student.fullName,
            departmentId,
          ]
        );

      const studentUserId =
        studentUserResult.rows[0].unique_id;

      /*
      |--------------------------------------------------------------------------
      | 6B. Student
      |--------------------------------------------------------------------------
      */

      await client.query(
        `
          INSERT INTO students (
            university_roll_no,
            semester,
            section,
            user_id,
            program_name,
            dept_id,
            academic_year
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )

          ON CONFLICT (
            university_roll_no
          )
          DO UPDATE SET
            semester = EXCLUDED.semester,
            section = EXCLUDED.section,
            user_id = EXCLUDED.user_id,
            program_name = EXCLUDED.program_name,
            dept_id = EXCLUDED.dept_id,
            academic_year = EXCLUDED.academic_year;
        `,
        [
          student.rollNo,
          SEMESTER,
          section,
          studentUserId,
          PROGRAM_NAME,
          departmentId,
          ACADEMIC_YEAR,
        ]
      );

      studentCount++;

      /*
      |--------------------------------------------------------------------------
      | 6C. Course Enrollment
      |--------------------------------------------------------------------------
      */

      await client.query(
        `
          INSERT INTO course_enrollment (
            course_id,
            student_id
          )
          VALUES ($1, $2)

          ON CONFLICT (
            course_id,
            student_id
          )
          DO NOTHING;
        `,
        [
          courseCode,
          student.rollNo,
        ]
      );

      enrollmentCount++;

      /*
      |--------------------------------------------------------------------------
      | 6D. MSE-1 Assessment
      |--------------------------------------------------------------------------
      |
      | In your schema, assessment contains the
      | student's actual result.
      |
      */

      await client.query(
        `
          DELETE FROM assessments
          WHERE course_id = $1
            AND student_id = $2
            AND type = 'mse-1';
        `,
        [
          courseCode,
          student.rollNo,
        ]
      );

      await client.query(
        `
          INSERT INTO assessments (
            type,
            max_mark,
            obtained_mark,
            attendance_pct,
            faculty_observation,
            course_id,
            student_id,
            category
          )
          VALUES (
            'mse-1',
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          );
        `,
        [
          30,
          student.mse1Marks,
          student.mse1Attendance,
          null,
          courseCode,
          student.rollNo,
          student.mse1Category,
        ]
      );

      mse1Count++;

      /*
      |--------------------------------------------------------------------------
      | 6E. MSE-2 Assessment
      |--------------------------------------------------------------------------
      */

      await client.query(
        `
          DELETE FROM assessments
          WHERE course_id = $1
            AND student_id = $2
            AND type = 'mse-2';
        `,
        [
          courseCode,
          student.rollNo,
        ]
      );

      await client.query(
        `
          INSERT INTO assessments (
            type,
            max_mark,
            obtained_mark,
            attendance_pct,
            faculty_observation,
            course_id,
            student_id,
            category
          )
          VALUES (
            'mse-2',
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          );
        `,
        [
          30,
          student.mse2Marks,
          student.mse2Attendance,
          null,
          courseCode,
          student.rollNo,
          student.mse2Category,
        ]
      );

      mse2Count++;

      console.log(
        `${String(index + 1).padStart(2, "0")}. ` +
        `${student.rollNo} | ` +
        `${student.fullName} | ` +
        `Section ${section}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("========================================");
    console.log(
      "DATABASE SEED COMPLETED"
    );
    console.log("========================================");

    console.log(
      `Academic Year     : ${ACADEMIC_YEAR}`
    );

    console.log(
      `Department        : ${DEPARTMENT_NAME}`
    );

    console.log(
      `Program           : ${PROGRAM_NAME}`
    );

    console.log(
      `Semester          : ${SEMESTER}`
    );

    console.log(
      `Course            : ${COURSE_NAME}`
    );

    console.log(
      `Teacher           : ${TEACHER_NAME}`
    );

    console.log(
      `Students          : ${studentCount}`
    );

    console.log(
      `Enrollments       : ${enrollmentCount}`
    );

    console.log(
      `MSE-1 Assessments : ${mse1Count}`
    );

    console.log(
      `MSE-2 Assessments : ${mse2Count}`
    );

    console.log("");
    console.log(
      "Section distribution:"
    );

    for (const section of SECTIONS) {
      const start =
        SECTIONS.indexOf(section) * 15 + 1;

      const end = start + 14;

      console.log(
        `  Section ${section}: students ${start}-${end}`
      );
    }

    console.log(
      "========================================"
    );

    console.log("");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("");
    console.error(
      "========================================"
    );

    console.error(
      "DATABASE SEED FAILED"
    );

    console.error(
      "========================================"
    );

    console.error(error);

    console.error("");

    console.error(
      "All database changes have been rolled back."
    );

    console.error("");

    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

/*
|--------------------------------------------------------------------------
| Run
|--------------------------------------------------------------------------
*/

seed();