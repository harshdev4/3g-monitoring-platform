"use client";

import { useCallback, useEffect, useState } from "react";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import useTeacherStore from "@/store/useTeacherStore";

export default function useTeacherStudents() {
  const filters = useTeacherStore((state) => state.filters);
  const setStudents = useFilterStudentsStore((state) => state.setStudents);
  const loading = useFilterStudentsStore((state) => state.loading);
  const setLoading = useFilterStudentsStore((state) => state.setLoading);
  const error = useFilterStudentsStore((state) => state.error);
  const setError = useFilterStudentsStore((state) => state.setError);
  const clearStudents = useFilterStudentsStore((state) => state.clearStudents);
  const [retryCount, setRetryCount] = useState(0);

  const hasRequiredFilters = Boolean(
    filters.semester &&
      filters.className &&
      filters.courses &&
      filters.assessment
  );

  const loadStudents = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/teachers/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
        signal,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to load student records.");
      }
      if (!Array.isArray(result.students)) {
        throw new Error("Invalid student response.");
      }
      setStudents(result.students);
    } catch (loadError) {
      if (!signal.aborted) {
        clearStudents();
        setError(loadError.message || "Unable to load student records.");
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [filters, setLoading, setError, setStudents, clearStudents]);

  useEffect(() => {
    if (!hasRequiredFilters) {
      clearStudents();
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    loadStudents(controller.signal);
    return () => controller.abort();
  }, [
    hasRequiredFilters,
    loadStudents,
    clearStudents,
    setLoading,
    setError,
    retryCount,
  ]);

  return {
    students: useFilterStudentsStore((state) => state.students),
    loading,
    error,
    retry: () => setRetryCount((count) => count + 1),
  };
}
