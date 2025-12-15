"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AuthButtons = () => {
  const [active, setActive] = useState("login");
  const router = useRouter();

  const handleClick = (type) => {
    setActive(type);
    if (type === "login") {
      router.push("/auth/sign-in-split");
    } else {
      router.push("/auth/sign-up-split");
    }
    console.log('clickeddddddddddd');
    
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
          Login
        </button>

        {/* SIGNUP */}
        <button
          onClick={() => handleClick("signup")}
          className={`
            px-4 py-1.5 font-medium text-sm rounded-r-full rounded-l-full transition-all cursor-pointer
            ${active === "signup" ? "bg-white text-[#1C2C56]" : "bg-transparent text-white"}
          `}
        >
          Signup
        </button>
      </div>
    </div>
  );
};

export default AuthButtons;
