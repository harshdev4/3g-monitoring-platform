import pool from "@/config/db.config";

const getUser = async (identifier) => {
    if (!identifier) return null;

    let result = await pool.query(
        `SELECT u.*
         FROM users u
         LEFT JOIN teachers t ON t.user_id = u.unique_id
         WHERE LOWER(u.mail_id) = LOWER($1) OR t.emp_id = $1
         LIMIT 1`,
        [identifier.trim()]
    )

    const user = result.rows[0];

    if (!user) {
        return null
    }

    let activeUser = {};

    if (user.role == 'teacher' || user.role == 'dean') {
        result = await pool.query(
            `SELECT t.emp_id, d.dept_name, t.designation FROM teachers t JOIN departments d ON t.dept_code = d.dept_code WHERE t.user_id=$1`, [user.unique_id]
        );
        const teacher = result.rows[0];
        if (!teacher) {
            return null
        }

        activeUser = {
            empId: teacher.emp_id,
            role: user.role,
            prefix: user.prefix,
            name: user.name,
            dept: teacher.dept_name,
            program: "MCA",
            mail: user.mail_id,
            designation: teacher.designation
        };

    }
    

    return activeUser;
};

export default getUser;
