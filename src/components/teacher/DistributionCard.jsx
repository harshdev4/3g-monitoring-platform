"use client";

import {
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useMemo } from "react";
import Chart from "chart.js/auto";

const DistributionCard = ({
  total,
  subtitle,
  data,
  note,
}) => {
  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: data.map((item) => item.color),
          borderWidth: 0,
          cutout: "68%",
        },
      ],
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 12,
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-[#102746]">
          3G Distribution
        </h3>

        <p className="mt-1 text-xs text-[#71809A]">
          {subtitle}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <Doughnut
            data={chartData}
            options={chartOptions}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-[#102746]">
              {total}
            </span>

            <span className="text-[10px] text-[#71809A]">
              Students
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <div>
                <p className="text-xs font-medium text-[#334155]">
                  {item.label}
                </p>

                <p className="text-[11px] text-[#8A98AB]">
                  {item.value} students · {item.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {note && (
        <p className="mt-4 border-t border-[#EEF1F5] pt-3 text-[11px] text-[#8A98AB]">
          {note}
        </p>
      )}
    </div>
  );
};

export default DistributionCard;