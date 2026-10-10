import ProfileIcon from "../ProfileIcon";
import NotificationButton from "./NotificationButton";

const Header = () => {
    const notificationCount = 5;
    return (
        <div className="flex justify-between bg-white p-5">
            <h2 className="font-semibold text-[22px] lg:text-[15px] text-navy font-inter"> 3G <span className="hidden lg:inline"> — Student Success & Talent Tracking</span> </h2>
            {/* profile & notification div */}
            <div className="flex gap-2.5">
                <NotificationButton count={notificationCount}></NotificationButton>
                <ProfileIcon/>
            </div>
        </div>
    );
};

export default Header;