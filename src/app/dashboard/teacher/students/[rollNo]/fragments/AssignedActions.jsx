
"use client";

import { useState } from "react";

const AssignedActions = ({
  actions = [],
  onViewAll,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleActions = showAll
    ? actions
    : actions.slice(0, 2);

  return (
    <section className="min-w-0 rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h2 className="text-base font-semibold text-[#20375D]">
        Assigned actions
      </h2>

      <div className="mt-3 space-y-4">
        {visibleActions.length === 0 && (
          <p className="text-xs text-slate-500">No actions are assigned for this course.</p>
        )}
        {visibleActions.map((action) => (
          <div key={action.id}>
            <p className="text-xs font-semibold text-[#20375D]">
              {action.title} · {action.status}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-[#7183A3]">
              {action.subject}
              {action.category ? ` · ${action.category}` : ""}
              {action.dueDate ? ` · Due ${action.dueDate}` : ""}
              {action.description ? ` · ${action.description}` : ""}
            </p>
          </div>
        ))}
      </div>

      {actions.length > 2 && (
        <button
          type="button"
          onClick={() => {
            setShowAll((prev) => !prev);
            onViewAll?.();
          }}
          className="mt-4 text-[12px] font-medium text-[#2563EB] hover:underline"
        >
          {showAll
            ? "Show less"
            : `View all ${actions.length} actions`}
        </button>
      )}
    </section>
  );
};

export default AssignedActions;
