import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";

const AttentionCard = ({
  title = "Students Requiring Attention",
  subtitle,
  students,
  actionLabel = "View All At-Risk Students",
}) => {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#102746]">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-[#71809A]">
              {subtitle}
            </p>
          )}
        </div>

        <AlertCircle
          size={16}
          strokeWidth={1.8}
          className="text-[#EF4444]"
        />
      </div>

      <div className="mt-4 space-y-3">
        {students.map((student) => (
          <div
            key={student.id}
            className="rounded-md border border-[#EEF1F5] bg-[#FAFBFD] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#334155]">
                  {student.name}
                </p>

                <p className="mt-0.5 text-[11px] text-[#8A98AB]">
                  {student.rollNo}
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-medium text-red-500">
                At-Risk
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[#60708A]">
              {student.reason}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/teacher/at-risk"
        className="mt-4 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
      >
        {actionLabel}
        <ArrowRight size={13} />
      </Link>
    </div>
  );
};

export default AttentionCard;