
import { Info } from "lucide-react";

const StudentStatusCard = ({
  subject,
  marks,
  maxMarks,
  exam,
  trend,
  previousAssessment,
  attendance,
}) => {
  const numericMarks = Number(marks);
  const numericMaxMarks = Number(maxMarks);
  const numericAttendance = Number(attendance);
  const numericTrend = Number(trend);

  const validMarks =
    marks !== null &&
    marks !== undefined &&
    marks !== "" &&
    Number.isFinite(numericMarks);

  const validMaxMarks =
    maxMarks !== null &&
    maxMarks !== undefined &&
    maxMarks !== "" &&
    Number.isFinite(numericMaxMarks) &&
    numericMaxMarks > 0;

  const validAttendance =
    attendance !== null &&
    attendance !== undefined &&
    attendance !== "" &&
    Number.isFinite(numericAttendance);

  const validTrend =
    trend !== null &&
    trend !== undefined &&
    trend !== "" &&
    Number.isFinite(numericTrend);

  const percentage =
    validMarks && validMaxMarks
      ? (numericMarks / numericMaxMarks) * 100
      : validMarks
        ? numericMarks
        : null;

  const needsAttention =
    (percentage !== null && percentage < 40) ||
    (validAttendance && numericAttendance < 75) ||
    (validTrend && numericTrend <= -5);

  const title = needsAttention
    ? `Needs attention${subject ? ` in ${subject}` : ""}`
    : "Student is on track";

  const trendDescription = validTrend
    ? numericTrend < 0
      ? `decline of ${Math.abs(numericTrend)} points`
      : `improvement of ${numericTrend} points`
    : null;

  const assessmentDescription =
    percentage !== null
      ? `${percentage.toFixed(1)}%`
      : "Marks unavailable";

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
          {assessmentDescription}
          {exam ? ` in ${exam.toUpperCase()}` : ""}
          {trendDescription && previousAssessment
            ? ` · ${trendDescription} from ${previousAssessment}`
            : ""}
          {validAttendance
            ? ` · attendance ${numericAttendance.toFixed(2)}%, ${
                numericAttendance < 75 ? "below" : "meeting"
              } the 75% threshold.`
            : " · Attendance data unavailable."}
        </p>
      </div>
    </section>
  );
};

export default StudentStatusCard;
