"use client";

import StudentsTable from "./StudentsTable";
import useTeacherStudents from "@/hooks/useTeacherStudents";

const StudentPageStudentTableSection = () => {
    const { students, loading, error, retry } = useTeacherStudents();

    return (
        <StudentsTable title={"My Students"} category="All" students={students} error={error} loading={loading} setRetryCount={retry} />
    );
};

export default StudentPageStudentTableSection;