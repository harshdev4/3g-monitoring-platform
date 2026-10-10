import Link from "next/link";
import {
  Upload,
  Plus,
  ArrowRight,
} from "lucide-react";


const QuickActionsCard = ({
  actions,
  evidenceCount,
  evidenceText,
  evidenceHref = "/dashboard/teacher/evidence",
}) => {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#102746]">
        Quick Actions
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon =
            action.type === "upload"
              ? Upload
              : Plus;

          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              <Icon size={13} />
              {action.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-5 border-t border-[#EEF1F5] pt-4">
        <p className="text-xs font-medium text-[#334155]">
          {evidenceCount} submissions awaiting review
        </p>

        <p className="mt-1 text-[11px] text-[#8A98AB]">
          {evidenceText}
        </p>

        <Link
          href={evidenceHref}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
        >
          Review Evidence
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default QuickActionsCard;