
"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import useTeacherStore from "@/store/useTeacherStore";


const assessments = [
  { value: "pre-mse", label: "Pre-MSE" },
  { value: "mse-1", label: "MSE-1" },
  { value: "mse-2", label: "MSE-2" },
  { value: "ese", label: "ESE" },
];

const DashboardFilters = ({ assignedCourses = [] }) => {
  const program = useTeacherStore((state) => state.program);

  const storedCourses = useTeacherStore(
    (state) => state.assignedCourses
  );

  const setAssignedCourses = useTeacherStore(
    (state) => state.setAssignedCourses
  );

  const filters = useTeacherStore((state) => state.filters);
  const setFilters = useTeacherStore((state) => state.setFilters);

  useEffect(() => {
    if (assignedCourses.length > 0)
      setAssignedCourses(assignedCourses);
  }, [assignedCourses, setAssignedCourses]);

  useEffect(() => {
    if (program && filters.program !== program) {
      setFilters({
        program,
        semester: "",
        className: "",
        courses: "",
      });
    }
  }, [program, filters.program, setFilters]);

  const unique = (values) =>
    [...new Set(values.filter((value) => value != null && value !== ""))];

  const programs = program
    ? [{ value: program, label: program }]
    : [];

  const semesters = unique(
    storedCourses
      .filter((course) => course.program === filters.program)
      .map((course) => course.semester)
  ).map((value) => ({
    value: String(value),
    label: `Semester ${value}`,
  }));

  const classes = unique(
    storedCourses
      .filter(
        (course) =>
          course.program === filters.program &&
          String(course.semester) === String(filters.semester)
      )
      .map((course) => course.className)
  ).map((value) => ({
    value,
    label: value,
  }));

  const courses = unique(
    storedCourses
      .filter(
        (course) =>
          course.program === filters.program &&
          String(course.semester) === String(filters.semester) &&
          course.className === filters.className
      )
      .map((course) => ({ value: course.course_code, label: course.course })));
  

  const updateFilter = (key, value) => {
    if (key === "program") {
      setFilters({
        program: value,
        semester: "",
        className: "",
        courses: "",
      });
    } else if (key === "semester") {
      setFilters({
        semester: value,
        className: "",
        courses: "",
      });
    } else if (key === "className") {
      setFilters({
        className: value,
        courses: "",
      });
    } else {
      setFilters({ [key]: value });
    }
  };

  const fields = [
    { key: "program", label: "Program", options: programs },
    { key: "semester", label: "Semester", options: semesters },
    { key: "className", label: "Class", options: classes },
    { key: "courses", label: "Courses", options: courses },
    { key: "assessment", label: "Assessment", options: assessments },
  ];


  return (
    <section className="mt-3 rounded-md border border-[#E5EAF1] bg-white p-3 font-inter">
      <p className="mb-2 text-[13px] font-medium text-[#102746]">
        Filters
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map((filter) => (
          <div key={filter.key} className="min-w-0">
            <label
              htmlFor={`filter-${filter.key}`}
              className="mb-1 block text-[11px] font-medium text-[#52627A]"
            >
              {filter.label}
            </label>

            <div className="relative w-full lg:max-w-32">
              <select
                id={`filter-${filter.key}`}
                value={filters[filter.key] ?? ""}
                onChange={(event) =>
                  updateFilter(filter.key, event.target.value)
                }
                className="h-8 w-full appearance-none rounded border border-[#DCE3EC] bg-white px-2 pr-7 text-[12px] text-[#253B59] outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
              >
                <option value="">
                  Select {filter.label}
                </option>

                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={12}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#71809A]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashboardFilters;
