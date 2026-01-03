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
const navMenu = [
  { title: "Home", value: "home", to: "home", url: "/table-form" },
  { title: "Table Design", value: "tableDesign", to: "tableDesign", url: "/" },
  { title: "Browse by Color", value: "browseByColor", to: "browseByColor", url: "/browse-by-color" },
  { title: "Browse by Theme", value: "browseByTheme", to: "browseByTheme", url: "/browse-by-theme" },
];

const HaederPage = ({ toggleMode, mode }) => {
  const { session } = useCurrentSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter()
  const handleRedirectHome = () => {
    router.push('/table-form')
  }
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#8A5A75]">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
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
    </header>
  );
};

export default HaederPage;
