"use client";
import { useState } from "react";
import NavList from "./NavList";
import Drawer from "@/components/ui/Drawer";
import Image from "next/image";
import Link from "next/link";
import { TbMenu2 } from "react-icons/tb";
import NavOtherList from "./NavOtherList";
import AuthButtons from "./AuthButtons";

const navMenu = [
  { title: "Home", value: "home", to: "home" },
  { title: "Uniform Design", value: "uniformDesign", to: "uniformDesign" },
  { title: "Blog", value: "blog", to: "blog" },
  { title: `FAQ's`, value: "faq", href: "/guide/documentation/introduction" },
];

const Navigation = ({ toggleMode, mode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="w-full fixed inset-x-0 top-0 z-[50]"
      style={{ backgroundColor: "#1C2C56" }}
    >
      <div className="flex flex-row items-center justify-between py-3 max-w-7xl mx-auto px-4 w-full">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex lg:hidden items-center gap-4 text-white"
        >
          <TbMenu2 size={24} />
        </button>

        {/* Drawer */}
        <Drawer
          title="Navigation"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onRequestClose={() => setIsOpen(false)}
          width={250}
          placement="left"
        >
          <div className="flex flex-col gap-4 text-white">
            <NavList onTabClick={() => setIsOpen(false)} tabs={navMenu} />
          </div>
        </Drawer>

        {/* Logo */}
        <Link href="/">
          <Image
            src="/img/logo/uniform-nav-logo.png"
            width={80}
            height={0}
            alt="logo"
          />
        </Link>

        {/* Center navigation items */}
        <div className="lg:flex flex-row flex-1 absolute inset-0 hidden items-center justify-center text-sm font-medium text-white">
          <NavList tabs={navMenu} />
        </div>

        {/* Right side icons + login/signup */}
        <div className="hidden lg:flex items-center gap-6 text-white">
          {/* Login + Signup buttons */}
          <AuthButtons />

          {/* Notification + Profile dropdown */}
          <NavOtherList />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
