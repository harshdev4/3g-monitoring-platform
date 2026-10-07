import {
  Users,
  UserRoundX,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const iconMap = {
  students: Users,
  risk: UserRoundX,
  growing: TrendingUp,
  stable: ShieldCheck,
};

const MetricCards = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.type] || Users;

        return (
          <div
            key={metric.label}
            className="rounded-lg border border-[#E5EAF1] bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-[#60708A]">
                {metric.label}
              </p>

              <Icon
                size={16}
                strokeWidth={1.8}
                className={metric.iconClassName}
              />
            </div>

            <p className="mt-2 text-2xl font-semibold leading-none text-[#102746]">
              {metric.value}
            </p>

            <p className="mt-2 text-xs text-[#71809A]">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;