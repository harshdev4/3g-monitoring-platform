import { create } from "zustand";

const useFilterStudentsStore = create((set) => ({
  students: [],
  studentsWithAssessments: [],
  loading: false,
  error: null,

  setStudents: (students) => set({ students: students }),
  setStudentsWithAssessments: (students) => set({ studentsWithAssessments:  students}),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearStudents: () =>
    set({
      students: [],
      studentsWithAssessments: [],
      error: null,
    }),
}));

export default useFilterStudentsStore;