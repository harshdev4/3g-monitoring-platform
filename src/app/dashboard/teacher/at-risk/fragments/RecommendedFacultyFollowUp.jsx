import { Plus } from "lucide-react";

const recommendations = [
  {
    id: 1,
    title: "Review revised Mini-Q practice sheet",
    description:
      "Verify SQL joins and normalization corrections before marking the action Approved.",
  },
  {
    id: 2,
    title: "Continue remedial DBMS sessions",
    description:
      "Attendance / completion proof required · Due 12 Oct 2026.",
  },
  {
    id: 3,
    title: "Reassess at the next checkpoint",
    description:
      "Target ≥40% marks and ≥75% attendance; record observations after the follow-up.",
  },
];

const RecommendedFacultyFollowUp = ({
  student,
  onCreateAction,
}) => {
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
      <h2 className="text-base font-semibold text-[#17315A]">
        Recommended faculty follow-up
      </h2>

      <div className="mt-4 space-y-4">
        {recommendations.map((item) => (
          <div key={item.id}>
            <h3 className="text-xs font-semibold text-[#172B4D]">
              {item.id}. {item.title}
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-[#7183A3]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onCreateAction?.(student)}
        className="mt-4 inline-flex items-center gap-1 rounded-md bg-[#2864E8] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        <Plus size={16} />
        Create / Assign Action
      </button>
    </section>
  );
};

export default RecommendedFacultyFollowUp;
