const RecommendedFacultyFollowUp = ({ onCreateAction }) => {
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
      <h2 className="text-base font-semibold text-[#17315A]">Next steps</h2>
      <p className="mt-2 text-xs leading-relaxed text-[#7183A3]">
        Review students marked Gradual or with low attendance, open their student
        detail pages, and assign an action using the selected course and assessment.
      </p>
      <button
        type="button"
        onClick={onCreateAction}
        className="mt-4 inline-flex items-center gap-1 rounded-md bg-[#2864E8] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        Open student actions
      </button>
    </section>
  );
};

export default RecommendedFacultyFollowUp;
