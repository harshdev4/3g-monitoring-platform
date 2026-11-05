
"use client";

import { useState } from "react";

const EvidenceSubmissions = ({
  submissions = [],
  onViewAll,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleSubmissions = showAll
    ? submissions
    : submissions.slice(0, 2);

  return (
    <section className="min-w-0 rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h2 className="text-base font-semibold text-[#20375D]">
        Submissions
      </h2>

      <div className="mt-3 space-y-4">
        {visibleSubmissions.length === 0 && (
          <p className="text-xs text-slate-500">No evidence has been submitted for this course.</p>
        )}
        {visibleSubmissions.map((submission) => (
          <div key={submission.id}>
            <p className="break-words text-[13px] font-semibold text-[#20375D]">
              {submission.title} · {submission.status}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-[#7183A3]">
              {submission.date}
              {submission.description
                ? ` · ${submission.description}`
                : ""}
              {submission.version
                ? ` · ${submission.version}`
                : ""}
            </p>
            {submission.evidenceUrl && (
              <a
                href={submission.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-[11px] font-medium text-blue-600 hover:underline"
              >
                Open submitted evidence
              </a>
            )}
          </div>
        ))}
      </div>

      {submissions.length > 2 && (
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
            : `View ${submissions.length} submissions & review history`}
        </button>
      )}
    </section>
  );
};

export default EvidenceSubmissions;
