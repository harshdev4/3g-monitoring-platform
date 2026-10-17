"use client";

import { useEffect } from "react";
import axios from "axios";
import useTeacherStore from "@/store/useTeacherStore";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";

export default function PerformanceStudentsInitializer() {
  const filters = useTeacherStore((state) => state.filters);

  const setStudents = useFilterStudentsStore((state) => state.setStudents);
  const setLoading = useFilterStudentsStore((state) => state.setLoading);
  const setError = useFilterStudentsStore((state) => state.setError);
  const clearStudents = useFilterStudentsStore((state) => state.clearStudents);

  useEffect(() => {
    const hasRequiredFilters = Boolean(
      filters.semester &&
      filters.className &&
      filters.courses &&
      filters.assessment,
    );

    if (!hasRequiredFilters) {
      clearStudents();
      setLoading(false);
      setError(null);
      return;
    }

    const fetchStudents = async (signal) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          "/api/teachers/students",
          { filters },
          { signal: signal },
        );

        const { students } = response.data;
        console.log("Students data:", students);
        console.log("First student:", students[0]);

        if (!Array.isArray(students)) {
          throw new Error("Invalid student response");
        }

        setStudents(students);
      } catch (error) {
        if (!axios.isCancel(error)) {
          clearStudents();
          setError("Unable to load student records.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
        const controller = new AbortController();
    fetchStudents(controller.signal);

    return () => controller.abort();
  }, [filters, setStudents, setLoading, setError, clearStudents]);

  return null;
}
