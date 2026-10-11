
"use client";

import { useState } from "react";
import { X } from "lucide-react";

const TeacherObservations = ({
  lastUpdated,
  observationTitle,
  description,
  onAddObservation,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  // Keep all observations in an array.
  const [observations, setObservations] = useState(() => [
    {
      id: 1,
      title: observationTitle,
      description,
      date: lastUpdated,
    },
  ]);

  const handleSave = (event) => {
    event.preventDefault();

    if (!title.trim() || !details.trim()) return;

    const newObservation = {
      id: Date.now(),
      title: title.trim(),
      description: details.trim(),
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    // Append the new observation without removing existing ones.
    setObservations((previous) => [...previous, newObservation]);

    onAddObservation?.(newObservation);

    setTitle("");
    setDetails("");
    setIsModalOpen(false);
  };

  const latestDate =
    observations[observations.length - 1]?.date || lastUpdated;

  return (
    <>
      <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
        <h2 className="text-base font-semibold text-[#20375D]">
          Teacher observations
        </h2>
        {/* Display every observation */}
        <div className="mt-2 space-y-4">
          {observations.map((item) => (
            <article
              key={item.id}
              className="border-b border-[#EEF1F5] pb-3 last:border-0 last:pb-0"
            >
              <h3 className="text-[14px] font-semibold text-[#20375D]">
                {item.title}
              </h3>

              <p className="mt-1 whitespace-pre-wrap text-[12px] leading-5 text-[#7183A3]">
                {item.description}
              </p>

              {item.date && (
                <p className="mt-1 text-[10px] text-[#94A3B8]">
                  {item.date}
                </p>
              )}
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md border border-[#E1E7F0] bg-white px-3 py-2 text-[12px] font-semibold text-[#20375D] hover:bg-[#F7F9FC]"
          >
            Add observation
          </button>

        </div>
      </section>

      {/* Add observation modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="observation-modal-title"
            className="w-full max-w-lg rounded-xl border border-[#E5EAF1] bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="observation-modal-title"
                className="text-lg font-semibold text-[#20375D]"
              >
                Add observation
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="rounded-md p-2 text-[#7183A3] hover:bg-[#F1F5F9]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-1 text-xs text-[#7183A3]">
              Record an academic observation for this student.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="observation-title"
                  className="mb-1.5 block text-xs font-medium text-[#20375D]"
                >
                  Observation title
                </label>

                <input
                  id="observation-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Focus on SQL joins"
                  maxLength={120}
                  required
                  className="w-full rounded-md border border-[#DCE3ED] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="observation-details"
                  className="mb-1.5 block text-xs font-medium text-[#20375D]"
                >
                  Observation details
                </label>

                <textarea
                  id="observation-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Describe progress, concerns, or recommended support..."
                  rows={4}
                  maxLength={1000}
                  required
                  className="w-full resize-y rounded-md border border-[#DCE3ED] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#EEF1F5] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-[#E1E7F0] px-4 py-2 text-xs font-semibold text-[#20375D] hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Save observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherObservations;
