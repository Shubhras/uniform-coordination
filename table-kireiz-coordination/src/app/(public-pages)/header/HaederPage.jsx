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
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { IoClose } from "react-icons/io5";
const navMenu = [
  { title: "Home", value: "home", to: "home", url: "/table-form" },
  // { title: "Table Design", value: "tableDesign", to: "tableDesign", url: "/" },
  { title: "Browse by Color", value: "browseByColor", to: "browseByColor", url: "/browse-by-color" },
  { title: "Browse by Theme", value: "browseByTheme", to: "browseByTheme", url: "/browse-by-theme" },
  { title: "Canvas", value: "canvas", to: "canvas", url: "/dashboards/uniform-3d-design" },
  { title: "Uniform", value: "uniform", url: "http://localhost:7000/kireiz-form" },
  // { title: "Faq", value: "faq", to: "faq", url: "/faq" },
  // { title: "Blog", value: "blog", to: "blog", url: "/blog" },
];

const HaederPage = ({ toggleMode, mode }) => {
  const { session } = useCurrentSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter()
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#E8B4A9]">
      <div className="mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex h-14 items-center justify-between">

          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger (sm & md only) */}
            <button
              className="lg:hidden text-white text-2xl transition-transform duration-200"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <IoClose /> : <TbMenu2 />}
            </button>


            {/* Logo */}
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

          {/* CENTER: Desktop Nav */}
          <nav className="hidden lg:flex flex-1 justify-center text-sm font-medium text-white">
            <NavList tabs={navMenu} />
          </nav>

          {/* RIGHT: Auth or Profile (ALL screens) */}
          <div className="flex items-center gap-4 text-white">
            {!session?.user?.email && <AuthButtons />}
            {session?.user?.email && <NavOtherList />}
          </div>
        </div>
      </div>

      {/* Drawer: Navigation only */}
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



{/* <header className="fixed inset-x-0 top-0 z-50 bg-[#E8B4A9]">
  <div className="w-full mx-auto px-5 md:px-8 lg:px-12">
    <div className="flex h-14 items-center justify-between">
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
      <Image
        src="/img/logo/logo-table-footer.png"
        width={70}
        height={40}
        alt="logo"
        priority
        onClick={handleRedirectHome}
        className="cursor-pointer"
      />
      <nav className="flex flex-1 items-center justify-center text-sm font-medium text-white">
        <NavList tabs={navMenu} />
      </nav>
      <div className="items-center gap-8 text-white">
        {session?.user?.email == undefined && (<AuthButtons />)}
        {session?.user?.email && (<NavOtherList />)}
      </div>
    </div>
  </div>
</header> */}
