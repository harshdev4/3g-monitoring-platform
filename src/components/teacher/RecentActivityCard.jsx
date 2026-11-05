const RecentActivityCard = ({ activities = [] }) => {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h3 className="text-base font-semibold text-[#102746]">
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <p className="mt-4 text-sm text-[#8A98AB]">
          No action or evidence activity has been recorded yet.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-[#EEF1F5]">
          {activities.map((activity) => {
            const occurredAt = new Date(activity.occurred_at);
            const dateText = Number.isNaN(occurredAt.getTime())
              ? ""
              : occurredAt.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

            return (
              <div
                key={`${activity.activity_type}-${activity.id}`}
                className="py-3 first:pt-0 last:pb-0"
              >
                <p className="text-[13px] font-semibold leading-5 text-[#334155]">
                  {activity.activity_type}: {activity.title}
                </p>

                <p className="mt-1 text-[12px] text-[#8A98AB]">
                  {activity.description}
                  {dateText ? ` · ${dateText}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;