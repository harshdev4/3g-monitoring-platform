import { create } from "zustand";

const useFilterStudentsStore = create((set) => ({
  students: [],

  loading: false,
  error: null,

  setStudents: (students) => set({ students }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearStudents: () =>
    set({
      students: [],
      error: null,
    }),
}));

export default useFilterStudentsStore;