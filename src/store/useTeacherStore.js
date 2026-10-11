import { create } from "zustand";

const initialFilters = {
    program: "",
    semester: "",
    className: "",
    courses: "",
    assessment: "",
};

const initialTeacher = {
    empId: "",
    role: "",
    prefix: "",
    name: "",
    dept: "",
    program: "",
    mail: "",
    designation: "",
};

const useTeacherStore = create((set) => ({
    ...initialTeacher,

    assignedCourses: [],

    filters: { ...initialFilters },

    setTeacher: (teacher) => set((state)=>({
        ...initialTeacher,
        ...teacher,
        assignedCourses: state.assignedCourses,
        filters: state.filters
    })),

    updateUser: (updates) => set((state) => ({
        ...state,
        ...updates,
    })),

    setAssignedCourses: (assignedCourses) =>
        set({ assignedCourses }),

    setFilter: (key, value) =>
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: value,
            },
        })),

    setFilters: (updates) =>
        set((state) => ({
            filters: {
                ...state.filters,
                ...updates,
            },
        })),

    resetFilters: () =>
        set({ filters: { ...initialFilters } }),

    clearTeacher: () =>
        set({
            ...initialTeacher,
            assignedCourses: [],
            filters: { ...initialFilters },
        }),
}));

export default useTeacherStore;
