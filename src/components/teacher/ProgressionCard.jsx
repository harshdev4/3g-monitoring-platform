"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ProgressionCard = ({
  subtitle,
  labels,
  series,
  footer,
}) => {
  const chartData = {
    labels,

    datasets: series.map((item) => ({
      label: item.label,
      data: item.data,

      borderColor: item.color,
      backgroundColor: item.color,

      borderWidth: 1.5,

      pointRadius: 2,
      pointHoverRadius: 4,

      tension: 0.35,

      fill: false,
    })),
  };

  const chartOptions = {
    responsive: true,

    // Important:
    // The chart gets its size from the parent container.
    maintainAspectRatio: false,

    animation: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: true,
        position: "top",

        labels: {
          boxWidth: 8,
          boxHeight: 8,
          padding: 10,

          font: {
            size: 10,
          },
        },
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

    scales: {
      x: {
        offset: false,

        ticks: {
          color: "#71809A",

          font: {
            size: 10,
          },

          maxRotation: 0,
          minRotation: 0,

          padding: 4,
        },

        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: false,

        ticks: {
          color: "#71809A",

          font: {
            size: 10,
          },

          padding: 6,
        },

        grid: {
          color: "#EEF1F5",
        },
      },
    },
  };

  return (
    <div className="min-w-0 rounded-lg border border-[#E5EAF1] bg-white p-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[#102746]">
          3G Progression
        </h3>

        <p className="mt-1 text-xs text-[#71809A]">
          {subtitle}
        </p>
      </div>

      {/* Dedicated responsive chart container */}
      <div className="relative mt-4 h-[190px] w-full min-w-0">
        <Line
          data={chartData}
          options={chartOptions}
        />
      </div>

      {footer && (
        <p className="mt-3 border-t border-[#EEF1F5] pt-3 text-[11px] text-[#8A98AB]">
          {footer}
        </p>
      )}
    </div>
  );
};

export default ProgressionCard;