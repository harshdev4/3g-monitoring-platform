"use client";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import useTeacherStore from "@/store/useTeacherStore";
import MetricCards from "./MetricCards";

const AtRiskMetricSection = () => {
    const students = useFilterStudentsStore((state) => state.students);
    
    const filters = useTeacherStore((state) => state.filters);
    const percentageToMark = (obtained, percentage, maxMark) => {
        const obtainedMark = Number(obtained);
        const maximumMark = Number(maxMark);

        if (
            obtained == null ||
            maxMark == null ||
            !Number.isFinite(obtainedMark) ||
            !Number.isFinite(maximumMark) ||
            maximumMark <= 0
        ) {
            return false;
        }

        return obtainedMark < (percentage * maximumMark) / 100;
    };
    const metrics = [
        {
            type: "students",
            label: "Gradual students",
            value: students.filter(st => st.three_g_category == "Gradual").length,
            description: filters.courseName,
            iconClassName: "text-[#2563EB]",
        },
        {
            type: "marks",
            label: "Low marks",
            value: students.filter(st => percentageToMark(st.obtained_mark, 40, st.max_mark)).length,
            description: "Latest marks below 40%",
            iconClassName: "text-[#EF4444]",
        },
        {
            type: "attendance",
            label: "Low attendance",
            value: students.filter(st => st.attendance_pct < 75).length,
            description: "Attendance below 75%",
            iconClassName: "text-[#F59E0B]",
        },
        {
            type: "performance",
            label: "Declining performance",
            value: 12,
            description: "Drop of 5+ points since MSE-I",
            iconClassName: "text-[#10B981]",
        },
    ];
    return (
        <MetricCards metrics={metrics} />
    );
};

export default AtRiskMetricSection;