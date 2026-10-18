// import { Client } from "pg";

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// const academicYear = "2026-27";

// // Format: [course_code, teacher_name, section, semester]
// // Semester III only. Names after "/" are ignored.
// const assignments = [
//   // Section A
//   ["CA205L", "Prashant Agrawal", "A", 3],
//   ["CA220L", "Neelam Rawat", "A", 3],
//   ["CA206B", "Anita Yadav", "A", 3],
//   ["CA205P", "Prashant Agrawal", "A", 3],
//   ["CA301P", "Ankit Verma", "A", 3],
//   ["CA107P", "Apoorv Jain", "A", 3],
//   ["HS301P", "Arunita Mukhopadhyay", "A", 3],

//   // Section B
//   ["CA205L", "Prashant Agrawal", "B", 3],
//   ["CA220L", "Neelam Rawat", "B", 3],
//   ["CA206B", "Anita Yadav", "B", 3],
//   ["CA205P", "Prashant Agrawal", "B", 3],
//   ["CA301P", "Annu Yadav", "B", 3],
//   // ["CA107P", "Apoorv Jain", "B", 3],
//   // ["HS301P", "Arunita Mukhopadhyay", "B", 3],

//   // Section C
//   ["CA205L", "Shweta Singh", "C", 3],
//   ["CA220L", "Saurabh Choudhary", "C", 3],
//   ["CA206B", "Vipin Kumar", "C", 3],
//   ["CA205P", "Shweta Singh", "C", 3],
//   ["CA301P", "Somashree Gorai", "C", 3],
//   // ["CA107P", "Apoorv Jain", "C", 3],
//   // ["HS301P", "Arunita Mukhopadhyay", "C", 3],

//   // Section D
//   ["CA205L", "Shweta Singh", "D", 3],
//   ["CA220L", "Saurabh Choudhary", "D", 3],
//   ["CA206B", "Vipin Kumar", "D", 3],
//   ["CA205P", "Shweta Singh", "D", 3],
//   ["CA301P", "Saurabh Choudhary", "D", 3],
//   // ["CA107P", "New Faculty 2", "D", 3],
//   // ["HS301P", "Arunita Mukhopadhyay", "D", 3],
// ];

// // Explicit aliases for abbreviated names in the timetable.
// const teacherAliases = {
//   "prashant": "prashant agrawal",
//   "neelam": "neelam rawat",
//   "anita": "anita yadav",
//   "vipin": "vipin kumar",
//   "shweta": "shweta singh",
//   "saurabh": "saurabh choudhary",
//   "somashree": "somashree gorai",
//   "ankit": "ankit verma",
//   "annu": "annu yadav",
// };

// function normalizeName(name) {
//   return name
//     .toLowerCase()
//     .replace(/\b(dr|mr|ms|mrs)\.?\s*/g, "")
//     .replace(/[^a-z0-9]/g, "");
// }

// async function findTeacher(name) {
//   const normalizedInput = normalizeName(name);
//   const alias = teacherAliases[normalizedInput] ?? name;
//   const target = normalizeName(alias);

//   const result = await client.query(
//     `SELECT t.emp_id, u.name
//      FROM public.teachers t
//      JOIN public.users u ON u.unique_id = t.user_id
//      WHERE regexp_replace(
//        lower(u.name), '[^a-z0-9]', '', 'g'
//      ) = $1`,
//     [target]
//   );

//   if (result.rowCount !== 1) {
//     return null;
//   }

//   return result.rows[0];
// }

// async function seedAssignments() {
//   let transactionStarted = false;
//   const missingTeachers = new Set();
//   const missingCourses = new Set();
//   let processed = 0;

//   try {
//     if (!process.env.DATABASE_URL) {
//       throw new Error("DATABASE_URL is missing from .env.");
//     }

//     await client.connect();
//     console.log("Connected to Aiven PostgreSQL.");

//     await client.query("BEGIN");
//     transactionStarted = true;

//     for (const [courseCode, teacherName, section, semester] of assignments) {
//       const courseResult = await client.query(
//         `SELECT course_code
//          FROM public.courses
//          WHERE course_code = $1`,
//         [courseCode]
//       );

//       if (courseResult.rowCount === 0) {
//         missingCourses.add(courseCode);
//         continue;
//       }

//       const teacher = await findTeacher(teacherName);

//       if (!teacher) {
//         missingTeachers.add(teacherName);
//         continue;
//       }

//       await client.query(
//         `INSERT INTO public.assigned_courses (
//            course_id,
//            emp_id,
//            section,
//            semester,
//            academic_year
//          )
//          VALUES ($1, $2, $3, $4, $5)
//          ON CONFLICT (
//            course_id,
//            emp_id,
//            section,
//            semester,
//            academic_year
//          )
//          DO NOTHING`,
//         [
//           courseCode,
//           teacher.emp_id,
//           section,
//           semester,
//           academicYear,
//         ]
//       );

//       processed++;
//     }

//     await client.query("COMMIT");
//     transactionStarted = false;

//     console.log(`\nSemester III assignments processed: ${processed}`);

//     if (missingCourses.size) {
//       console.warn("\nCourses missing from public.courses:");
//       for (const code of missingCourses) console.warn(`- ${code}`);
//     }

//     if (missingTeachers.size) {
//       console.warn("\nTeachers missing or not uniquely matched:");
//       for (const name of missingTeachers) console.warn(`- ${name}`);
//     }
//   } catch (error) {
//     if (transactionStarted) {
//       try {
//         await client.query("ROLLBACK");
//       } catch (rollbackError) {
//         console.error("Rollback failed:", rollbackError.message);
//       }
//     }

//     console.error("Assignment seeding failed:", error.message);
//     process.exitCode = 1;
//   } finally {
//     await client.end();
//   }
// }

// seedAssignments();



import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import pg from "pg";

const { Pool } = pg;

const SEMESTER = 1;
const ACADEMIC_YEAR = "2026-27";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Employee IDs are taken from DEL-ANN-FAC-DETAIL.xlsx.
const faculty = {
  RAB: "3739",
  AGU: "4495",
  NEE: "6122",
  SHA: "7073",
  ANN: "21521",
  SHR: "21585",
  SON: "21766",
  MAH: "21775",
  VIJ: "21803",
  ANI: "21800",
  RIY: "21854",
  ABH: "21987",
  DEE: "21984",
  MON: "21990",
  SAK: "22001",
  HRI: "22000",
};

// Exact course IDs printed in the semester-I PDF.
const COURSE = {
  SE: "26CS201PCL",
  OOPCJ: "26CA202PCL",
  OS: "26CA203PCL",
  AIF: "26CA204PCL",
  FEWD: "26CA205PCB",
  OOPCJ_LAB: "26CA202PCP",
};

// One entry per teacher-course-section assignment.
// Teachers absent from the faculty list are deliberately omitted.
const assignments = [
  // Section A
  { course_id: COURSE.SE, teacher: "RAB", section: "A" },
  { course_id: COURSE.OOPCJ, teacher: "SON", section: "A" },
  { course_id: COURSE.OS, teacher: "AGU", section: "A" },
  { course_id: COURSE.AIF, teacher: "NEE", section: "A" },
  { course_id: COURSE.FEWD, teacher: "MAH", section: "A" },
  { course_id: COURSE.OOPCJ_LAB, teacher: "SON", section: "A" },

  // Section B
  { course_id: COURSE.SE, teacher: "RAB", section: "B" },
  { course_id: COURSE.OOPCJ, teacher: "SON", section: "B" },
  { course_id: COURSE.OS, teacher: "AGU", section: "B" },
  { course_id: COURSE.AIF, teacher: "SHA", section: "B" },
  { course_id: COURSE.FEWD, teacher: "MAH", section: "B" },
  { course_id: COURSE.OOPCJ_LAB, teacher: "SON", section: "B" },

  // Section C
  { course_id: COURSE.SE, teacher: "HRI", section: "C" },
  { course_id: COURSE.OOPCJ, teacher: "DEE", section: "C" },
  { course_id: COURSE.OS, teacher: "AGU", section: "C" },
  { course_id: COURSE.AIF, teacher: "MAH", section: "C" },
  { course_id: COURSE.FEWD, teacher: "ANI", section: "C" },
  { course_id: COURSE.OOPCJ_LAB, teacher: "DEE", section: "C" },

  // Section D
  { course_id: COURSE.SE, teacher: "HRI", section: "D" },
  { course_id: COURSE.OOPCJ, teacher: "SHR", section: "D" },
  { course_id: COURSE.OS, teacher: "ANN", section: "D" },
  { course_id: COURSE.AIF, teacher: "ABH", section: "D" },
  { course_id: COURSE.FEWD, teacher: "SHA", section: "D" },
  { course_id: COURSE.OOPCJ_LAB, teacher: "SHR", section: "D" },

  // Section E
  { course_id: COURSE.SE, teacher: "ABH", section: "E" },
  { course_id: COURSE.OOPCJ, teacher: "SHR", section: "E" },
  { course_id: COURSE.OS, teacher: "ANN", section: "E" },
  { course_id: COURSE.AIF, teacher: "HRI", section: "E" },
  { course_id: COURSE.FEWD, teacher: "SHA", section: "E" },
  { course_id: COURSE.OOPCJ_LAB, teacher: "SHR", section: "E" },
];

async function seedAssignedCourses() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    for (const assignment of assignments) {
      const result = await client.query(
        `INSERT INTO assigned_courses
          (course_id, emp_id, section, semester, academic_year)
         VALUES($1, $2, $3, $4, $5)`, [assignment.course_id, faculty[assignment.teacher], assignment.section, SEMESTER, ACADEMIC_YEAR,])
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seeding failed. Transaction rolled back:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAssignedCourses().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exitCode = 1;
});
