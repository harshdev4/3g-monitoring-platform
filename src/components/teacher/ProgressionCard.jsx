
"use client";

import { useCallback, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import axios from "axios";

import useTeacherStore from "@/store/useTeacherStore";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ProgressionCard = () => {
  const filters = useTeacherStore((state) => state.filters);

  const [retryCount, setRetryCount] = useState(0);

  const setStudentsWithAssessments = useFilterStudentsStore(
    (state) => state.setStudentsWithAssessments
  );
  const loading = useFilterStudentsStore(
    (state) => state.loading
  );
  const setLoading = useFilterStudentsStore(
    (state) => state.setLoading
  );
  const error = useFilterStudentsStore(
    (state) => state.error
  );
  const setError = useFilterStudentsStore(
    (state) => state.setError
  );
  const clearStudents = useFilterStudentsStore(
    (state) => state.clearStudents
  );
  const studentsWithAssessments = useFilterStudentsStore(
    (state) => state.studentsWithAssessments
  );

  const students = useFilterStudentsStore(
    (state) => state.students
  );

  const hasRequiredFilters = Boolean(
    filters.semester &&
    filters.className &&
    filters.courses
  );

  const fetchStudents = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          "/api/teachers/students-with-all-assessments",
          { filters },
          { signal }
        );

        const { students } = response.data;

        if (!Array.isArray(students)) {
          throw new Error("Invalid student response.");
        }

        setStudentsWithAssessments(students);
      } catch (err) {
        if (!axios.isCancel(err)) {
          clearStudents();
          setError(
            "We couldn't load the progression data. Please try again."
          );
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [
      filters,
      setStudentsWithAssessments,
      setLoading,
      setError,
      clearStudents,
    ]
  );

  useEffect(() => {
    if (!hasRequiredFilters) {
      clearStudents();
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    fetchStudents(controller.signal);

    return () => controller.abort();
  }, [
    hasRequiredFilters,
    fetchStudents,
    clearStudents,
    setLoading,
    setError,
    retryCount,
  ]);

  const progressionSeries = [
    {
      label: "Gradual",
      color: "#EF4444",
      data: [42, 50, 60, 70],
    },
    {
      label: "Growing",
      color: "#F59E0B",
      data: [42, 57, 68, 82],
    },
    {
      label: "Gallant",
      color: "#10B981",
      data: [42, 52, 64, 78],
    },
  ];

  const subtitle = `Sem- ${filters.semester} ${filters.className} · Average from assessment`;
  const labels = ["Pre-MSE", "MSE-1", "MSE-2", "ESE"];
  const footer = `Cohort: ${students.length} · Grade bands over assessment period`;

  const chartData = {
    labels,
    datasets: progressionSeries.map((item) => ({
      label: item.label,
      data: item.data,
      borderColor: item.color,
      backgroundColor: item.color,
      borderWidth: 1.5,
      pointRadius: 2,
      pointHoverRadius: 4,
      tension: 0.35,
      fill: false,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          padding: 10,
          font: { size: 10 },
        },
      },
      tooltip: {
        bodyFont: { size: 12 },
        titleFont: { size: 12 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#71809A",
          font: { size: 10 },
          maxRotation: 0,
          minRotation: 0,
          padding: 4,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: "#71809A",
          font: { size: 10 },
          padding: 6,
        },
        grid: { color: "#EEF1F5" },
      },
    },
  };

  return (
    <div className="min-w-0 rounded-lg border border-[#E5EAF1] bg-white p-4">
      {/* Header */}
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[#102746]">
          3G Progression
        </h3>

        <p className="mt-1 text-xs text-[#71809A]">
          {hasRequiredFilters
            ? subtitle
            : "Select your filters to view student progression."}
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          role="status"
          aria-label="Loading progression data"
          className="mt-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="relative h-47.5 overflow-hidden rounded-md">
            <div className="absolute inset-0 flex flex-col justify-between py-2">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-px w-full bg-slate-100"
                />
              ))}
            </div>

            <div className="absolute inset-0 animate-pulse">
              <svg
                viewBox="0 0 400 180"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden="true"
              >
                <path
                  d="M 0 140 C 60 120, 80 130, 130 95 S 220 110, 270 65 S 340 70, 400 25"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 155 C 70 130, 95 110, 150 120 S 240 75, 290 90 S 350 50, 400 45"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-[#71809A]">
            Loading progression data...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && hasRequiredFilters && error && (
        <div
          role="alert"
          className="mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50/60 px-5 py-6 text-center"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
            <AlertCircle
              size={21}
              className="text-red-600"
            />
          </div>

          <h4 className="text-sm font-semibold text-[#102746]">
            Couldn't load progression
          </h4>

          <p className="mt-1 max-w-xs text-xs leading-5 text-[#71809A]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#102746] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1B3B63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      )}

      {/* Missing filters */}
      {!loading && !error && !hasRequiredFilters && (
        <div className="mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-[#DCE4EE] bg-[#F8FAFC] px-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white ring-1 ring-[#E5EAF1]">
            <SlidersHorizontal
              size={19}
              className="text-[#71809A]"
            />
          </div>

          <h4 className="text-sm font-medium text-[#102746]">
            Choose your filters
          </h4>

          <p className="mt-1 max-w-xs text-xs leading-5 text-[#71809A]">
            Select a semester, section, and course to see the progression chart.
          </p>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && hasRequiredFilters && (
        <>
          <div className="relative mt-4 h-47.5 w-full min-w-0">
            <Line data={chartData} options={chartOptions} />
          </div>

          <p className="mt-3 border-t border-[#EEF1F5] pt-3 text-[11px] text-[#8A98AB]">
            {footer}
          </p>
        </>
      )}
    </div>
  );
};

export default ProgressionCard;
