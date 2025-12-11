"use client";

import Notification from "@/components/template/Notification";
import UserProfileDropdown from "@/components/template/UserProfileDropdown";

const NavOtherList = () => {
  return (
    <div className="flex items-center gap-4 text-white">
      <Notification />
      <UserProfileDropdown hoverable={false} />
    </div>
  );
};

export default NavOtherList;
