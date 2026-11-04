import pool from "@/config/db.config";

export async function getStudentProfileByEmail(email) {
  if (!email) return null;

  const { rows } = await pool.query(
    `SELECT
       u.name,
       u.mail_id,
       u.phone_number,
       u.prefix,
       s.university_roll_no,
       s.semester,
       s.section,
       s.program_name,
       s.academic_year,
       d.dept_name,
       category_record.category
     FROM public.users u
     JOIN public.students s ON s.user_id = u.unique_id
     JOIN public.departments d ON d.dept_code = s.dept_code
     LEFT JOIN LATERAL (
       SELECT sar.category
       FROM public.student_academic_records sar
       WHERE sar.student_id = s.university_roll_no
         AND sar.semester = s.semester
         AND sar.academic_year = s.academic_year
       ORDER BY sar.created_at DESC
       LIMIT 1
     ) category_record ON TRUE
     WHERE u.role = 'student'
       AND LOWER(u.mail_id) = LOWER($1)
     LIMIT 1`,
    [email.trim()]
  );

  return rows[0] ?? null;
}
