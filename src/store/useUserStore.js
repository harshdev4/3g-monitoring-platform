import { create } from "zustand";

const initialUser = {
    role: "",
    prefix: "",
    name: "",
    dept: "",
    program: "",
    mail: "",
};

const useUserStore = create((set) => ({
    ...initialUser,
    setUser: (user) => set(user),
    updateUser: (updates) => set((state) => ({
        ...state,
        ...updates,
    })),
    clearUser: () => set(initialUser),
}));

export default useUserStore;