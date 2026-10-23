const AttendanceSummary = ({ subject, attendance }) => {
  const attendanceAvailable =
    attendance !== null &&
    attendance !== undefined &&
    attendance !== "" &&
    Number.isFinite(Number(attendance));

  const percentage = attendanceAvailable
    ? Number(attendance)
    : null;

  const meetsMinimum =
    percentage !== null && percentage >= 75;

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h2 className="text-base font-semibold text-[#20375D]">
        Attendance Summary
      </h2>

      <p className="mt-1 text-xs text-[#7183A3]">
        Subject-wise attendance overview
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#20375D]">
            {subject}
          </p>

          <p className="text-lg font-semibold text-[#20375D]">
            {percentage !== null ? `${percentage.toFixed(1)}%` : "N/A"}
          </p>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#EEF2F7]">
          <div
            className={`h-full rounded-full ${
              meetsMinimum ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, percentage ?? 0))}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-[#7183A3]">
          {percentage === null
            ? "Attendance data is unavailable."
            : meetsMinimum
              ? "Meets the minimum attendance requirement of 75%."
              : "Below the minimum attendance requirement of 75%."}
        </p>
      </div>
    </section>
  );
};

export default AttendanceSummary;