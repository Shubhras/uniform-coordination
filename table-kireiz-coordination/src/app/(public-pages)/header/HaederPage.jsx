"use client";

import { useState } from "react";
import NavList from "./NavList";
import Drawer from "@/components/ui/Drawer";
import Image from "next/image";
import { TbMenu2 } from "react-icons/tb";
import NavOtherList from "./NavOtherList";
import AuthButtons from "./AuthButtons";
import { useRouter } from 'next/navigation'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { IoClose } from "react-icons/io5";

const navMenu = [
  { title: "Home", value: "home", to: "home", url: "/table-form" },
  { title: "Browse by Color", value: "browseByColor", to: "browseByColor", url: "/browse-by-color" },
  { title: "Browse by Theme", value: "browseByTheme", to: "browseByTheme", url: "/browse-by-theme" },
  { title: "Canvas", value: "canvas", to: "canvas", url: "/dashboards/uniform-3d-design" },
];

/**
 * HaederPage Component
 * 
 * Main application header bar featuring brand logo, desktop navigation menu, mobile navigation drawer, and user auth/profile actions.
 * 
 * @param {Object} props - Component props.
 * @param {Function} props.toggleMode - Theme mode toggler callback.
 * @param {string} props.mode - Current theme mode.
 */
const HaederPage = ({ toggleMode, mode }) => {
  const { session } = useCurrentSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter()

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#E8B4A9]">
      <div className="mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex h-14 items-center justify-between">

          {/* Left: Hamburger (Mobile) & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white text-2xl transition-transform duration-200"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <IoClose /> : <TbMenu2 />}
            </button>

            <Image
              src="/img/logo/logo-table-footer.png"
              width={70}
              height={40}
              alt="logo"
              priority
              onClick={() => router.push("/table-form")}
              className="cursor-pointer"
            />
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center text-sm font-medium text-white">
            <NavList tabs={navMenu} />
          </nav>

          {/* Right: Auth Buttons or User Profile */}
          <div className="flex items-center gap-4 text-white">
            {!session?.user?.email && <AuthButtons />}
            {session?.user?.email && <NavOtherList />}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <Drawer
        title="Navigation"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRequestClose={() => setIsOpen(false)}
        width={260}
        placement="left"
      >
        <NavList
          tabs={navMenu}
          variant="drawer"
          onTabClick={() => setIsOpen(false)}
        />
      </Drawer>
    </header>
  );
};

export default HaederPage;

