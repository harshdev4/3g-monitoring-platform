import pool from "@/config/db.config";
import useUserStore from "@/store/useUserStore";

const getUser = async (mailId) => {
    let result = await pool.query(
        `SELECT * FROM users WHERE mail_id=$1`,
        [mailId]
    )

    const user = result.rows[0];

    if (!user) {
        return null
    }

    let activeUser = {};

    if (user.role == 'teacher') {
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