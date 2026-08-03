"use client";

import UserProfileDropdown from "@/components/template/UserProfileDropdown";

/**
 * NavOtherList Component
 * 
 * Container for user profile dropdown menu in header when authenticated.
 */
const NavOtherList = () => {
  return (
    <div className="flex items-center gap-4 text-white">
      <UserProfileDropdown hoverable={false} />
    </div>
  );
};

export default NavOtherList;

