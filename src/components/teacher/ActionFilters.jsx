"use client";

import { ChevronDown, Filter } from "lucide-react";
import useTeacherStore from "@/store/useTeacherStore";

const baseAssessments = [
  { value: "All assessments", label: "All assessments" },
  { value: "Pre-MSE", label: "Pre-MSE" },
  { value: "MSE-1", label: "MSE-1" },
  { value: "MSE-2", label: "MSE-2" },
  { value: "ESE", label: "ESE" },
];

function SelectField({ label, options, value, onChange }) {
  return (
    <label className="min-w-0 text-[11px] font-medium text-[#52627A]">
      <span className="mb-1 block">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={onChange}
          className="h-9 w-full appearance-none rounded-md border border-[#DCE3EC] bg-white px-2.5 pr-8 text-xs text-[#253B59] outline-none focus:border-[#2563EB]"
        >
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
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
  // Read semester from global store to hide Pre-MSE for 1st sem
  const globalFilters = useTeacherStore((state) => state.filters);
  const isFirstSemester = String(globalFilters?.semester) === "1";

  const assessments = isFirstSemester
    ? baseAssessments.filter((a) => a.value !== "Pre-MSE")
    : baseAssessments;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#102746]">
        <Filter size={15} className="text-[#2563EB]" />
        Filters
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SelectField
          label="Class / Section"
          value={filters.classSection}
          onChange={(e) => updateFilter("classSection", e.target.value)}
          options={["All assigned classes", "MCA-1A", "MCA-1B"]}
        />
        <SelectField
          label="Subject"
          value={filters.subject}
          onChange={(e) => updateFilter("subject", e.target.value)}
          options={["All subjects", "DBMS", "DAA", "Operating Systems"]}
        />
        <SelectField
          label="3G category"
          value={filters.category3G}
          onChange={(e) => updateFilter("category3G", e.target.value)}
          options={["All categories", "Gradual", "Growing", "Gallant"]}
        />
        <SelectField
          label="Assessment"
          value={filters.assessment}
          onChange={(e) => updateFilter("assessment", e.target.value)}
          options={assessments}
        />
        <SelectField
          label="Due date"
          value={filters.dueDate}
          onChange={(e) => updateFilter("dueDate", e.target.value)}
          options={["All dates", "Overdue", "Due this week", "Upcoming"]}
        />
      </div>
    </section>
  );
}