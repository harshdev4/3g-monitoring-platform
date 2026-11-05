
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fromBuffer, loadWorkbook } from "@office-kit/xlsx/io";
import { getSheetByIndex } from "@office-kit/xlsx/workbook";
import { iterRows } from "@office-kit/xlsx/worksheet";
import { getCellDisplayText } from "@office-kit/xlsx/styles";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_FILE = path.join(
    __dirname,
    "Students List_Batch 2026-28 V2.0.xlsx"
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Read the Excel workbook.
async function extractStudents() {
    if (!fs.existsSync(EXCEL_FILE)) {
        throw new Error(`Excel file not found: ${EXCEL_FILE}`);
    }

    const workbook = await loadWorkbook(
        fromBuffer(fs.readFileSync(EXCEL_FILE))
    );
    const worksheet = getSheetByIndex(workbook, 0);
    if (!worksheet) {
        throw new Error("Excel workbook does not contain a worksheet.");
    }
    const rows = Array.from(iterRows(worksheet), (row) =>
        row.map((cell) => cell ? getCellDisplayText(workbook, cell) : null)
    );

    // The column headings are on Excel row 4.
    const headers = rows[3].map((value) =>
        String(value ?? "").trim()
    );

    const columnIndex = (columnName) => {
        const index = headers.indexOf(columnName);

        if (index === -1) {
            throw new Error(`Missing Excel column: ${columnName}`);
        }

        return index;
    };

    const columns = {
        name: columnIndex("Student Name"),
        email: columnIndex("Student Email"),
        phone: columnIndex("Student Phone Number"),
        uid: columnIndex("Student UID"),
        section: columnIndex("Section"),
    };

    // Convert each Excel row into an object.
    const students = rows.slice(4)
        .filter((row) => row[columns.uid] != null &&
            String(row[columns.uid]).trim() !== "")
        .map((row) => ({
            role: "student",
            mail_id: String(row[columns.email] ?? "").trim(),
            phone_number: String(row[columns.phone] ?? "").trim(),
            name: String(row[columns.name] ?? "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ")
                .replace(/\b\p{L}/gu, (char) => char.toUpperCase()),
            prefix: null,

            university_roll_no: String(row[columns.uid]).trim(),
            semester: 1,
            section: String(row[columns.section] ?? "")
                .trim()
                .replace(/^MCA-/i, ""),
            program_name: "MCA",
            dept_code: "MCA",
            academic_year: "2026-27",
        }));

    // Validate before making database changes.
    const seenUIDs = new Set();

    for (const student of students) {
        if (
            !student.name ||
            !student.mail_id ||
            !student.phone_number ||
            !student.university_roll_no
        ) {
            throw new Error(
                `Missing required data for UID: ${student.university_roll_no || "unknown"
                }`
            );
        }

        if (!["A", "B", "C", "D", "E"].includes(student.section)) {
            throw new Error(
                `Invalid section "${student.section}" for ${student.university_roll_no}`
            );
        }

        if (seenUIDs.has(student.university_roll_no)) {
            throw new Error(
                `Duplicate student UID: ${student.university_roll_no}`
            );
        }

        seenUIDs.add(student.university_roll_no);
    }

    console.log(`Extracted ${students.length} students from Excel.`);
    console.log(
        "Section counts:",
        Object.groupBy(students, (s) => s.section)
            ? Object.fromEntries(
                ["A", "B", "C", "D", "E"].map((section) => [
                    section,
                    students.filter((s) => s.section === section).length,
                ])
            )
            : {}
    );

    return students;
}

async function seedStudents() {
    if (!process.env.DATABASE_URL) {
        throw new Error("Set DATABASE_URL before running the seed.");
    }

    const students = await extractStudents();
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const student of students) {
            // Insert the user first and retrieve its generated unique_id.
            const userResult = await client.query(
                `INSERT INTO users
          (role, mail_id, phone_number, name, prefix)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING unique_id`,
                [
                    student.role,
                    student.mail_id,
                    student.phone_number,
                    student.name,
                    student.prefix,
                ]
            );

            const userId = userResult.rows[0].unique_id;

            // Link the student record to the newly created user.
            await client.query(
                `INSERT INTO students
          (
            university_roll_no,
            semester,
            section,
            user_id,
            program_name,
            dept_code,
            academic_year
          )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    student.university_roll_no,
                    student.semester,
                    student.section,
                    userId,
                    student.program_name,
                    student.dept_code,
                    student.academic_year,
                ]
            );
        }

        await client.query("COMMIT");

        console.log(
            `Successfully inserted ${students.length} users and students.`
        );
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Seeding failed. Transaction rolled back:", error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

seedStudents().catch(async (error) => {
    console.error(error);

    await pool.end();
    process.exitCode = 1;
});
