
const AttendanceSummary = ({
  subject,
  attended,
  total,
  minimumRequired,
  recentAttended,
  recentTotal,
  followUpDate,
  onViewRecord,
}) => {
  const attendance = Math.round((attended / total) * 100);
  const missed = total - attended;

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h2 className="text-base font-semibold text-[#20375D]">
        Attendance summary
      </h2>

      <div className="mt-3">
        <p className="text-[13px] font-semibold text-[#20375D]">
          {subject} · {attended} / {total} sessions attended
        </p>

        <p className="mt-1 text-[12px] leading-4 text-[#7183A3]">
          {missed} missed sessions · {attendance}% attendance · minimum
          required {minimumRequired}%.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-[13px] font-semibold text-[#20375D]">
          Recent attendance · {recentAttended} / {recentTotal} sessions
        </p>

        <p className="mt-1 text-[12px] leading-4 text-[#7183A3]">
          Faculty follow-up scheduled for {followUpDate}. Check attendance
          weekly.
        </p>
      </div>

      <button
        type="button"
        onClick={onViewRecord}
        className="mt-4 rounded-md border border-[#E1E7F0] bg-white px-3 py-2 text-[12px] font-semibold  text-[#20375D] hover:bg-[#F7F9FC]"
      >
        View attendance record
      </button>
    </section>
  );
};

export default AttendanceSummary;
