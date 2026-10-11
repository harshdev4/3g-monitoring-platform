import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Extracted from the MCA Odd Semester 2026–27 timetables.
// Format: [course_code, course_name]
const courses = [
  // Semester I
  [
    "26MA202ESL",
    "Mathematical Foundations of Computer Applications (MFCA)",
  ],
  ["26CS201PCL", "Software Engineering"],
  [
    "26CA202PCL",
    "Object Oriented Programming Concepts Using Java (OOPCJ)",
  ],
  ["26CA203PCL", "Operating System"],
  ["26CA204PCL", "AI Fundamentals"],
  [
    "26AS108HSL",
    "Analytical Reasoning & Quantitative Techniques",
  ],
  ["26CA205PCB", "Front End Web Development (FEWD)"],
  [
    "26CA202PCP",
    "Object Oriented Programming Concepts Using Java (OOPCJ) - Practical",
  ],
  ["26AS101HSP", "Communication Skills"],

  // Semester III
  ["CA205L", "Analysis & Design of Algorithm (ADA)"],
  ["CA220L", "Fundamentals of Machine Learning (FML)"],
  ["CA206B", "Web Development (WD)"],
  ["CA205P", "Analysis & Design of Algorithm Lab (ADA Lab)"],
  ["CA301P", "Major Project-I (MJP)"],
  ["CA107P", "Internship (INT)"],
  ["HS301P", "Communication for Employability"],
  ["PE-1", "Robotic Agentic Automation (RAA)"],
];

async function seedCourses() {
  let transactionStarted = false;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing from your environment.");
    }

    await client.connect();
    console.log("Connected to Aiven PostgreSQL.");

    // Validate course codes before inserting.
    const courseCodes = courses.map(([code]) => code);

    if (new Set(courseCodes).size !== courseCodes.length) {
      throw new Error("Duplicate course codes found in seed data.");
    }

    await client.query("BEGIN");
    transactionStarted = true;

    for (const [courseCode, courseName] of courses) {
      await client.query(
        `INSERT INTO public.courses (
           course_code,
           course_name
         )
         VALUES ($1, $2)
         ON CONFLICT (course_code)
         DO UPDATE SET
           course_name = EXCLUDED.course_name`,
        [courseCode, courseName]
      );

      console.log(`Seeded: ${courseCode} - ${courseName}`);
    }

    await client.query("COMMIT");
    transactionStarted = false;

    console.log(
      `\nSuccessfully seeded ${courses.length} course entries.`
    );
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    console.error("Course seeding failed.");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedCourses();