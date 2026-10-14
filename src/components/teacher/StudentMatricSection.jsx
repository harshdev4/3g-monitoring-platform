"use client";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import useTeacherStore from "@/store/useTeacherStore";
import MetricCards from "./MetricCards";

const StudentMatricSection = () => {
    const students = useFilterStudentsStore((state) => state.students);
    
    const filters = useTeacherStore((state) => state.filters);
    const metrics = [
        {
            type: "students",
            label: "Total students",
            value: students.length,
            description: `${filters.className} ${filters.assessment.toUpperCase()}`,
            iconClassName: "text-[#2563EB]",
        },
        {
            type: "gradual",
            label: "Gradual",
            value: students.filter((student) => student.three_g_category == "Gradual").length,
            description: `${(students.filter((student) => student.three_g_category == "Gradual").length / students.length * 100).toFixed(0)}% need support`,
            iconClassName: "text-[#EF4444]",
        },
        {
            type: "growing",
            label: "Growing",
            value: students.filter((student) => student.three_g_category == "Growing").length,
            description: `${(students.filter((student) => student.three_g_category == "Growing").length / students.length * 100).toFixed(0)}% showing progress`,
            iconClassName: "text-[#F59E0B]",
        },
        {
            type: "gallant",
            label: "Gallant",
            value: students.filter((student) => student.three_g_category == "Gallant").length,
            description: `${(students.filter((student) => student.three_g_category == "Gallant").length / students.length * 100).toFixed(0)}% top performers`,
            iconClassName: "text-[#10B981]",
        },
    ];
    return (
       <MetricCards metrics={metrics} />
    );
};

export default StudentMatricSection;