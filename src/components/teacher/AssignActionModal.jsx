"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  ASSESSMENTS,
  CATEGORIES,
  POLICY_ACTIONS,
} from "@/constants/threeGPolicy";

const CUSTOM = "__custom__";

const fieldClass =
  "h-9 w-full rounded-md border border-[#DCE3EC] bg-white px-3 text-xs outline-none focus:border-[#2563EB]";
const labelClass = "mb-1 block text-xs font-medium text-[#52627A]";

function OwnerBadge({ owner }) {
  const styles =
    owner === "Teacher"
      ? "bg-[#EEF4FF] text-[#2563EB]"
      : "bg-[#ECFDF5] text-[#059669]";
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${styles}`}
    >
      {owner}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function ChoiceRow({ selected, onClick, children }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs ${
        selected
          ? "border-[#2563EB] bg-[#EEF4FF] text-[#102746]"
          : "border-[#E5EAF1] bg-white text-[#334155] hover:bg-[#F8FAFC]"
      }`}
    >
      {children}
    </button>
  );
}

// Mounted only while the modal is open, so the form resets every time.
function Form({ sections, subjects, onSubmit, onClose }) {
  const [category, setCategory] = useState("");
  const [choice, setChoice] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [performedBy, setPerformedBy] = useState("Student");
  const [section, setSection] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [evidence, setEvidence] = useState("");
  const [steps, setSteps] = useState(1);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const policyActions = category ? POLICY_ACTIONS[category] : [];
  const isCustom = choice === CUSTOM;
  const selected = policyActions.find((a) => a.title === choice);
  const subject = subjects.find((s) => s.code === courseCode);

  const pickCategory = (next) => {
    setCategory(next);
    setChoice("");
    setPerformedBy("Student");
    setEvidence("");
    setSteps(1);
  };

  const pickAction = (action) => {
    setChoice(action.title);
    setPerformedBy(action.owner);
    setEvidence(action.evidence);
    setSteps(action.steps);
  };

  const pickCustom = () => {
    setChoice(CUSTOM);
    setEvidence("");
    setSteps(1);
  };

  const title = isCustom ? customTitle.trim() : (selected?.title ?? "");
  const canSubmit =
    category &&
    title &&
    section &&
    subject &&
    assessmentType &&
    dueDate &&
    Number(steps) >= 1 &&
    !submitting;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        activity: title,
        isCustom,
        category,
        performedBy,
        section,
        subject: subject.name,
        courseCode: subject.code,
        assessmentType,
        dueDate,
        evidenceRequired: evidence.trim(),
        totalSteps: Number(steps),
        description: description.trim(),
      });
    } catch (err) {
      setSubmitError(err.message || "Could not assign the activity.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102746]/40 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-title"
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-[#EEF1F5] p-5">
          <div>
            <h2
              id="assign-title"
              className="text-base font-semibold text-[#102746]"
            >
              Create / Assign Action
            </h2>
            <p className="mt-1 text-xs text-[#71809A]">
              It is assigned to every student of the chosen category in the
              section and subject.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-[#71809A] hover:bg-[#F8FAFC]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <div>
            <span className={labelClass}>Student category</span>
            <div role="radiogroup" className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={category === c}
                  onClick={() => pickCategory(c)}
                  className={`h-9 flex-1 rounded-md border text-xs font-medium ${
                    category === c
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-[#DCE3EC] bg-white text-[#52627A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {category && (
            <div>
              <span className={labelClass}>Activity</span>
              <div role="radiogroup" className="space-y-2">
                {policyActions.map((action) => (
                  <ChoiceRow
                    key={action.title}
                    selected={choice === action.title}
                    onClick={() => pickAction(action)}
                  >
                    <span>{action.title}</span>
                    <OwnerBadge owner={action.owner} />
                  </ChoiceRow>
                ))}
                <ChoiceRow selected={isCustom} onClick={pickCustom}>
                  <span>Other: add your own activity</span>
                </ChoiceRow>
              </div>
            </div>
          )}

          {isCustom && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Activity name">
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Viva practice session"
                  className={fieldClass}
                />
              </Field>
              <div>
                <span className={labelClass}>Who does it?</span>
                <div role="radiogroup" className="flex gap-2">
                  {["Student", "Teacher"].map((owner) => (
                    <button
                      key={owner}
                      type="button"
                      role="radio"
                      aria-checked={performedBy === owner}
                      onClick={() => setPerformedBy(owner)}
                      className={`h-9 flex-1 rounded-md border text-xs font-medium ${
                        performedBy === owner
                          ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB]"
                          : "border-[#DCE3EC] bg-white text-[#52627A] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {owner}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {choice && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Section">
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select section</option>
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Subject">
                  <select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} · {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Assessment">
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select assessment</option>
                    {ASSESSMENTS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Due date">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Evidence required">
                  <input
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="e.g. Answer sheet"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Number of steps">
                  <input
                    type="number"
                    min={1}
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              </div>
              <Field label="Instructions (optional)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-[#DCE3EC] p-3 text-xs outline-none focus:border-[#2563EB]"
                />
              </Field>
            </>
          )}

          {submitError && (
            <p role="alert" className="text-xs text-[#DC2626]">
              {submitError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#EEF1F5] p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-[#DCE3EC] px-4 text-xs font-medium text-[#52627A] hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-9 rounded-md bg-[#2563EB] px-4 text-xs font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-40"
          >
            {submitting ? "Assigning…" : "Assign action"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AssignActionModal({
  isOpen,
  sections = [],
  subjects = [], // [{ code, name }]
  onSubmit,
  onClose,
}) {
  if (!isOpen) return null;
  return (
    <Form
      sections={sections}
      subjects={subjects}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}