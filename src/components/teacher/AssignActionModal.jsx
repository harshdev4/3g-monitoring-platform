"use client";

import { useEffect, useRef, useState, memo } from "react";
import { X } from "lucide-react";
import Pill from "@/components/teacher/Pill";

const CATEGORIES = ["Gradual", "Growing", "Gallant"];

const CATEGORY_HINTS = {
  Gradual: "Students who need support",
  Growing: "Students showing progress",
  Gallant: "Top performers",
};

const labelClass = "block text-[11px] font-medium text-[#52627A]";
const fieldClass =
  "mt-1 h-9 w-full rounded-md border border-[#DCE3EC] bg-white px-2.5 text-xs text-[#253B59] outline-none transition-colors focus:border-[#2563EB]";

// YYYY-MM-DD in the user's local timezone.
const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createInitialForm = (sections, subjects) => ({
  category: CATEGORIES[0],
  section: sections[0],
  subject: subjects[0],
  activity: "",
  evidence: "",
  due: "",
});

// Increased to 300ms to allow the custom cubic-bezier to feel smooth
const ANIMATION_MS = 300;

export default memo(function AssignActionModal({
  isOpen,
  sections,
  subjects,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(() => createInitialForm(sections, subjects));
  const [shouldRender, setShouldRender] = useState(Boolean(isOpen));
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef(null);

  // Keep the modal mounted during closing so the exit transition can finish.
  useEffect(() => {
    let firstFrame;
    let secondFrame;
    let closeTimer;

    if (isOpen) {
      setShouldRender(true);
      firstFrame = window.requestAnimationFrame(() => {
        // Two frames ensure the hidden starting styles have been painted.
        secondFrame = window.requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      closeTimer = window.setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_MS + 30);
    }

    return () => {
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      if (closeTimer) window.clearTimeout(closeTimer);
    };
  }, [isOpen]);

  // Lock page scrolling for the entire time the modal is rendered, including exit.
  useEffect(() => {
    if (!shouldRender) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldRender]);

  // Escape closes only an actively open modal, not one already animating out.
  useEffect(() => {
    if (!shouldRender || !isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, shouldRender, onClose]);

  useEffect(() => {
    if (isOpen && shouldRender) dialogRef.current?.focus();
  }, [isOpen, shouldRender]);

  // Reset the form on every opening, since the modal now stays mounted in its parent.
  useEffect(() => {
    if (isOpen) setForm(createInitialForm(sections, subjects));
  }, [isOpen, sections, subjects]);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  const audience =
    form.section === sections[0] &&
    sections[0].toLowerCase().startsWith("all")
      ? "all your sections"
      : form.section;

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop: Added backdrop-blur-sm and synced duration */}
      <div
        className={`absolute inset-0 bg-[#102746]/40 backdrop-blur-sm transition-all duration-300 ease-out motion-reduce:transition-none ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => {
          if (isOpen) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog: Added custom cubic-bezier for a spring-like snappy feel and slightly more pronounced scale/translate */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-action-title"
        tabIndex={-1}
        className={`relative flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[#E5EAF1] bg-white shadow-xl outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity] motion-reduce:transition-none ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.96] opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF1F5] px-5 py-4">
          <div>
            <h2
              id="assign-action-title"
              className="text-base font-semibold text-[#102746]"
            >
              Create / assign action
            </h2>
            <p className="mt-1 text-[11px] text-[#71809A]">
              Assigned to a 3G group, not to individual students.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-[#71809A] transition-colors hover:bg-[#F8FAFC] hover:text-[#102746]"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto p-5">
            <div>
              <span className={labelClass}>3G category</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Pill
                    key={category}
                    label={category}
                    active={form.category === category}
                    onClick={() =>
                      setForm((current) => ({ ...current, category }))
                    }
                    size="md"
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[#71809A]">
                {CATEGORY_HINTS[form.category]}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Class / Section
                <select
                  value={form.section}
                  onChange={update("section")}
                  className={fieldClass}
                >
                  {sections.map((section) => (
                    <option key={section}>{section}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Subject
                <select
                  value={form.subject}
                  onChange={update("subject")}
                  className={fieldClass}
                >
                  {subjects.map((subject) => (
                    <option key={subject}>{subject}</option>
                  ))}
                </select>
              </label>
            </div>

            <p className="rounded-md bg-[#F8FAFC] p-3 text-xs leading-5 text-[#52627A]">
              This action will be assigned to every{" "}
              <span className="font-semibold text-[#102746]">
                {form.category}
              </span>{" "}
              student in{" "}
              <span className="font-semibold text-[#102746]">{audience}</span>{" "}
              for{" "}
              <span className="font-semibold text-[#102746]">
                {form.subject}
              </span>
              .
            </p>

            <label className={labelClass}>
              Activity / action
              <input
                required
                value={form.activity}
                onChange={update("activity")}
                placeholder="e.g. Attend remedial DBMS classes"
                className={fieldClass}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Evidence required
                <input
                  required
                  value={form.evidence}
                  onChange={update("evidence")}
                  placeholder="e.g. Attendance / completion proof"
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Due date
                <input
                  required
                  type="date"
                  min={todayISO()}
                  value={form.due}
                  onChange={update("due")}
                  className={fieldClass}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#EEF1F5] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-[#DCE3EC] bg-white px-4 text-xs font-semibold text-[#52627A] transition-colors hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 rounded-md bg-[#2563EB] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Assign to {form.category} students
            </button>
          </div>
        </form>
      </div>
    </div>
  );
})