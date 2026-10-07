const RecentActivityCard = ({
  activities,
}) => {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#102746]">
        Recent Activity
      </h3>

      <div className="mt-4 divide-y divide-[#EEF1F5]">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="py-3 first:pt-0 last:pb-0"
          >
            <p className="text-xs font-medium leading-5 text-[#334155]">
              {activity.title}
            </p>

            <p className="mt-1 text-[11px] text-[#8A98AB]">
              {activity.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityCard;