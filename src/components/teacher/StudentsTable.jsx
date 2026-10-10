"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";

const StudentsTable = ({ students, subtitle }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 10;
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = students.slice(
    startIndex,
    startIndex + studentsPerPage
  );

  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white">
      <div className="flex items-start justify-between border-b border-[#EEF1F5] p-4">
        <div>
          <h3 className="text-base font-semibold text-[#102746]">
            My Students
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-[#71809A]">
              {subtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-1.5 text-[#71809A] hover:bg-[#F5F7FB]"
        >
          <Filter size={15} />
        </button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EEF1F5]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71809A]">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71809A]">
                Roll No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71809A]">
                Class
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71809A]">
                Attendance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71809A]">
                Assessment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71809A]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentStudents.map((student) => (
              <tr
                key={student.id}
                className="border-b border-[#F1F4F8] last:border-0"
              >
                <td className="px-4 py-3 text-xs font-medium text-[#334155]">
                  {student.name}
                </td>
                <td className="px-4 py-3 text-xs text-[#60708A]">
                  {student.rollNo}
                </td>
                <td className="px-4 py-3 text-xs text-[#60708A]">
                  {student.className}
                </td>
                <td className="px-4 py-3 text-xs text-[#60708A]">
                  {student.attendance}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${student.statusClass}`}
                  >
                    {student.assessment}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/teacher/students/${student.id}`}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    View Student
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[#EEF1F5] md:hidden">
        {currentStudents.map((student) => (
          <div key={student.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#334155]">
                  {student.name}
                </p>
                <p className="mt-1 text-xs text-[#8A98AB]">
                  {student.rollNo} · {student.className}
                </p>
              </div>

              <span
                className={`rounded-full px-2 py-1 text-[10px] font-medium ${student.statusClass}`}
              >
                {student.assessment}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-[#60708A]">
                Attendance: {student.attendance}%
              </p>
              <Link
                href={`/dashboard/teacher/students/${student.id}`}
                className="text-xs font-medium text-[#2563EB]"
              >
                View Student
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#EEF1F5] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#71809A]">
          Showing {students.length > 0 ? startIndex + 1 : 0}–
          {Math.min(startIndex + studentsPerPage, students.length)} of{" "}
          {students.length} students
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="rounded-md border border-[#E5EAF1] px-3 py-2 text-xs font-medium text-[#102746] hover:bg-[#F5F7FB] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`rounded-md border px-3 py-2 text-xs font-medium ${
                  currentPage === page
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#E5EAF1] text-[#102746] hover:bg-[#F5F7FB]"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-md border border-[#E5EAF1] px-3 py-2 text-xs font-medium text-[#102746] hover:bg-[#F5F7FB] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;
