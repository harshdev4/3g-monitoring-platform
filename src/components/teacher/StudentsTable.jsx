"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

const StudentsTable = ({ students = [], subtitle }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const studentsPerPage = 10;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        student.name?.toLowerCase().includes(query) ||
        String(student.rollNo ?? "")
          .toLowerCase()
          .includes(query);

      const assessment = student.assessment || "Gradual";

      const matchesStatus =
        selectedStatus === "All Status" ||
        assessment.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [students, search, selectedStatus]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = filteredStudents.slice(
    startIndex,
    startIndex + studentsPerPage,
  );

  const getAssessmentStyle = (assessment) => {
    switch (assessment?.toLowerCase()) {
      case "gallant":
        return "bg-[#E5F8EF] text-[#14965B]";
      case "growing":
        return "bg-[#FFF5DF] text-[#B77905]";
      default:
        return "bg-[#FFF0F0] text-[#E5484D]";
    }
  };

  const getTrend = (student) => {
    if (student.trend !== undefined) return student.trend;

    return student.assessment?.toLowerCase() === "gallant"
      ? 6
      : student.assessment?.toLowerCase() === "growing"
        ? 7
        : -6;
  };

  const getMarks = (student) => {
    if (student.marks !== undefined) return student.marks;

    const attendance = Number(student.attendance || 0);
    return Math.min(100, Math.max(0, attendance - 30));
  };

  const resetPagination = () => setCurrentPage(1);

  return (
    <section className="overflow-hidden rounded-lg border border-[#E5EAF1] bg-white p-4">
      {/* Heading */}
      <div>
        <h2 className="text-base font-semibold text-[#102746]">My Students</h2>

        <p className="mt-1 text-xs text-[#71809A]">
          {subtitle ||
            "Subject category: DBMS · MSE-II checkpoint · Sorted by roll number ↑"}
        </p>
      </div>

      {/* Search and status filter */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-[35px] w-full items-center gap-2 rounded-lg border border-[#E1E8F2] px-3 sm:max-w-[356px]">
          <Search size={15} className="shrink-0 text-[#526581]" />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or roll no..."
            aria-label="Search students by name or roll number"
            className="w-full bg-transparent text-xs text-[#102746] outline-none placeholder:text-[#8A99B0]"
          />
        </div>

        <div className="relative w-full sm:w-[128px]">
          <Filter
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#526581]"
          />

          <select
            value={selectedStatus}
            onChange={(event) => {
              setSelectedStatus(event.target.value);
              resetPagination();
            }}
            aria-label="Filter students by assessment"
            className="h-[35px] w-full appearance-none rounded-lg border border-[#E1E8F2] bg-white pl-9 pr-8 text-xs text-[#102746] outline-none focus:border-[#2563EB]"
          >
            <option>All Status</option>
            <option>Gradual</option>
            <option>Growing</option>
            <option>Gallant</option>
          </select>

          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#526581]"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[850px] table-auto text-left">
          <thead>
            <tr className="bg-[#F1F5FB]">
              {[
                "Student name",
                "Roll no.",
                "Class",
                "DBMS - 3G",
                "Attendance",
                "Latest assessment",
                "Trend",
                "Attention",
                "Action",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-3 py-3 text-xs font-medium text-[#526581]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentStudents.map((student) => {
              const assessment = student.assessment || "Gradual";
              const trend = getTrend(student);
              const attendance = Number(student.attendance || 0);
              const marks = getMarks(student);
              const needsAttention =
                attendance < 75 ||
                marks < 40 ||
                assessment.toLowerCase() === "gradual";

              return (
                <tr
                  key={student.id}
                  className="border-b border-[#E8EDF5] last:border-0 hover:bg-[#FAFBFE]"
                >
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-[#243957]">
                    {student.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-xs text-[#243957]">
                    {student.rollNo}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-xs text-[#243957]">
                    {student.className}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${getAssessmentStyle(assessment)}`}
                    >
                      <span className="mr-1">•</span>
                      {assessment}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-xs text-[#243957]">
                    {attendance}%
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-xs text-[#243957]">
                    {marks}% · MSE-II
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        trend < 0 ? "text-[#334155]" : "text-[#334155]"
                      }`}
                    >
                      {trend < 0 ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronUp size={13} />
                      )}
                      {Math.abs(trend)} pts
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-xs text-[#243957]">
                    {needsAttention ? "Needs attention" : "On track"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <Link
                      href={`/dashboard/teacher/students/${student.rollNo}`}
                      className="text-[11px] font-medium text-[#1670FF] hover:underline"
                    >
                      View Student
                    </Link>
                  </td>
                </tr>
              );
            })}

            {currentStudents.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-xs text-[#71809A]"
                >
                  No students match your search or selected status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-[#71809A]">
          Showing {filteredStudents.length > 0 ? startIndex + 1 : 0}–
          {Math.min(startIndex + studentsPerPage, filteredStudents.length)} of{" "}
          {filteredStudents.length} students
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="rounded-md border border-[#E1E8F2] px-3 py-2 text-[10px] text-[#243957] hover:bg-[#F5F7FB] disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter((page) => {
              return (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              );
            })
            .map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`min-w-8 rounded-md border px-3 py-2 text-[10px] ${
                  currentPage === page
                    ? "border-[#2563EB] bg-[#2563EB] font-medium text-white"
                    : "border-[#E1E8F2] text-[#243957] hover:bg-[#F5F7FB]"
                }`}
              >
                {page}
              </button>
            ))}

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage >= totalPages || totalPages === 0}
            className="rounded-md border border-[#E1E8F2] px-3 py-2 text-[10px] text-[#243957] hover:bg-[#F5F7FB] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default StudentsTable;
