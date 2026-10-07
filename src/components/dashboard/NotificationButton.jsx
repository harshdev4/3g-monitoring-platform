import { Bell } from "lucide-react";

const NotificationButton = ({count}) => {

  return (
    <button
      type="button"
      className="cursor-pointer relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
      aria-label={`Notifications, ${count} unread`}
    >
      <Bell
        size={20}
        strokeWidth={1.8}
        className="text-gray-600"
      />

      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;