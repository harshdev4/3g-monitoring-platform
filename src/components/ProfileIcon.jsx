"use client";

import useTeacherStore from "@/store/useTeacherStore";
import { ChevronDown } from "lucide-react";

const ProfileIcon = () => {
    const name = useTeacherStore((state) => state.name);
    const dept = useTeacherStore((state) => state.dept);
    const designation = useTeacherStore((state) => state.designation);
    const nameArr = name.split(" ");
    const shortName = nameArr.map(word => word.slice(0,1)).slice(0, 2);
    return (
        <div className="flex gap-1 items-start relative cursor-pointer" title="Prof. Harsh Sharma">
            <div className="rounded-full bg-navy w-fit px-2 p-1.75 text-white font-inter text-[11px]">
                <h4>{shortName}</h4>
            </div>
            <div className="hidden lg:block">
                <h3 className="text-navy font-semibold text-[12px]">{designation}. {name}</h3>
                <p className="text-[#66758D] text-[10px]">Faculty · {dept.slice(0,20)}...</p>
            </div>
            <div className="relative h-4 w-4">
                <ChevronDown className="absolute top-[50%] right-0 h-4 w-4 text-[#66758D] cursor-pointer" />
            </div>
        </div>
    );
};

export default ProfileIcon;