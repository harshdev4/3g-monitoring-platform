
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Registration number, student name, section.
// All records are Semester III.
const students = [
  ["202510116100001", "AARINI GOEL", "A"],
  ["202510116100002", "AARYAN SHARMA", "A"],
  ["202510116100003", "ABHAY TYAGI", "A"],
  ["202510116100004", "ABHINAV TYAGI", "A"],
  ["202510116100005", "ABHINENDRA PRATAP SINGH", "A"],
  ["202510116100006", "ABHISHEK DUBEY", "A"],
  ["202510116100007", "ABHISHEK SUNDRIYAL", "A"],
  ["202510116100008", "ABHISHEK KUMAR", "A"],
  ["202510116100009", "ADARSH KATIYAR", "A"],
  ["202510116100010", "ADITI JAISWAL", "A"],
  ["202510116100011", "ADITYA GARG", "A"],
  ["202510116100012", "ADITYA RAJ JAISWAL", "A"],
  ["202510116100013", "ADNAN KHAN", "A"],
  ["202510116100014", "AKANKSHA DEVI", "A"],
  ["202510116100015", "AKANSHA", "A"],
  ["202510116100016", "AKHILESH KUMAR YADAV", "A"],
  ["202510116100017", "AKRITY GUPTA", "A"],
  ["202510116100018", "ALKA SINGH", "A"],
  ["202510116100019", "ALOK RAJ", "A"],
  ["202510116100020", "ALOK SINGH", "A"],
  ["202510116100021", "AMAN GOYAL", "A"],
  ["202510116100022", "AMAN PRAJAPATI", "A"],
  ["202510116100023", "AMAN RAWAT", "A"],
  ["202510116100024", "AMAN TYAGI", "A"],
  ["202510116100025", "AMAN VERMA", "A"],
  ["202510116100027", "ANANT KUMAR SINGH", "A"],
  ["202510116100028", "ANIKA", "A"],
  ["202510116100029", "ANIKA TYAGI", "A"],
  ["202510116100030", "ANIRUDH RASTOGI", "A"],
  ["202510116100031", "ANKIT DUBEY", "A"],
  ["202510116100032", "ANKIT KUMAR", "A"],
  ["202510116100033", "ANKIT PATHAK", "A"],
  ["202510116100034", "ANMOL CHOPRA", "A"],
  ["202510116100035", "ANMOL JAIN", "A"],
  ["202510116100036", "ANMOL SAXENA", "A"],
  ["202510116100037", "ANSH SINGHAL", "A"],
  ["202510116100038", "ANSHIKA PANWAR", "A"],
  ["202510116100039", "ANSHIKA SINGH", "A"],
  ["202510116100040", "ANSHIKA VARSHNEY", "A"],
  ["202510116100041", "ANURAG DHIMAN", "A"],
  ["202510116100042", "APARNAV TYAGI", "A"],
  ["202510116100043", "ARADHYA CHOUDHARY", "A"],
  ["202510116100044", "ARADHYA TYAGI", "A"],
  ["202510116100046", "ARCHIT KUMAR", "A"],
  ["202510116100047", "ARPAN TRIVEDI", "A"],
  ["202510116100048", "ARPIT SONI", "A"],
  ["202510116100049", "ARPIT SRIVASTAVA", "A"],
  ["202510116100050", "ARPIT TAYAL", "A"],
  ["202510116100051", "ARPIT TYAGI", "A"],
  ["202510116100052", "ARYA JAIN", "A"],
  ["202510116100053", "ARYAN AGARWAL", "A"],
  ["202510116100054", "ARYAN CHAUDHARY", "A"],
  ["202510116100055", "ARYAN CHAUHAN", "A"],
  ["202510116100056", "ASHUTOSH PANDEY", "A"],
  ["202510116100057", "ASHUTOSH SINGH", "A"],
  ["202510116100058", "ASHWANI", "A"],
  ["202510116100059", "AYUSH BHARDWAJ", "A"],
  ["202510116100060", "AYUSH KUMAR", "A"],
  ["202510116100061", "AYUSH TYAGI", "A"],
  ["202510116100062", "AYUSH KUMAR SRIVASTAVA", "A"],
  ["202510116100251", "ANAND CHANDRA", "A"],

  ["202510116100063", "AYUSHMAN SINGH", "B"],
  ["202510116100064", "BHANU SHARAN YADAV", "B"],
  ["202510116100065", "BHARGWI RAJ", "B"],
  ["202510116100066", "BHAVISHYA RAJ MISHRA", "B"],
  ["202510116100067", "BHAVYA", "B"],
  ["202510116100068", "BHAVYA TYAGI", "B"],
  ["202510116100069", "BHAWANA PATHAK", "B"],
  ["202510116100070", "BHAWNA GAUTAM", "B"],
  ["202510116100071", "BHUMI BHARDWAJ", "B"],
  ["202510116100072", "CHANDRA VIJAY SINGH", "B"],
  ["202510116100074", "DAZY", "B"],
  ["202510116100075", "DEEPAK", "B"],
  ["202510116100076", "DEEPAK SHARMA", "B"],
  ["202510116100077", "DEEPAK TYAGI", "B"],
  ["202510116100078", "DEEPALI GUPTA", "B"],
  ["202510116100079", "DEEPANSHI MISHRA", "B"],
  ["202510116100080", "DEEPANSHU", "B"],
  ["202510116100081", "DEEPIKA SHARMA", "B"],
  ["202510116100082", "DEV DEEP MISHRA", "B"],
  ["202510116100083", "DEVANSH BHARDWAJ", "B"],
  ["202510116100084", "DEVANSH GARG", "B"],
  ["202510116100085", "DEVANSH NARVARIYA", "B"],
  ["202510116100086", "DEVVANSH GUPTA", "B"],
  ["202510116100087", "DHRUV GOEL", "B"],
  ["202510116100088", "DHRUV MITTAL", "B"],
  ["202510116100089", "DIVYA JHA", "B"],
  ["202510116100090", "DIVYANSH SINGHAL", "B"],
  ["202510116100091", "EESHU BHARDWAJ", "B"],
  ["202510116100092", "ESHU YADAV", "B"],
  ["202510116100093", "FAISAL KHAN", "B"],
  ["202510116100094", "FAISAL KHAN", "B"],
  ["202510116100095", "GAGAN BANA", "B"],
  ["202510116100096", "GAURAV GUPTA", "B"],
  ["202510116100097", "GAURAV GUPTA", "B"],
  ["202510116100098", "GAURAV TYAGI", "B"],
  ["202510116100099", "GOVIND SHARMA", "B"],
  ["202510116100100", "GUNJAN SHARMA", "B"],
  ["202510116100101", "HARSH JOSHI", "B"],
  ["202510116100102", "HARSH TIWARI", "B"],
  ["202510116100103", "HARSH VERMA", "B"],
  ["202510116100104", "HARSHIT SAINI", "B"],
  ["202510116100105", "HEMANK KUMAR", "B"],
  ["202510116100106", "HEMANT SINGH", "B"],
  ["202510116100108", "HIMANSHU SRIVASTAVA", "B"],
  ["202510116100109", "ISHA SINGH", "B"],
  ["202510116100110", "ISHIKA TYAGI", "B"],
  ["202510116100111", "ISHITA PRAJAPATI", "B"],
  ["202510116100112", "JAGRITI GUPTA", "B"],
  ["202510116100113", "JATIN KUMAR", "B"],
  ["202510116100114", "KAJAL", "B"],
  ["202510116100115", "KAJAL SHARMA", "B"],
  ["202510116100116", "KALASH DIWANIYA", "B"],
  ["202510116100117", "KALI BAKSHI", "B"],
  ["202510116100118", "KAMLAKAR TIWARI", "B"],
  ["202510116100119", "KANHAIYA PAL", "B"],
  ["202510116100120", "KANUPRIYA GOEL", "B"],
  ["202510116100121", "KARTIK MADAN", "B"],
  ["202510116100122", "KASHIKA MAHESHWARI", "B"],
  ["202510116100123", "KAUSHAL KUMAR", "B"],
  ["202510116100124", "KAVITA", "B"],
  ["202510116100250", "KARMIK TYAGI", "B"],

  ["202510116100125", "KESHAV SHARMA", "C"],
  ["202510116100126", "KHUSHI CHAUHAN", "C"],
  ["202510116100127", "KHUSHI MOGHA", "C"],
  ["202510116100128", "KM. JAGRITI YADAV", "C"],
  ["202510116100129", "KOUSHALENDRA", "C"],
  ["202510116100130", "KRISHNA GARG", "C"],
  ["202510116100131", "KSHITIJ SINGH", "C"],
  ["202510116100132", "LAKSH TYAGI", "C"],
  ["202510116100133", "LALIT KUMAR", "C"],
  ["202510116100134", "MADHAV RAWAT", "C"],
  ["202510116100135", "MAHI TYAGI", "C"],
  ["202510116100136", "MANISH TOMAR", "C"],
  ["202510116100137", "MANSHA SHARMA", "C"],
  ["202510116100138", "MAYANK KUMAR", "C"],
  ["202510116100139", "MAYANK SHAKYA", "C"],
  ["202510116100140", "MAYANK SHARMA", "C"],
  ["202510116100141", "MILAN KHARI", "C"],
  ["202510116100142", "MOHD AATIR", "C"],
  ["202510116100143", "MOHD JUNAID", "C"],
  ["202510116100144", "MOHD AMAN", "C"],
  ["202510116100145", "MOHIT YADAV", "C"],
  ["202510116100146", "MONU KUMAR", "C"],
  ["202510116100147", "MUDASSAR QURAISHI", "C"],
  ["202510116100148", "NAMAN VARSHNEY", "C"],
  ["202510116100149", "NAVIKANT", "C"],
  ["202510116100150", "NEETI SINGHAL", "C"],
  ["202510116100151", "NEHA GUPTA", "C"],
  ["202510116100152", "NEHA SHARMA", "C"],
  ["202510116100153", "NIKHIL MITTAL", "C"],
  ["202510116100154", "NIMISH CHAUHAN", "C"],
  ["202510116100155", "NISHANT PAL", "C"],
  ["202510116100157", "NITIN SAINI", "C"],
  ["202510116100158", "PALAK TYAGI", "C"],
  ["202510116100159", "PIYUSH GARG", "C"],
  ["202510116100160", "PIYUSH UPADHYAY", "C"],
  ["202510116100161", "PRAFFUL GUPTA", "C"],
  ["202510116100162", "PRAGYA MISHRA", "C"],
  ["202510116100163", "PRAGYA TIWARI", "C"],
  ["202510116100164", "PRANAY MAHESHWARI", "C"],
  ["202510116100165", "PRASHANT KUMAR", "C"],
  ["202510116100166", "PRASHANT SHARMA", "C"],
  ["202510116100167", "PRASHANT KUMAR SINGH", "C"],
  ["202510116100168", "PRATEEK PAL", "C"],
  ["202510116100169", "PREETI", "C"],
  ["202510116100170", "PRINCE PAL", "C"],
  ["202510116100171", "PRITAM SINGH", "C"],
  ["202510116100172", "PRIYANSHU DUBEY", "C"],
  ["202510116100173", "PRIYANSHU SINGH", "C"],
  ["202510116100175", "RADWA FAKHRUDDIN", "C"],
  ["202510116100176", "RAGHAV", "C"],
  ["202510116100177", "RAHUL KUMAR", "C"],
  ["202510116100178", "RIDDHI AGGARWAL", "C"],
  ["202510116100179", "RIJUL JAIN", "C"],
  ["202510116100180", "RISHABH SAGAR", "C"],
  ["202510116100181", "RITIK CHANDELA", "C"],
  ["202510116100182", "RIYA KUMARI", "C"],
  ["202510116100183", "ROHINI CHAUDHARY", "C"],
  ["202510116100184", "RUCHIKA CHAUHAN", "C"],
  ["202510116100185", "RUDRANSH RAI", "C"],
  ["202510116100186", "SACHIN KUMAR", "C"],
  ["202510116100252", "KHUSHI CHAUDHARY", "C"],
  ["202510116100253", "NAMAN TYAGI", "C"],
  ["202510116100254", "PRIYANSHU CHAUDHARY", "C"],

  ["202510116100187", "SACHIN SONI", "D"],
  ["202510116100188", "SAKET ARUN TYAGI", "D"],
  ["202510116100189", "SAKSHI RAJPUT", "D"],
  ["202510116100190", "SAKSHI SINGH", "D"],
  ["202510116100191", "SALAUNI TYAGI", "D"],
  ["202510116100192", "SALONI KASHYAP", "D"],
  ["202510116100193", "SARTHAK SHARMA", "D"],
  ["202510116100194", "SATISH KUMAR", "D"],
  ["202510116100195", "SATYAM RANA", "D"],
  ["202510116100196", "SAURABH VERMA", "D"],
  ["202510116100197", "SHAILOVE SINGH", "D"],
  ["202510116100198", "SHANTANU DWIVEDI", "D"],
  ["202510116100199", "SHAQUIB HASSAN", "D"],
  ["202510116100200", "SHASHANK CHATURVEDI", "D"],
  ["202510116100201", "SHASHANK JAISWAL", "D"],
  ["202510116100202", "SHIJO ALEX", "D"],
  ["202510116100203", "SHIVAM", "D"],
  ["202510116100206", "SHIVANG UPADHYAY", "D"],
  ["202510116100207", "SHRADDHA KHATTAR", "D"],
  ["202510116100208", "SHREYANS SHARMA", "D"],
  ["202510116100209", "SHREYASH SHUKLA", "D"],
  ["202510116100210", "SHUBHAM AWASTHI", "D"],
  ["202510116100211", "SHUBHAM KUMAR", "D"],
  ["202510116100212", "SHUBHAM VERMA", "D"],
  ["202510116100213", "SHWETA KUMARI", "D"],
  ["202510116100214", "SMARTY TOMAR", "D"],
  ["202510116100215", "SNEHA AGARWAL", "D"],
  ["202510116100216", "SNEHA SINGH", "D"],
  ["202510116100217", "SOMIL SINGH", "D"],
  ["202510116100218", "SONIYA YADAV", "D"],
  ["202510116100219", "SUJAL", "D"],
  ["202510116100220", "SUJAL", "D"],
  ["202510116100221", "SUKANYA RANA", "D"],
  ["202510116100222", "SUMIT SHARMA", "D"],
  ["202510116100223", "SUNNY", "D"],
  ["202510116100224", "SWARNIM TYAGI", "D"],
  ["202510116100225", "TALIB SAIFI", "D"],
  ["202510116100226", "TANYA MAHESHWARI", "D"],
  ["202510116100227", "TARUN BHARDWAJ", "D"],
  ["202510116100228", "TARUN KUMAR POONIA", "D"],
  ["202510116100229", "TEJAS PATHAK", "D"],
  ["202510116100231", "TUSHAR SHALOT", "D"],
  ["202510116100232", "UJJAWAL TYAGI", "D"],
  ["202510116100233", "UJJVAL GUPTA", "D"],
  ["202510116100234", "UJJWAL MISHRA", "D"],
  ["202510116100235", "UJJWAL SHAHI", "D"],
  ["202510116100236", "UTTAM KUMAR", "D"],
  ["202510116100237", "VAIBHAV PANDEY", "D"],
  ["202510116100238", "VAIBHAW SINGH", "D"],
  ["202510116100239", "VAISHALI BHARDWAJ", "D"],
  ["202510116100240", "VANSH GARG", "D"],
  ["202510116100241", "VANSH MALIK", "D"],
  ["202510116100242", "VANSHIKA MITTAL", "D"],
  ["202510116100243", "VARNIKA SHARMA", "D"],
  ["202510116100245", "VIKASH KUMAR UPADHYAY", "D"],
  ["202510116100246", "VINIT SAINI", "D"],
  ["202510116100247", "VISHAKHA", "D"],
  ["202510116100248", "VISHAL KASHYAP", "D"],
  ["202510116100249", "VISHAL PANCHAL", "D"],
];

function makeEmail(roll, name) {
  const firstName = name
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  // Example pattern: first-name + registration-derived number.
  // The complete registration number keeps generated addresses unique.
  const suffix = roll.slice(-3, )

  return `${firstName}.25161${suffix}@kiet.edu`;
}

async function seedStudents() {
  try {
    await client.connect();
    console.log("Connected to Aiven PostgreSQL.");

    await client.query("BEGIN");

    // DESTRUCTIVE RESET:
    // Clears ALL users and students. CASCADE can also delete related
    // teacher accounts and other dependent records.
    await client.query(`
      TRUNCATE TABLE public.students, public.users
      RESTART IDENTITY CASCADE;
    `);

    console.log("Cleared users and students.");

    const emails = students.map(([roll, name]) => makeEmail(roll, name));

    if (new Set(students.map(([roll]) => roll)).size !== students.length) {
      throw new Error("Duplicate registration numbers found.");
    }

    if (new Set(emails).size !== students.length) {
      throw new Error("Generated email addresses are not unique.");
    }

    for (let i = 0; i < students.length; i++) {
      let [roll, name, section] = students[i];
      const email = emails[i];
      const nameArr = name.trim().split(" ");
      name = "";
      nameArr.forEach((s) => name += s.slice(0, 1) + s.slice(1, ).toLowerCase() + " ")
      name = name.trim();

      const userResult = await client.query(
        `
        INSERT INTO public.users (
          role,
          mail_id,
          phone_number,
          name
        )
        VALUES ('student', $1, NULL, $2)
        RETURNING unique_id;
        `,
        [email, name]
      );

      const userId = userResult.rows[0].unique_id;

      await client.query(
        `
        INSERT INTO public.students (
          university_roll_no,
          semester,
          section,
          user_id,
          program_name,
          dept_code,
          academic_year
        )
        VALUES ($1, 3, $2, $3, 'MCA', 'MCA', '2026-27');
        `,
        [roll, section, userId]
      );
    }

    const verification = await client.query(`
      SELECT
        (SELECT COUNT(*)::INTEGER FROM public.users) AS total_users,
        (SELECT COUNT(*)::INTEGER FROM public.students) AS total_students,
        (
          SELECT COUNT(*)::INTEGER
          FROM public.students
          WHERE semester = 3
            AND program_name = 'MCA'
            AND academic_year = '2026-27'
        ) AS semester_three_students;
    `);

    const counts = verification.rows[0];

    if (
      counts.total_users !== students.length ||
      counts.total_students !== students.length ||
      counts.semester_three_students !== students.length
    ) {
      throw new Error(`Validation failed: ${JSON.stringify(counts)}`);
    }

    const sectionCounts = await client.query(`
      SELECT section, COUNT(*)::INTEGER AS student_count
      FROM public.students
      WHERE semester = 3
        AND program_name = 'MCA'
        AND academic_year = '2026-27'
      GROUP BY section
      ORDER BY section;
    `);

    await client.query("COMMIT");

    console.log("Import completed successfully.");
    console.log("Expected records:", students.length);
    console.table(counts);
    console.table(sectionCounts.rows);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Import failed; transaction rolled back.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

seedStudents();
