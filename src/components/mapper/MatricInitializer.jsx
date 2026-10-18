
"use client";

import { useEffect } from "react";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";

const MatricInitializer = ({ students }) => {
  const setStudents = useFilterStudentsStore(
    (state) => state.setStudents
  );

  useEffect(() => {
    if (students) {
      setStudents(students);
    }
  }, [students, setStudents]);

  return null;
};

export default MatricInitializer;
