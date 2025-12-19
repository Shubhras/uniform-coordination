"use client";
import { useState } from "react";
import NavList from "./NavList";
import Drawer from "@/components/ui/Drawer";
import Image from "next/image";
import Link from "next/link";
import { TbMenu2 } from "react-icons/tb";
import NavOtherList from "./NavOtherList";
import AuthButtons from "./AuthButtons";
import { useRouter } from 'next/navigation'
const navMenu = [
  { title: "Home", value: "home", to: "home", url: "/kireiz-form" },
  { title: "Uniform Design", value: "uniformDesign", to: "uniformDesign", url: "/dashboards/uniform-3d-design" },
  { title: "Blog", value: "blog", to: "blog", url: "/blog" },
  { title: `FAQ's`, value: "faq", to: "faq", url: "/faq" },
];

const Navigation = ({ toggleMode, mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLoginUser, setActiveLoginUser] = useState("login");
   const router = useRouter()
  const handleRedirectHome= () => {
        router.push('/kireiz-form')
    }
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#1C2C56]">
      {/* <div className="w-full px-4 sm:px-6 lg:px-15"> */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex h-14 items-center justify-between">
          {/* Mobile Menu Button */}
          {/* <button
            onClick={() => setIsOpen(true)}
            className="flex lg:hidden items-center text-white"
          >
            <TbMenu2 size={24} />
          </button> */}

          {/* Mobile Drawer */}
          <Drawer
            title="Navigation"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onRequestClose={() => setIsOpen(false)}
            width={260}
            placement="left"
          >
            <div className="flex flex-col gap-4 text-white ">
              <NavList onTabClick={() => setIsOpen(false)} tabs={navMenu} />
            </div>
          </Drawer>
          {/* Logo */}
          {/* <Link href="/" className="flex items-center">
            <Image
              src="/img/logo/uniform-nav-logo.png"
              width={70}
              height={40}
              alt="logo"
              priority
            />
          </Link> */}
          <Image
              src="/img/logo/uniform-nav-logo.png"
              width={70}
              height={40}
              alt="logo"
              priority
               onClick={handleRedirectHome}
               className="cursor-pointer"
            />
          {/* Desktop Navigation */}
          <nav className="flex flex-1 items-center justify-center text-sm font-medium text-white">
            <NavList tabs={navMenu} />
          </nav>
          {/* Right Side (Desktop only) */}
          <div className="items-center gap-8 text-white">
            {activeLoginUser !== "login" ? <AuthButtons /> : <NavOtherList />}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navigation;
