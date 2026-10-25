"use client";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import useTeacherStore from "@/store/useTeacherStore";
import MetricCards from "./MetricCards";

const AtRiskMetricSection = () => {
    const students = useFilterStudentsStore((state) => state.students);
    const studentsWithAssessments = useFilterStudentsStore(
  (state) => state.studentsWithAssessments
);
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
            type: "",
            label: "Gradual students",
            value: students.filter(st => st.three_g_category == "Gradual").length,
            description: filters.courseName,
            iconClassName: "text-[#2563EB]",
        },
        {
            type: "",
            label: "Low marks",
            value: students.filter(st => percentageToMark(st.obtained_mark, 40, st.max_mark)).length,
            description: "Latest marks below 40%",
            iconClassName: "text-[#EF4444]",
        },
        {
            type: "",
            label: "Low attendance",
            value: students.filter(st =>
                st.attendance_pct != null &&
                st.attendance_pct !== "" &&
                Number.isFinite(Number(st.attendance_pct)) &&
                Number(st.attendance_pct) < 75
            ).length,
            description: "Attendance below 75%",
            iconClassName: "text-[#F59E0B]",
        },
    ];
    return (
        <MetricCards metrics={metrics} />
    );
};

export default AtRiskMetricSection;