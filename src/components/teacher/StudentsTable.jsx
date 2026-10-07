import Link from "next/link";
import { Filter } from "lucide-react";

const StudentsTable = ({
  students,
  subtitle,
}) => {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white">
      <div className="flex items-start justify-between border-b border-[#EEF1F5] p-4">
        <div>
          <h3 className="text-sm font-semibold text-[#102746]">
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

      {/* Desktop */}
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
            {students.map((student) => (
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
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${student.statusClass}`}
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

      {/* Mobile */}
      <div className="divide-y divide-[#EEF1F5] md:hidden">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-4"
          >
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
    </div>
  );
};

export default StudentsTable;