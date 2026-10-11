
const StudentCard = ({ student }) => {
  if (!student) return null;

  const initials = student.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-3 sm:p-4">
      <h2 className="text-base font-semibold text-[#20375D]">
        Student profile
      </h2>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-base font-semibold text-[#2563EB]">
          {initials}
        </div>

        {/* Student information */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#20375D]">
            {student.name} · {student.department}
          </p>

          <p className="mt-1 text-xs text-[#7183A3]">
            {student.className} · Enrollment MCA/2026/{student.rollNo} ·
            Faculty: {student.faculty}
          </p>

          <p className="mt-1 break-words text-[11px] text-[#7183A3]">
            {student.email} · Previous semester: Not applicable — new admission
          </p>
        </div>

        {/* Assessment status */}
        <div className="flex shrink-0 flex-col items-start gap-1 sm:w-[100px]">
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              student.assessment === "Gallant"
                ? "bg-[#E5F8EF] text-[#14965B]"
                : student.assessment === "Growing"
                  ? "bg-[#FFF5DF] text-[#B77905]"
                  : "bg-[#FFF0F0] text-[#E5484D]"
            }`}
          >
            • {student.assessment}
          </span>

          <p className="text-[11px] leading-3 text-[#7183A3]">
            Current aggregate · MSE-I
          </p>
        </div>
      </div>
    </section>
  );
};

export default StudentCard;
