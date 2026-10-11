"use client";

import useTeacherStore from "@/store/useTeacherStore";
import { useEffect } from "react";

const InitializeAssignedCourses = ({ assignedCourses }) => {
    if (!assignedCourses) return <p>No course assigned yet</p>
    const setAssignedCourses = useTeacherStore((state) => state.setAssignedCourses);
    
    setAssignedCourses(assignedCourses);

    useEffect(() => {
        if (assignedCourses) {
            setAssignedCourses(assignedCourses);
        }
    }, [assignedCourses, setAssignedCourses]);
    
    return null;
};

export default InitializeAssignedCourses;