"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const AuthButtons = () => {
  const t = useTranslations("header");
  const [active, setActive] = useState("login");
  const router = useRouter();

  const handleClick = (type) => {
    setActive(type);
    if (type === "login") {
      router.push("/sign-in");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center border border-white rounded-full overflow-hidden">
        {/* LOGIN */}
        <button
          onClick={() => handleClick("login")}
          className={`
            px-5 py-1.5 font-medium text-sm rounded-r-full rounded-l-full transition-all cursor-pointer
            ${active === "login" ? "bg-white text-[#1C2C56]" : "bg-transparent text-white"}
          `}
        >
          {t("login")}
        </button>

        {/* SIGNUP */}
        <button
          onClick={() => handleClick("signup")}
          className={`
            px-4 py-1.5 font-medium text-sm rounded-r-full rounded-l-full transition-all cursor-pointer
            ${active === "signup" ? "bg-white text-[#1C2C56]" : "bg-transparent text-white"}
          `}
        >
          {t("signup")}
        </button>
      </div>
    </div>
  );
};

export default AuthButtons;
