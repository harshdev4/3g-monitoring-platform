"use client";

import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import useTeacherStore from "@/store/useTeacherStore";
import {
  Users,
  UserRoundX,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const iconMap = {
  students: Users,
  risk: UserRoundX,
  growing: TrendingUp,
  stable: ShieldCheck,
};

const MetricCards = () => {
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
      description: `${(students.filter((student) => student.three_g_category == "Gradual").length/students.length * 100).toFixed(0)}% need support`,
      iconClassName: "text-[#EF4444]",
    },
    {
      type: "growing",
      label: "Growing",
      value: students.filter((student) => student.three_g_category == "Growing").length,
      description: `${(students.filter((student) => student.three_g_category == "Growing").length/students.length * 100).toFixed(0)}% showing progress`,
      iconClassName: "text-[#F59E0B]",
    },
    {
      type: "gallant",
      label: "Gallant",
      value: students.filter((student) => student.three_g_category == "Gallant").length,
      description: `${(students.filter((student) => student.three_g_category == "Gallant").length/students.length * 100).toFixed(0)}% top performers`,
      iconClassName: "text-[#10B981]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon =  iconMap[metric?.type] || Users;

        return (
          <div
            key={metric.label}
            className="rounded-lg border border-[#E5EAF1] bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-[#60708A]">
                {metric.label}
              </p>
              {metric?.type && 
              <Icon
                size={16}
                strokeWidth={1.8}
                className={metric?.iconClassName}
              />}
            </div>

            <p className="mt-2 text-2xl font-semibold leading-none text-[#102746]">
              {metric.value}
            </p>

            <p className="mt-2 text-xs text-[#71809A]">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;