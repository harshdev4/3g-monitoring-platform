import { ChevronDown } from "lucide-react";

const DashboardFilters = () => {
  const filters = [
    {
      label: "Program",
      value: "MCA",
      options: ["MCA"],
    },
    {
      label: "Semester",
      value: "Semester 1",
      options: ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
    },
    {
      label: "Class",
      value: "MCA-A",
      options: ["MCA-A", "MCA-B"],
    },
    {
      label: "Subject",
      value: "DBMS",
      options: ["DBMS", "Operating Systems", "Computer Networks"],
    },
    {
      label: "Assessment",
      value: "MSE-1",
      options: ["MSE-1", "MSE-2", "End Semester"],
    },
  ];

  return (
    <section className="mt-3 rounded-md border border-[#E5EAF1] bg-white p-3 font-inter">
      <p className="mb-2 text-[13px] font-medium text-[#102746]">
        Filters
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {filters.map((filter) => (
          <div key={filter.label}>
            <label className="mb-1 block text-[11px] font-medium text-[#52627A]">
              {filter.label}
            </label>

            <div className="relative w-full lg:w-32">
              <select
                defaultValue={filter.value}
                className="h-7 w-full lg:w-32 appearance-none rounded border border-[#DCE3EC] bg-white px-2 pr-7 text-[12px] text-[#253B59] outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
              >
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
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