
"use client";

import { useEffect, useMemo } from "react";
import { ChevronDown, Filter } from "lucide-react";
import useTeacherStore from "@/store/useTeacherStore";

const ASSESSMENTS = [
  { value: "pre-mse", label: "Pre-MSE" },
  { value: "mse-1", label: "MSE-1" },
  { value: "mse-2", label: "MSE-2" },
  { value: "ese", label: "ESE" },
];

const CATEGORIES = [
  { value: "Gradual", label: "Gradual" },
  { value: "Growing", label: "Growing" },
  { value: "Gallant", label: "Gallant" },
];

const unique = (values) => [
  ...new Set(
    values.filter(
      (value) => value != null && String(value).trim() !== ""
    )
  ),
];

function SelectField({ label, options, value, onChange }) {
  return (
    <label className="min-w-0 text-[11px] font-medium text-[#52627A]">
      <span className="mb-1 block">{label}</span>

      <span className="relative block">
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={options.length === 0}
          className="h-9 w-full appearance-none rounded-md border border-[#DCE3EC] bg-white px-2.5 pr-8 text-xs text-[#253B59] outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          {options.length === 0 && (
            <option value="">No options available</option>
          )}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71809A]"
        />
      </span>
    </label>
  );
}

export default function ActionFilters({ filters, setFilters }) {
  const program = useTeacherStore((state) => state.program);
  const assignedCourses = useTeacherStore(
    (state) => state.assignedCourses
  );

  const courseRecords = assignedCourses ?? [];

  // Program options come from the teacher's actual assignments.
  const programs = useMemo(() => {
    const values = unique(
      courseRecords.map((course) => course.program)
    );

    if (program && !values.includes(program)) {
      values.unshift(program);
    }

    return values.map((value) => ({
      value,
      label: value,
    }));
  }, [courseRecords, program]);

  // Prefer the teacher's assigned program.
  const activeProgram =
    programs.some((option) => option.value === filters.program)
      ? filters.program
      : programs.some((option) => option.value === program)
        ? program
        : programs[0]?.value ?? "";

  const semesters = useMemo(() => {
    return unique(
      courseRecords
        .filter((course) => course.program === activeProgram)
        .map((course) => String(course.semester))
    )
      .sort((a, b) => Number(a) - Number(b))
      .map((value) => ({
        value,
        label: `Semester ${value}`,
      }));
  }, [courseRecords, activeProgram]);

  const activeSemester = semesters.some(
    (option) => option.value === String(filters.semester ?? "")
  )
    ? String(filters.semester)
    : semesters[0]?.value ?? "";

  // Use assigned course codes as option values.
  // Deduplicate courses in case the same course is assigned
  // to more than one section.
  const courses = useMemo(() => {
    const seen = new Set();

    return courseRecords
      .filter(
        (course) =>
          course.program === activeProgram &&
          String(course.semester) === activeSemester
      )
      .filter((course) => {
        const code = course.course_code;

        if (!code || seen.has(String(code))) {
          return false;
        }

        seen.add(String(code));
        return true;
      })
      .map((course) => ({
        value: String(course.course_code),
        label: course.course,
      }));
  }, [courseRecords, activeProgram, activeSemester]);

  const activeCourse = courses.some(
    (option) => option.value === String(filters.courses ?? "")
  )
    ? String(filters.courses)
    : courses[0]?.value ?? "";

  const isFirstSemester = Number(activeSemester) === 1;

  const assessments = isFirstSemester
    ? ASSESSMENTS.filter((item) => item.value !== "pre-mse")
    : ASSESSMENTS;

  // Apply defaults and clear invalid dependent selections.
  // One state update avoids several competing setFilters calls.
  useEffect(() => {
    const current = filters ?? {};

    const validAssessment = assessments.some(
      (option) => option.value === current.assessment
    )
      ? current.assessment
      : assessments[0]?.value ?? "";

    const validCategory = CATEGORIES.some(
      (option) => option.value === current.category3G
    )
      ? current.category3G
      : CATEGORIES[0]?.value ?? "";

    const next = {
      ...current,
      program: activeProgram,
      semester: activeSemester,
      courses: activeCourse,
      courseName:
        courses.find((option) => option.value === activeCourse)?.label ?? "",
      assessment: validAssessment,
      category3G: validCategory,
    };

    const changed = Object.keys(next).some(
      (key) => String(current[key] ?? "") !== String(next[key] ?? "")
    );

    if (changed) {
      setFilters(next);
    }
  }, [
    filters,
    setFilters,
    activeProgram,
    activeSemester,
    activeCourse,
    courses,
    assessments,
  ]);

  const updateFilter = (key, value) => {
    const current = filters ?? {};

    if (key === "program") {
      const nextSemester = unique(
        courseRecords
          .filter((course) => course.program === value)
          .map((course) => String(course.semester))
      ).sort((a, b) => Number(a) - Number(b))[0] ?? "";

      const nextCourse = courseRecords.find(
        (course) =>
          course.program === value &&
          String(course.semester) === nextSemester &&
          course.course_code
      );

      const nextIsFirstSemester = Number(nextSemester) === 1;
      const nextAssessment = nextIsFirstSemester ? "mse-1" : "pre-mse";

      setFilters({
        ...current,
        program: value,
        semester: nextSemester,
        courses: nextCourse ? String(nextCourse.course_code) : "",
        courseName: nextCourse?.course ?? "",
        assessment: nextAssessment,
        category3G: CATEGORIES[0]?.value ?? "",
      });

      return;
    }

    if (key === "semester") {
      const nextCourse = courseRecords.find(
        (course) =>
          course.program === activeProgram &&
          String(course.semester) === value &&
          course.course_code
      );

      const nextAssessment =
        Number(value) === 1 ? "mse-1" : "pre-mse";

      setFilters({
        ...current,
        semester: value,
        courses: nextCourse ? String(nextCourse.course_code) : "",
        courseName: nextCourse?.course ?? "",
        assessment: nextAssessment,
        category3G: CATEGORIES[0]?.value ?? "",
      });

      return;
    }

    if (key === "courses") {
      setFilters({
        ...current,
        courses: value,
        courseName:
          courses.find((option) => option.value === value)?.label ?? "",
      });

      return;
    }

    setFilters({
      ...current,
      [key]: value,
    });
  };

  const fields = [
    {
      key: "program",
      label: "Program",
      options: programs,
      value: activeProgram,
    },
    {
      key: "semester",
      label: "Semester",
      options: semesters,
      value: activeSemester,
    },
    {
      key: "courses",
      label: "Assigned course",
      options: courses,
      value: activeCourse,
    },
    {
      key: "assessment",
      label: "Assessment type",
      options: assessments,
      value: filters.assessment ?? "",
    },
    {
      key: "category3G",
      label: "3G category",
      options: CATEGORIES,
      value: filters.category3G ?? "",
    },
  ];

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#102746]">
        <Filter size={15} className="text-[#2563EB]" />
        Filters
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map((field) => (
          <SelectField
            key={field.key}
            label={field.label}
            options={field.options}
            value={field.value}
            onChange={(value) => updateFilter(field.key, value)}
          />
        ))}
      </div>
    </section>
  );
}
