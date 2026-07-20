"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";
import { HiBadgeCheck, HiX } from "react-icons/hi";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import HaederPage from "../../header/HaederPage";

const EmailVerificatinoPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("user_id");
    const email = searchParams.get("email");

     const verifyUserEmail = async () => {
        window.open("https://mail.google.com/", "_blank");
    };;

    return (
        <>
            <HaederPage />
            {/* FIXED OVERLAY TO BLOCK CLICKS */}
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl px-8 py-10 text-center shadow-lg w-full max-w-xl relative">
                      {/* CLOSE ICON */}
                    <button 
                        onClick={() => router.push("/")} 
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    >
                        <HiX size={24} />
                    </button>

                    {/* LOGO */}
                    <div className="flex items-center gap-3 mb-8">
                        <Image
                            src="/img/logo/uniform-nav-logo.png"
                            alt="Kireiz Form"
                            width={60}
                            height={60}
                        />
                        {/* TITLE */}
                        <h2 className="text-xl font-semibold text-[#012D53]">
                            Welcome User!
                        </h2>
                    </div>

                    <h2 className="text-2xl font-semibold text-[#012D53]">
                        Thanks for registering
                    </h2>
                    {/* VERIFY INFO */}
                    <p className="text-sm text-gray-600 mt-2">
                        <span className="text-[#3B82F6] underline">Verify Email</span> Starts with{" "}
                        {(() => {
                            if (!email) return "";
                            const [name, domain] = email.split("@");
                            if (!name) return email;
                            const start = name.substring(0, 3);
                            const end = name.length > 3 ? name.substring(name.length - 2) : "";
                            const masked = `${start}*****${end}`;
                            return domain ? `${masked}@${domain}` : masked;
                        })()}
                    </p>

                    {/* NOTE */}
                    <p className="text-sm text-gray-500 mt-4">
                        Please verify your email address.{" "}
                        <span className="text-[#3B82F6] underline cursor-pointer" onClick={verifyUserEmail}>
                            Click here
                        </span>
                    </p>

                    {/* VERIFIED STATUS */}
                    <div className="mt-6 text-[#1C2C56] font-semibold text-lg flex justify-center">
                        <span className="inline-flex items-center gap-1">
                            Email Verified
                            <HiBadgeCheck size={24} />
                        </span>
                    </div>

                    {/* ACTION */}
                    {/* <div className="mt-8 flex justify-center">
                    <Button
                        variant="solid"
                        className="bg-[#1C2C56] hover:bg-[#1C2C56] text-white px-10"
                        onClick={() => router.push("/sign-in")}
                    >
                        OK
                    </Button>
                </div> */}

                </div>
            </div>
        </>
    );
};

export default EmailVerificatinoPage;
