import getDashboardStudents from "@/lib/getDashboardStudents";
import StudentsTable from "@/components/teacher/StudentsTable";

export default async function StudentsPage({ searchParams }) {
    const params = await searchParams;
    const page = Math.max(1, Number(params?.page) || 1);

    // Obtain these from your actual filter/session setup.
    const filter = {
        semester: 3,
        className: "MCA-B",
        subject: "CA301P",
        assessment: "mse-1",
    };

    const result = await getDashboardStudents(filter, page, 10);

    return (
        <StudentsTable
            students={result.students}
            pagination={result.pagination}
            subtitle="Student performance and attendance"
        />
    );
}