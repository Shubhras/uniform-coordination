"use client";
import { useState } from "react";

const AuthButtons = () => {
  const [active, setActive] = useState("login"); 

  return (
    <div className="flex items-center">
      <div className="flex items-center border border-white rounded-full overflow-hidden">
        {/* LOGIN */}
        <button
          onClick={() => setActive("login")}
          className={`
            px-5 py-1.5 font-medium text-sm rounded-full transition-all
            ${active === "login" ? "bg-white text-[#1C2C56]" : "bg-transparent text-white"}
          `}
        >
          Login
        </button>

        {/* SIGNUP */}
        <button
          onClick={() => setActive("signup")}
          className={`
            px-5 py-1.5 font-medium text-sm rounded-r-full transition-all
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
