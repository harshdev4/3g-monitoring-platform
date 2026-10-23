
"use client";

import { useEffect, useMemo, useState } from "react";
import useTeacherStore from "@/store/useTeacherStore";

const CHECKPOINTS = {
  first: ["MSE 1", "MSE 2"],
  other: ["Baseline", "MSE 1", "MSE 2"],
};

const normalizeCheckpoint = (type) => {
  const value = String(type ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");

  if (value === "baseline") return "Baseline";
  if (["mse 1", "mse i"].includes(value)) return "MSE 1";
  if (["mse 2", "mse ii"].includes(value)) return "MSE 2";

  return null;
};

const CheckpointComparison = ({ apiEndpoint }) => {
  const filters = useTeacherStore((state) => state.filters);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const semester = Number(filters?.semester);
  const semesterValue = filters?.semester;
  const className = filters?.className;
  const courses = filters?.courses;

  const checkpoints =
    semester === 1 ? CHECKPOINTS.first : CHECKPOINTS.other;

  
useEffect(() => {
  if (!semester || !className || !courses || !apiEndpoint) {
    return;
  }

  const controller = new AbortController();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: {
            semester,
            className,
            courses,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch checkpoint data");
      }

      const data = await response.json();  
      setRecords(data.students ?? []);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
        setError("Unable to load checkpoint data.");
        setRecords([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  fetchStudents();

  return () => controller.abort();
}, [semester, className, courses, apiEndpoint]);


  const comparisonData = useMemo(() => {
    return checkpoints.map((checkpoint) => {
      const assessmentRecords = records.filter(
        (record) =>
          normalizeCheckpoint(record.type) === checkpoint
      );

      const percentages = assessmentRecords
        .map((record) => {
          const obtained = Number(record.obtained_mark);
          const maximum = Number(record.max_mark);

          if (
            record.obtained_mark == null ||
            record.max_mark == null ||
            !Number.isFinite(obtained) ||
            !Number.isFinite(maximum) ||
            maximum <= 0
          ) {
            return null;
          }

          return (obtained / maximum) * 100;
        })
        .filter((value) => value !== null);

      const avgMarks =
        percentages.length > 0
          ? percentages.reduce((sum, value) => sum + value, 0) /
            percentages.length
          : null;

      // Assumes that 40% is the passing threshold.
      const passPercentage =
        percentages.length > 0
          ? (percentages.filter((value) => value >= 40).length /
              percentages.length) *
            100
          : null;

      const attendanceValues = assessmentRecords
        .map((record) => {
          if (record.attendance_pct == null) return null;

          const value = Number(record.attendance_pct);

          return Number.isFinite(value) ? value : null;
        })
        .filter((value) => value !== null);

      const attendance =
        attendanceValues.length > 0
          ? attendanceValues.reduce((sum, value) => sum + value, 0) /
            attendanceValues.length
          : null;

      return {
        checkpoint,
        avgMarks:
          avgMarks === null ? null : Number(avgMarks.toFixed(1)),
        passPercentage:
          passPercentage === null
            ? null
            : Number(passPercentage.toFixed(1)),
        attendance:
          attendance === null
            ? null
            : Number(attendance.toFixed(1)),
      };
    });
  }, [records, semester]);

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h2 className="text-[15px] font-semibold text-[#20375D]">
        Checkpoint comparison
      </h2>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[540px] text-left">
          <thead>
            <tr className="bg-[#F3F6FB]">
              {["Checkpoint", "Avg. marks", "Pass %", "Attendance"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-[#71809A]"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-sm text-[#71809A]"
                >
                  Loading checkpoint data...
                </td>
              </tr>
            ) : comparisonData.length > 0 ? (
              comparisonData.map((item) => (
                <tr
                  key={item.checkpoint}
                  className="border-b border-[#E5EAF1] last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-6 text-sm font-medium text-[#20375D]">
                    {item.checkpoint}
                  </td>

                  <td className="px-3 py-6 text-sm text-[#20375D]">
                    {item.avgMarks == null ? "—" : `${item.avgMarks}%`}
                  </td>

                  <td className="px-3 py-6 text-sm text-[#20375D]">
                    {item.passPercentage == null
                      ? "—"
                      : `${item.passPercentage}%`}
                  </td>

                  <td className="px-3 py-6 text-sm text-[#20375D]">
                    {item.attendance == null
                      ? "—"
                      : `${item.attendance}%`}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-sm text-[#71809A]"
                >
                  No checkpoint data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CheckpointComparison;
