"use client";

import useTeacherStore from "@/store/useTeacherStore";
import { useEffect } from "react";

const InitializeAssignedCourses = ({ assignedCourses }) => {
  const setAssignedCourses = useTeacherStore(
    (state) => state.setAssignedCourses,
  );
  useEffect(() => {
    if (assignedCourses) {
      setAssignedCourses(assignedCourses);
    }
  }, [assignedCourses, setAssignedCourses]);

  if (!assignedCourses) {
    return <p>No course assigned yet</p>;
  }

  return null;
};

export default InitializeAssignedCourses;
