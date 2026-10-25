import pool from "@/config/db.config";

const getUser = async (identifier) => {
    if (!identifier) return null;

    const result = await pool.query(
        `SELECT u.*, t.emp_id, d.dept_name, t.designation
         FROM users u
         LEFT JOIN teachers t ON t.user_id = u.unique_id
         LEFT JOIN departments d ON d.dept_code = t.dept_code
         WHERE LOWER(u.mail_id) = LOWER($1) OR t.emp_id = $1
         LIMIT 1`,
        [identifier.trim()]
    );

    const user = result.rows[0];

    if (!user) {
        return null
    }

    if (user.role == 'teacher' || user.role == 'dean') {
        if (!user.emp_id || !user.dept_name) {
            return null
        }

        return {
            empId: user.emp_id,
            role: user.role,
            prefix: user.prefix,
            name: user.name,
            dept: user.dept_name,
            program: "MCA",
            mail: user.mail_id,
            designation: user.designation,
            phone: user.phone_number
        };
    }

    return {};
};

export default getUser;
