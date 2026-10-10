const AttentionContext = ({ student, onViewDetails }) => {
  if (!student) {
    return (
      <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#17315A]">
          Attention context
        </h2>
        <p className="mt-3 text-xs text-[#7183A3]">
          Select a student to view their attention context.
        </p>
      </section>
    );
  }

  const {
    name,
    rollNo,
    className,
    attendance,
    assessment,
    marks,
    faculty = "Prof. Harsh Sharma",
    previousSemesterStatus,
    lastReview,
    reviewStatus,
    riskLevel = "High",
    warningSignals = [],
  } = student;

  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
      <h2 className="text-sm font-semibold text-[#17315A]">
        Attention context · {name}
      </h2>

      <p className="mt-3 text-[11px] text-[#7183A3]">
        Roll {rollNo} · {className} · Faculty: {faculty}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-500">
          • {riskLevel}
        </span>

        <span className="rounded-md bg-red-50 px-2 py-1 text-[9px] font-medium text-red-500">
          • {assessment}
        </span>
      </div>

      <div className="mt-4 space-y-4 text-[11px]">
        <div>
          <h3 className="font-semibold text-[#172B4D]">
            {warningSignals.length || 3} concurrent warning signals
          </h3>

          <p className="mt-1 leading-relaxed text-[#7183A3]">
            {warningSignals.length > 0
              ? warningSignals.join("; ")
              : `${marks ?? "N/A"}% marks against 40% pass threshold; ${attendance}% attendance against 75%; performance trend needs review.`}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-[#172B4D]">
            Previous semester status
          </h3>

          <p className="mt-1 leading-relaxed text-[#7183A3]">
            {previousSemesterStatus ??
              "No previous-semester information available."}
          </p>
        </div>

        <p className="text-[#7183A3]">
          Last review: {lastReview ?? "Not reviewed"}
          {reviewStatus ? ` · ${reviewStatus}` : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails?.(student)}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#E2E8F0] px-3 py-2 text-[10px] font-semibold text-[#17315A] transition hover:bg-slate-50"
      >
        View Student Detail
      </button>
    </section>
  );
};

export default AttentionContext;
