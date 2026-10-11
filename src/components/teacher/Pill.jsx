import React from 'react'

const PILL_STYLES = {
  All: { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  Assigned: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  "In Progress": { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  "Evidence Submitted": {
    pill: "bg-blue-50 text-blue-700",
    dot: "bg-blue-600",
  },
  "Under Review": { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  Approved: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Rejected: { pill: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  Overdue: { pill: "bg-red-50 text-red-700", dot: "bg-red-500" },
  Gradual: { pill: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  Growing: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Gallant: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const FALLBACK_STYLE = {
  pill: "bg-slate-100 text-slate-600",
  dot: "bg-slate-400",
};

const SIZES = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1.5 text-[11px]",
};

const SHAPES = {
  full: "rounded-full",
  md: "rounded-md",
};

export default function Pill({
  label,
  count,
  active = false,
  onClick,
  size = "sm",
  shape = "full",
  className = "",
}) {
  const tone = PILL_STYLES[label] ?? FALLBACK_STYLE;
  const isInteractive = typeof onClick === "function";

  const classes = [
    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold transition",
    SIZES[size] ?? SIZES.sm,
    SHAPES[shape] ?? SHAPES.full,
    tone.pill,
    isInteractive &&
      (active ? "ring-1 ring-current" : "opacity-70 hover:opacity-100"),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
      />
      {label}
      {count !== undefined && (
        <span className="font-medium opacity-70">· {count}</span>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={classes}
      >
        {content}
      </button>
    );
  }

  return <span className={classes}>{content}</span>;
}