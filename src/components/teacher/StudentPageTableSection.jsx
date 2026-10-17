"use client";

import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import StudentsTable from "./StudentsTable";
import { useCallback, useEffect, useState } from "react";
import useTeacherStore from "@/store/useTeacherStore";
import axios from "axios";

const StudentPageStudentTableSection = () => {
    const [retryCount, setRetryCount] = useState(0);

    const setStudents = useFilterStudentsStore(
        (state) => state.setStudents
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

    const filters = useTeacherStore((state) => state.filters);
    
    const hasRequiredFilters = Boolean(
        filters.semester &&
        filters.className &&
        filters.courses &&
        filters.assessment
    );

    const fetchStudents = useCallback(
        async (signal) => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.post("/api/teachers/students", { filters }, { signal });

                const { students } = response.data;
                
                if (!Array.isArray(students)) {
                    throw new Error("Invalid student response.");
                }
                
                setStudents(students);

            } catch (err) {
                if (!axios.isCancel(err)) {
                    clearStudents();
                    setError("Unable to load student records. Please try again.");
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        },
        [
            filters.program,
            filters.semester,
            filters.className,
            filters.courses,
            filters.assessment,
            setStudents,
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

    const students = useFilterStudentsStore((state) => state.students);
    
    return (
        <StudentsTable title={"My Students"} category="All" students={students} error={error} loading={loading} setRetryCount={setRetryCount} />
    );
};

export default StudentPageStudentTableSection;