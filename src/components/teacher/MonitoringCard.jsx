import Link from "next/link";

const MonitoringCard = ({
  title,
  items,
  actionLabel,
  actionHref,
}) => {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h3 className="text-base font-semibold text-[#102746]">
        {title}
      </h3>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#334155]">
                  {item.value} {item.label}
                </p>

                <p className="mt-1 text-xs text-[#8A98AB]">
                  {item.description}
                </p>
              </div>

              <span className="text-xs font-medium text-[#10B981]">
                {item.status}
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF1F5]">
              <div
                className="h-full rounded-full bg-[#2563EB]"
                style={{
                  width: item.status,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-block text-xs font-medium text-[#2563EB] hover:underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default MonitoringCard;