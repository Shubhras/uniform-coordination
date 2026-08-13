"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import NavList from "./NavList";
import Drawer from "@/components/ui/Drawer";
import Image from "next/image";
import { TbMenu2 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import NavOtherList from "./NavOtherList";
import AuthButtons from "./AuthButtons";
import { useRouter } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";

const HeaderPage = () => {
  const t = useTranslations("header");
  const { session } = useCurrentSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navMenu = [
    { title: t("home"), value: "home", url: "/admin-form" },
    { title: t("uniformDesign"), value: "uniformDesign", url: "/dashboards/uniform-3d-design" },
    { title: t("blog"), value: "blog", url: "/blog" },
    { title: t("faq"), value: "faq", url: "/faq" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#1C2C56]">
      <div className="mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex h-14 items-center justify-between">
          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white text-2xl transition-transform duration-200"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <IoClose /> : <TbMenu2 />}
            </button>

            <Image
              src="/img/logo/uniform-nav-logo.png"
              width={70}
              height={40}
              alt="logo"
              priority
              onClick={() => router.push("/admin-form")}
              className="cursor-pointer"
            />
          </div>

          {/* CENTER: Desktop Nav */}
          <nav className="hidden lg:flex flex-1 justify-center text-sm font-medium text-white">
            <NavList tabs={navMenu} />
          </nav>

          {/* RIGHT: Auth or Profile */}
          <div className="flex items-center gap-4 text-white">
            {!session?.user?.email && <AuthButtons />}
            {session?.user?.email && <NavOtherList />}
          </div>
        </div>
      </div>

      {/* Drawer: Navigation only */}
      <Drawer
        title={t("navigation")}
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

export default HeaderPage;
