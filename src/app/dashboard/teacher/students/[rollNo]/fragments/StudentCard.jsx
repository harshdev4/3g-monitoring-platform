
const StudentCard = ({ student }) => {
  if (!student) return null;

  const initials = (student.name ?? "Student")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const rollNo = student.university_roll_no ?? student.rollNo ?? "—";
  const className =
    student.className ??
    (student.section ? `MCA-${student.section}` : "—");

  const assessment =
    student.three_g_category ?? student.assessment ?? "Not assessed";

  const assessmentStyle =
    assessment === "Gallant"
      ? "bg-[#E5F8EF] text-[#14965B]"
      : assessment === "Growing"
        ? "bg-[#FFF5DF] text-[#B77905]"
        : assessment === "Gradual"
          ? "bg-[#FFF0F0] text-[#E5484D]"
          : "bg-gray-100 text-gray-600";

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-3 sm:p-4">
      <h2 className="text-base font-semibold text-[#20375D]">
        Student profile
      </h2>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-base font-semibold text-[#2563EB]">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#20375D]">
            {student.name ?? "—"}
          </p>

          <p className="mt-1 text-xs text-[#7183A3]">
            {className} · Enrollment: {rollNo}
          </p>

          <p className="mt-1 break-words text-[11px] text-[#7183A3]">
            Semester {student.semester ?? "—"} · Previous SGPA: {student.previous_sgpa ?? "N/A"} · Backlog: {student.previous_record_id ? (student.backlog ? "Yes" : "No") : "N/A"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 sm:w-[120px]">
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium ${assessmentStyle}`}
          >
            • {assessment}
          </span>

          <p className="text-[11px] leading-4 text-[#7183A3]">
            Current assessment category
          </p>
        </div>
      </div>
    </section>
  );
};

export default StudentCard;
