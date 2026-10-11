
import { Info } from "lucide-react";

const StudentStatusCard = ({
  subject,
  marks,
  exam,
  trend,
  previousAssessment,
  attendance,
}) => {
  const needsAttention =
    marks < 40 ||
    attendance < 75 ||
    trend <= -5;

  const title = needsAttention
    ? `Needs attention in ${subject}`
    : `Student is on track`;

  const trendDescription =
    trend < 0
      ? `decline of ${Math.abs(trend)} points`
      : `improvement of ${trend} points`;

  return (
    <section
      className={`flex items-start gap-3 rounded-xl border-l-[3px] px-3 py-4 sm:px-4 ${
        needsAttention
          ? "border-[#F04452] bg-[#FFF0F1]"
          : "border-[#10B981] bg-[#ECFDF5]"
      }`}
    >
      <Info
        size={20}
        strokeWidth={2.5}
        className={`mt-0.5 shrink-0 ${
          needsAttention ? "text-[#F04452]" : "text-[#10B981]"
        }`}
      />

      <div className="min-w-0">
        <h3
          className={`text-[13px] font-semibold leading-5 ${
            needsAttention ? "text-[#d81428]" : "text-[#047857]"
          }`}
        >
          {title}
        </h3>

        <p className="mt-0.5 text-[12px] leading-5 text-[#7183A3]">
          {marks}% in {exam} · {trendDescription} from{" "}
          {previousAssessment} · attendance {attendance}%,{" "}
          {attendance < 75 ? "below" : "meeting"} the{" "}
          {75}% threshold.
        </p>
      </div>
    </section>
  );
};

export default StudentStatusCard;
