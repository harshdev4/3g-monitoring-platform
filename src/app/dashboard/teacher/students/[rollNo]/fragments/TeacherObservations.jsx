"use client";

import { useEffect, useState } from "react";

const ASSESSMENT_LABELS = {
  "pre-mse": "Pre-MSE",
  "mse-1": "MSE-1",
  "mse-2": "MSE-2",
  ese: "ESE",
};

export default function TeacherObservations({
  studentId,
  courseCode,
  semester,
  academicYear,
  assessment,
}) {
  const [observations, setObservations] = useState([]);
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadObservations() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          student_id: studentId,
          course_code: courseCode,
          semester: String(semester),
          academic_year: academicYear,
        });
        const response = await fetch(
          `/api/teachers/student-observations?${params.toString()}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Unable to load observations.");
        }

        const loadedObservations = result.observations ?? [];
        setObservations(loadedObservations);
        setObservation(
          loadedObservations.find((item) => item.assessment === assessment)
            ?.observation ?? ""
        );
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError.message || "Unable to load observations.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (studentId && courseCode && semester && academicYear) {
      loadObservations();
    }

    return () => controller.abort();
  }, [studentId, courseCode, semester, academicYear, assessment]);

  async function handleSave(event) {
    event.preventDefault();
    if (saving || loading) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/teachers/student-observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          course_code: courseCode,
          semester,
          academic_year: academicYear,
          assessment,
          observation,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save the observation.");
      }

      setObservations((current) => {
        const withoutCurrent = current.filter(
          (item) => item.assessment !== assessment
        );
        return result.observation.observation
          ? [...withoutCurrent, result.observation]
          : withoutCurrent;
      });
      setObservation(result.observation.observation);
      setNotice("Observation saved.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save the observation.");
    } finally {
      setSaving(false);
    }
  }

  const contextAvailable = Boolean(
    studentId && courseCode && semester && academicYear && assessment
  );
  const contextError = contextAvailable
    ? ""
    : "Student course or assessment details are unavailable.";

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h2 className="text-base font-semibold text-[#20375D]">
        Teacher observation
      </h2>
      <p className="mt-1 text-xs text-[#7183A3]">
        {ASSESSMENT_LABELS[assessment] ?? assessment} · {courseCode}
      </p>

      {(error || contextError) && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-xs text-red-700">
          {error || contextError}
        </p>
      )}

      <form onSubmit={handleSave} className="mt-3 space-y-3">
        <label
          htmlFor="student-assessment-observation"
          className="block text-xs font-medium text-[#20375D]"
        >
          Observation
        </label>
        <textarea
          id="student-assessment-observation"
          value={observation}
          onChange={(event) => {
            setObservation(event.target.value);
            setNotice("");
          }}
          rows={4}
          maxLength={2000}
          placeholder="Enter your observation for this assessment..."
          disabled={!contextAvailable || loading || saving}
          className="w-full resize-y rounded-md border border-[#DCE3ED] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:bg-slate-50"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            {observation.length}/2000 characters
          </span>
          <button
            type="submit"
            disabled={!contextAvailable || loading || saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save observation"}
          </button>
        </div>
        {notice && (
          <p role="status" className="text-xs text-emerald-700">
            {notice}
          </p>
        )}
      </form>

      {observations.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-semibold text-[#20375D]">
            Saved observations by assessment
          </h3>
          <div className="mt-2 space-y-3">
            {observations.map((item) => (
              <article
                key={item.assessment}
                className="rounded-md bg-slate-50 p-3"
              >
                <h4 className="text-xs font-semibold text-slate-700">
                  {ASSESSMENT_LABELS[item.assessment] ?? item.assessment}
                </h4>
                <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                  {item.observation}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
