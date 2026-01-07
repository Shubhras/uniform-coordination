"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";
import { HiBadgeCheck } from "react-icons/hi";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/services/AuthService";
import AccountVerifiedPopup from "../../account-verified-popup/AccountVerifiedPopup";

const EmailVerificationPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const userId = searchParams.get("user_id");

    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    const maskEmail = (email) => {
        if (!email) return "";
        const [name, domain] = email.split("@");
        const firstTwo = name.slice(0, 2);
        return `${firstTwo}****@${domain}`;
    };

    const verifyUserEmail = async () => {
        try {
            if (!userId) return;

            const res = await verifyEmail({
                user_id: userId,
                is_verify: true,
            });

            if (res?.status || res?.data?.success) {
                setIsVerified(true);
            }
        } catch (error) {
            console.error("Email verification failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyUserEmail();
    }, [userId]);

    return (
        <>
            <div className="min-h-screen bg-black/40 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl px-8 py-10 text-center shadow-lg w-full max-w-xl">

                    {/* LOGO */}
                    <div className="flex items-center gap-3 mb-8">
                        <Image
                            src="/img/logo/logo-table-footer.png"
                            alt="Table Form"
                            width={60}
                            height={60}
                        />
                        {/* TITLE */}
                        <h2 className="text-xl font-semibold text-[#8a5a75]">
                            Welcome!
                        </h2>
                    </div>

                    <h2 className="text-2xl font-semibold text-[#8a5a75]">
                        Thanks for registering
                    </h2>

                    {/* VERIFY INFO */}
                    {/* 
                    <p className="text-sm text-gray-600 mt-2">
                        <span className="text-blue-600 underline">Verify Email</span>{" "}
                        starts with XYZ****@gmail.com
                    </p> 
                    */}

                    {/* NOTE */}
                    <p className="text-sm text-gray-500 mt-4">
                        Please verify your email address.{" "}
                        <span className="text-blue-600 underline cursor-pointer">
                            Click here
                        </span>
                    </p>

                    {/* VERIFIED STATUS */}
                    <div className="mt-6 text-[#8a5a75] font-semibold text-lg flex justify-center">
                        <span className="inline-flex items-center gap-1">
                            Email verified
                            <HiBadgeCheck size={24} />
                        </span>
                    </div>

                    {/* ACTION */}
                    {/*
                    <div className="mt-8 flex justify-center">
                        <Button
                            variant="solid"
                            className="bg-[#1C2C56] hover:bg-[#1C2C56] text-white px-10"
                            onClick={() => router.push("/sign-in")}
                        >
                            OK
                        </Button>
                    </div>
                    */}
                </div>
            </div>

            {/* SUCCESS POPUP */}
            <AccountVerifiedPopup
                isOpen={isVerified}
                onClose={() => setIsVerified(false)}
            />
        </>
    );
};

export default EmailVerificationPage;
