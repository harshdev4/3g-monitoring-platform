"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import MonitoringCard from "@/components/teacher/MonitoringCard";
import RecentActivityCard from "@/components/teacher/RecentActivityCard";

export default function ActionEvidenceMonitoring() {
  const [monitoring, setMonitoring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMonitoring = useCallback(async (signal) => {
    try {
      const response = await fetch("/api/teachers/action-monitoring", {
        cache: "no-store",
        signal,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load monitoring data.");
      }

      if (signal?.aborted) return;
      setError("");
      setMonitoring(result.monitoring);
    } catch (loadError) {
      if (loadError.name === "AbortError") return;
      setError(loadError.message || "Unable to load monitoring data.");
      setMonitoring(null);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const retryLoad = () => {
    setLoading(true);
    setError("");
    loadMonitoring();
  };

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        loadMonitoring(controller.signal);
      }
    });
    return () => controller.abort();
  }, [loadMonitoring]);

  if (loading && !monitoring) {
    return (
      <div className="rounded-lg border border-[#E5EAF1] bg-white p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={18} className="animate-spin" />
          Loading action and evidence monitoring...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={retryLoad}
            className="ml-auto shrink-0 font-medium underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const assignmentCount = Number(monitoring.assignmentCount) || 0;
  const completedCount = Number(monitoring.completedCount) || 0;
  const inProgressCount = Number(monitoring.inProgressCount) || 0;
  const assignedCount = Number(monitoring.assignedCount) || 0;
  const studentEvidenceCount = Number(monitoring.studentEvidenceCount) || 0;
  const teacherEvidenceCount = Number(monitoring.teacherEvidenceCount) || 0;
  const completedPercentage = assignmentCount
    ? Math.round((completedCount / assignmentCount) * 100)
    : 0;

  const items = [
    {
      value: assignmentCount,
      label: "student actions assigned",
      description: `${completedCount} completed · ${inProgressCount} in progress · ${assignedCount} assigned`,
      status: `${completedPercentage}% complete`,
      progress: completedPercentage,
    },
    {
      value: studentEvidenceCount + teacherEvidenceCount,
      label: "evidence submissions",
      description: `${studentEvidenceCount} student · ${teacherEvidenceCount} teacher`,
    },
  ];

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <MonitoringCard
        title="Action & Evidence Monitoring"
        items={items}
        actionLabel="View Actions"
        actionHref="/dashboard/teacher/actions"
      />
      <RecentActivityCard activities={monitoring.recentActivities ?? []} />
    </div>
  );
}
