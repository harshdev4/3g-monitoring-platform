"use client";

import Header from '@/components/dashboard/Header'
import UserWorkSpace from '@/components/dashboard/UserWorkSpace';
import useTeacherStore from '@/store/useTeacherStore';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const page = () => {
    const teacher = useTeacherStore((state) => state);
    const nameArr = teacher.name.split(" ");
    const shortName = nameArr.map(word => word.slice(0, 1)).slice(0, 2);
    const [assignedCourses, setAssignedCourses] = useState([]);

    useEffect(() => {
        const fetchAssignedCourses = async () => {
            try {
                const response = await axios.get('/api/teachers/getAssignedCourses', {
                    params: {
                        empId: teacher.empId
                    }
                });
                setAssignedCourses(response.data.assignedCourses);
            } catch (error) {
                toast.error(error?.response.data.message || "Something went wrong. Please try again.");
            }
        }
        if(teacher.empId)
            fetchAssignedCourses();
    }, [teacher.empId]);

    return (
        <div>
            <Header />
            <div className="p-5">
                <UserWorkSpace
                    user={`${teacher.role == 'teacher' && 'Teacher' || teacher.role == 'student' && 'Student' || teacher.role == 'dean' || 'Dean'}`}
                    name={teacher.name}
                    designation={teacher.designation}
                    pageTitle="Profile"
                    description="Faculty identity, academic assignments and account preferences."
                    showWelcome={false}
                />

                <div className='bg-white my-3 p-3 rounded-md'>
                    <h2 className='text-[17px] font-semibold text-navy mb-2'>Teacher profile</h2>
                    <div className='flex gap-3.5'>
                        <div className="rounded-full bg-navy w-17 aspect-square text-white font-inter text-[22px] font-semibold grid place-content-center">
                            <h4>{shortName}</h4>
                        </div>
                        <div>
                            <h3 className='mb-0.5 text-navy font-semibold text-xl'>{teacher.designation}{" "}{teacher.name}</h3>
                            <h4 className='mb-0.5 text-[#66758D] text-xs font-normal'>Faculty . {teacher.dept}{" . "}{teacher.program}</h4>
                            <h4 className='text-[#66758D] text-xs font-normal'>Faculty ID {teacher.empId}{" . "}{teacher.mail}</h4>
                        </div>
                    </div>
                </div>

                <div className='bg-white my-3 p-3 rounded-md'>
                    <h2 className='text-[17px] font-semibold text-navy mb-2'>Personal information</h2>
                    <div className='flex flex-col gap-3'>
                        <div>
                            <h3 className='text-[11px] mb-1 text-[#66758D] font-semibold'>Full name</h3>
                            <h2 className='rounded-md border border-[#E4EAF2] p-2 text-xs text-navy font-normal'>{teacher.designation}{" "}{teacher.name}</h2>
                        </div>
                        <div>
                            <h3 className='text-[11px] mb-1 text-[#66758D] font-semibold'>Email</h3>
                            <h2 className='rounded-md border border-[#E4EAF2] p-2 text-xs text-navy font-normal'>{teacher.mail}</h2>
                        </div>
                        <div>
                            <h3 className='text-[11px] mb-1 text-[#66758D] font-semibold'>Contact number</h3>
                            <h2 className='rounded-md border border-[#E4EAF2] p-2 text-xs text-navy font-normal'>NK</h2>
                        </div>
                    </div>
                </div>

                <div className='bg-white my-3 p-3 rounded-md'>
                    <h2 className='text-[17px] font-semibold text-navy mb-2'>Assigned courses & classes</h2>
                    <table className='w-full'>
                        <colgroup>
                            <col className='w-[20%]' />
                            <col className='w-[20%]' />
                            <col className='w-[20%]' />
                            <col className='w-[20%]' />
                            <col className='w-[20%]' />
                        </colgroup>
                        <thead className='bg-[#F5F7FB]'>
                            <tr>
                                <th className='px-4 py-3 text-[10px] text-[#66758D] font-normal'>Course code</th>
                                <th className='px-4 py-3 text-[10px] text-[#66758D] font-normal'>Course name</th>
                                <th className='px-4 py-3 text-[10px] text-[#66758D] font-normal'>Semester</th>
                                <th className='px-4 py-3 text-[10px] text-[#66758D] font-normal'>Section</th>
                                <th className='px-4 py-3 text-[10px] text-[#66758D] font-normal'>Students</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-200'>
                            {assignedCourses.length > 0 && assignedCourses.map((course) => {
                                return (
                                    <tr key={course.course_code + course.semester + course.className}>
                                        <td className='text-center px-4 py-3 font-normal text-xs text-navy'>{course.course_code}</td>
                                        <td className='text-center px-4 py-3 font-normal text-xs text-navy'>{course.course}</td>
                                        <td className='text-center px-4 py-3 font-normal text-xs text-navy'>{course.semester}</td>
                                        <td className='text-center px-4 py-3 font-normal text-xs text-navy'>{course.className}</td>
                                        <td className='text-center px-4 py-3 font-normal text-xs text-navy'>{course.student_count}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

export default page
