"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { HiBadgeCheck } from "react-icons/hi";
import HaederPage from "../../header/HaederPage";
import { verifyEmail } from "@/services/AuthService";
import { useState, useEffect } from "react";
import Spinner from "@/components/ui/Spinner";
const AccountVerifiedPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const userId = searchParams.get("user_id");
    const email = searchParams.get("email");

    const [loading, setLoading] = useState(true);

    const verifyUserEmail = async () => {
        try {
            if (!userId) {
                setLoading(false);
                return;
            }

            const res = await verifyEmail({
                user_id: userId,
                is_verify: true,
            });

            if (res?.status || res?.data?.success) {
                //router.push("/account-verified-page")
            }
        } catch (error) {
            console.error("Email verification failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyUserEmail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return (
        <>
            <HaederPage />
            {/* FIXED OVERLAY TO BLOCK CLICKS */}
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4">
                {/* CARD */}
                <div className="bg-white rounded-xl px-10 py-12 text-center shadow-lg w-full max-w-2xl relative">

                    {/* LOGO + BRAND */}
                    <div className="flex items-center gap-3 mb-10">
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
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <Spinner size={40} customColorClass="text-[#1C2C56]" />
                            <span className="text-[#1C2C56] text-lg font-medium">Verifying your account, please wait...</span>
                        </div>
                    ) : (
                        <>
                            {/* VERIFIED MESSAGE */}
                            <div className="mx-auto flex items-center justify-center text-[#25455F] text-2xl font-semibold text-center mb-10">
                                <span className="inline-flex items-center gap-2">
                                    Your account has been successfully verified <HiBadgeCheck size={30} className="text-[#1C2C56]" />
                                </span>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    variant="solid"
                                    className="bg-[#C7D3E6] text-[#1C2C56] hover:bg-[#B5C4DA] px-8 w-full sm:w-auto font-medium"
                                    onClick={() => router.push("/kireiz-form")}
                                >
                                    Go to Dashboard
                                </Button>

                                <Button
                                    variant="solid"
                                    className="bg-[#1C2C56] hover:bg-[#162345] text-white px-8 w-full sm:w-auto font-medium"
                                    onClick={() => router.push("/kireiz-form")}
                                >
                                    Start Designing Uniform
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default AccountVerifiedPage;
