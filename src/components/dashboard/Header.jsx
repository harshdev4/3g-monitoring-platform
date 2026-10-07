import NotificationButton from "./NotificationButton";
import { ChevronDown } from "lucide-react";

const Header = () => {
    const notificationCount = 5;
    return (
        <div className="flex justify-between bg-white p-5">
            <h2 className="font-semibold text-[22px] lg:text-[15px] text-navy font-inter"> 3G <span className="hidden lg:inline"> — Student Success & Talent Tracking</span> </h2>
            {/* profile & notification div */}
            <div className="flex gap-2.5">
                <NotificationButton count={notificationCount}></NotificationButton>
                <div className="flex gap-1 items-start relative cursor-pointer" title="Prof. Harsh Sharma">
                    <div className="rounded-full bg-navy w-fit px-2 p-1.75 text-white font-inter text-[11px]">
                        <h4>HS</h4>
                    </div>
                    <div className="hidden lg:block">
                        <h3 className="text-navy font-semibold text-[12px]">Prof. Harsh Sharma</h3>
                        <p className="text-[#66758D] text-[10px]">Faculty · Computer Applications</p>
                    </div>
                    <div className="relative h-4 w-4">
                        <ChevronDown className="absolute top-[50%] right-0 h-4 w-4 text-[#66758D] cursor-pointer"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;