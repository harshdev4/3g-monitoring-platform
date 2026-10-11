"use client";
import { useEffect } from "react";
import useTeacherStore from "@/store/useTeacherStore";

export default function TeacherStoreInitializer({ teacher }) {
    const setTeacher = useTeacherStore((state) => state.setTeacher);
    
    useEffect(() => {
        if (teacher) {
            setTeacher(teacher);
        }
    }, [teacher, setTeacher]);

    return null;
}