import pool from "@/config/db.config";

const getAssignedCourses = async (empId) => {

    const result = await pool.query(
        `SELECT c.course_name, c.course_code, ac.section, ac.semester FROM assigned_courses ac JOIN courses c ON 
        ac.course_id = c.course_code WHERE ac.emp_id=$1`, [empId]
    );

    if (!result.rows[0]) return null;
    
    return result.rows.map((data) => ({
        program: "MCA",
        semester: data.semester,
        className: "MCA-" + data.section,
        course: data.course_name,
        course_code: data.course_code
    }))
};

export default getAssignedCourses;