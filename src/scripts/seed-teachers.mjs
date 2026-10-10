import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Format: [employee ID, prefix, name, email, designation]
const teachers = [
  ["21763", "Dr.", "Sachin Malhotra", "sachin.malhotra@kiet.edu", "Dean"],
  ["3739", "Mr.", "Rabi.N Panda", "rn.panda@kiet.edu", "Prog. Head"],
  ["4495", "Dr.", "Amit Kr. Gupta", "amit.gupta@kiet.edu", "Professor"],
  ["3755", "Dr.", "Prashant Agrawal", "prashant.agarwal@kiet.edu", "Assoc. Prof"],
  ["6122", "Dr.", "Neelam Rawat", "neelam.rawat@kiet.edu", "Assoc. Prof"],
  ["6077", "Dr.", "Vipin Kumar", "vipin.kumar.mca@kiet.edu", "Professor"],
  ["7073", "Dr.", "Shashank Bhardwaj", "shashank.bhardwaj@kiet.edu", "Assoc. Prof"],
  ["9363", "Dr.", "Ankit Verma", "ankit.verma@kiet.edu", "Assoc. Prof"],
  ["21415", "Ms.", "Shweta Singh", "shweta.singh@kiet.edu", "Asst. Prof"],
  ["21521", "Ms.", "Annu Yadav", "annu.yadav@kiet.edu", "Asst. Prof"],
  ["21585", "Ms.", "Shruti Aggarwal", "shruti.aggarwal@kiet.edu", "Asst. Prof"],
  ["21758", "Mr.", "Saurabh Choudhary", "saurabh.choudhary@kiet.edu", "Asst. Prof"],
  ["21766", "Ms.", "Sonam Jain", "sonam.jain@kiet.edu", "Asst. Prof"],
  ["21775", "Ms.", "Mahima Tayal", "mahima.tayal@kiet.edu", "Asst. Prof"],
  ["21808", "Ms.", "Somashree Gorai", "somashree.gorai@kiet.edu", "Asst. Prof"],
  ["21803", "Mr.", "Vijay Kumar", "vijay.kumar@kiet.edu", "Asst. Prof"],
  ["21800", "Ms.", "Anita Yadav", "anita.yadav@kiet.edu", "Asst. Prof"],
  ["21854", "Ms.", "Riya Rai", "riya.rai@kiet.edu", "Asst. Prof"],
  ["21987", "Mr.", "Abhishek Sharma", "abhishek.sharma.mca@kiet.edu", "Asst. Prof"],
  ["21984", "Ms.", "Deepali Jain", "deepali.jain@kiet.edu", "Asst. Prof"],
  ["21990", "Ms.", "Monika Varshney", "monika.varshney@kiet.edu", "Asst. Prof"],
  ["22001", "Ms.", "Sakshi Goel", "sakshi.goel@kiet.edu", "Asst. Prof"],
  ["22000", "Mr.", "Hritik Sharma", "hritik.sharma@kiet.edu", "Asst. Prof"],
  ["22022", "Mr.", "Mukul Chauhan", "mukul.chauhan@kiet.edu", "Asst. Prof"],
];

async function seedTeachers() {
  let transactionStarted = false;

  try {
    await client.connect();
    console.log("Connected to Aiven PostgreSQL.");

    // Validate input data before changing the database.
    const employeeIds = teachers.map(([empId]) => empId);
    const emails = teachers.map(([, , , email]) => email.toLowerCase());

    if (new Set(employeeIds).size !== employeeIds.length) {
      throw new Error("Duplicate employee IDs found in seed data.");
    }

    if (new Set(emails).size !== emails.length) {
      throw new Error("Duplicate email addresses found in seed data.");
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Verify that the MCA department exists.
    const departmentResult = await client.query(
      `SELECT dept_code
       FROM public.departments
       WHERE dept_code = $1`,
      ["MCA"]
    );

    if (departmentResult.rowCount === 0) {
      throw new Error(
        'Department "MCA" was not found in public.departments.'
      );
    }

    for (const [empId, prefix, name, email, designation] of teachers) {
      const role = designation === "Dean" ? "dean" : "teacher";

      // Insert or update the user account.
      const userResult = await client.query(
        `INSERT INTO public.users (
           role,
           mail_id,
           phone_number,
           name,
           prefix
         )
         VALUES ($1, $2, NULL, $3, $4)
         ON CONFLICT (mail_id)
         DO UPDATE SET
           role = EXCLUDED.role,
           name = EXCLUDED.name,
           prefix = EXCLUDED.prefix
         RETURNING unique_id`,
        [role, email, name, prefix]
      );

      const userId = userResult.rows[0].unique_id;

      // Insert or update the teacher profile.
      await client.query(
        `INSERT INTO public.teachers (
           emp_id,
           user_id,
           dept_code,
           designation
         )
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (emp_id)
         DO UPDATE SET
           user_id = EXCLUDED.user_id,
           dept_code = EXCLUDED.dept_code,
           designation = EXCLUDED.designation`,
        [empId, userId, "MCA", designation]
      );

      console.log(`Seeded: ${prefix} ${name} (${empId})`);
    }

    await client.query("COMMIT");
    transactionStarted = false;

    console.log(
      `\nSuccessfully seeded ${teachers.length} faculty records.`
    );
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    console.error("Teacher seeding failed.");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedTeachers();