import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const academicYear = "2026-27";

// Format: [course_code, teacher_name, section, semester]
// Semester III only. Names after "/" are ignored.
const assignments = [
  // Section A
  ["CA205L", "Prashant Agrawal", "A", 3],
  ["CA220L", "Neelam Rawat", "A", 3],
  ["CA206B", "Anita Yadav", "A", 3],
  ["CA205P", "Prashant Agrawal", "A", 3],
  ["CA301P", "Ankit Verma", "A", 3],
  ["CA107P", "Apoorv Jain", "A", 3],
  ["HS301P", "Arunita Mukhopadhyay", "A", 3],

  // Section B
  ["CA205L", "Prashant Agrawal", "B", 3],
  ["CA220L", "Neelam Rawat", "B", 3],
  ["CA206B", "Anita Yadav", "B", 3],
  ["CA205P", "Prashant Agrawal", "B", 3],
  ["CA301P", "Annu Yadav", "B", 3],
  // ["CA107P", "Apoorv Jain", "B", 3],
  // ["HS301P", "Arunita Mukhopadhyay", "B", 3],

  // Section C
  ["CA205L", "Shweta Singh", "C", 3],
  ["CA220L", "Saurabh Choudhary", "C", 3],
  ["CA206B", "Vipin Kumar", "C", 3],
  ["CA205P", "Shweta Singh", "C", 3],
  ["CA301P", "Somashree Gorai", "C", 3],
  // ["CA107P", "Apoorv Jain", "C", 3],
  // ["HS301P", "Arunita Mukhopadhyay", "C", 3],

  // Section D
  ["CA205L", "Shweta Singh", "D", 3],
  ["CA220L", "Saurabh Choudhary", "D", 3],
  ["CA206B", "Vipin Kumar", "D", 3],
  ["CA205P", "Shweta Singh", "D", 3],
  ["CA301P", "Saurabh Choudhary", "D", 3],
  // ["CA107P", "New Faculty 2", "D", 3],
  // ["HS301P", "Arunita Mukhopadhyay", "D", 3],
];

// Explicit aliases for abbreviated names in the timetable.
const teacherAliases = {
  "prashant": "prashant agrawal",
  "neelam": "neelam rawat",
  "anita": "anita yadav",
  "vipin": "vipin kumar",
  "shweta": "shweta singh",
  "saurabh": "saurabh choudhary",
  "somashree": "somashree gorai",
  "ankit": "ankit verma",
  "annu": "annu yadav",
};

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\b(dr|mr|ms|mrs)\.?\s*/g, "")
    .replace(/[^a-z0-9]/g, "");
}

async function findTeacher(name) {
  const normalizedInput = normalizeName(name);
  const alias = teacherAliases[normalizedInput] ?? name;
  const target = normalizeName(alias);

  const result = await client.query(
    `SELECT t.emp_id, u.name
     FROM public.teachers t
     JOIN public.users u ON u.unique_id = t.user_id
     WHERE regexp_replace(
       lower(u.name), '[^a-z0-9]', '', 'g'
     ) = $1`,
    [target]
  );

  if (result.rowCount !== 1) {
    return null;
  }

  return result.rows[0];
}

async function seedAssignments() {
  let transactionStarted = false;
  const missingTeachers = new Set();
  const missingCourses = new Set();
  let processed = 0;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing from .env.");
    }

    await client.connect();
    console.log("Connected to Aiven PostgreSQL.");

    await client.query("BEGIN");
    transactionStarted = true;

    for (const [courseCode, teacherName, section, semester] of assignments) {
      const courseResult = await client.query(
        `SELECT course_code
         FROM public.courses
         WHERE course_code = $1`,
        [courseCode]
      );

      if (courseResult.rowCount === 0) {
        missingCourses.add(courseCode);
        continue;
      }

      const teacher = await findTeacher(teacherName);

      if (!teacher) {
        missingTeachers.add(teacherName);
        continue;
      }

      await client.query(
        `INSERT INTO public.assigned_courses (
           course_id,
           emp_id,
           section,
           semester,
           academic_year
         )
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (
           course_id,
           emp_id,
           section,
           semester,
           academic_year
         )
         DO NOTHING`,
        [
          courseCode,
          teacher.emp_id,
          section,
          semester,
          academicYear,
        ]
      );

      processed++;
    }

    await client.query("COMMIT");
    transactionStarted = false;

    console.log(`\nSemester III assignments processed: ${processed}`);

    if (missingCourses.size) {
      console.warn("\nCourses missing from public.courses:");
      for (const code of missingCourses) console.warn(`- ${code}`);
    }

    if (missingTeachers.size) {
      console.warn("\nTeachers missing or not uniquely matched:");
      for (const name of missingTeachers) console.warn(`- ${name}`);
    }
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    console.error("Assignment seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedAssignments();