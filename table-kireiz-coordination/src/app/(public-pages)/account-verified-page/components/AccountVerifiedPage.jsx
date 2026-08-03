"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { HiBadgeCheck } from "react-icons/hi";
import HaederPage from "../../header/HaederPage";
import { verifyEmail } from "@/services/AuthService";
import { useState, useEffect } from "react";
import Spinner from "@/components/ui/Spinner";

/**
 * AccountVerifiedPage Component
 * 
 * Renders the account email verification status screen. 
 * Extracts query parameters (`user_id`, `email`), performs the verification API call,
 * and provides navigation options upon completion.
 */
const AccountVerifiedPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const userId = searchParams.get("user_id");
    const email = searchParams.get("email");

    const [loading, setLoading] = useState(true);

    /**
     * Executes the email verification request using the user ID from search parameters.
     */
    const verifyUserEmail = async () => {
        try {
            if (!userId) {
                setLoading(false);
                return;
            }

            await verifyEmail({
                user_id: userId,
                is_verify: true,
            });
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
            {/* Modal overlay to block clicks during verification */}
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4">
                {/* Verification Status Card */}
                <div className="bg-white rounded-xl px-10 py-12 text-center shadow-lg w-full max-w-2xl relative">

                    {/* Logo & Greeting */}
                    <div className="flex items-center gap-3 mb-10">
                        <Image
                            src="/img/logo/logo-table.png"
                            alt="Table Form"
                            width={60}
                            height={60}
                        />
                        <h2 className="text-xl font-semibold text-[#583D4C]">
                            Welcome User!
                        </h2>
                    </div>

                    {loading ? (
                        /* Loading Spinner State */
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <Spinner size={40} customColorClass="text-[#A0522D]" />
                            <span className="text-[#A0522D] text-lg font-medium">
                                Verifying your account, please wait...
                            </span>
                        </div>
                    ) : (
                        /* Verification Success State */
                        <>
                            <div className="mx-auto flex items-center justify-center text-[#583D4C] text-2xl font-semibold text-center mb-10">
                                <span className="inline-flex items-center gap-2">
                                    Your account has been successfully verified{" "}
                                    <HiBadgeCheck size={30} className="text-[#A0522D]" />
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    variant="solid"
                                    className="bg-[#FBF4F3] text-[#A0522D] hover:bg-[#FBF4F3] px-8 w-full sm:w-auto font-medium"
                                    onClick={() => router.push("/table-form")}
                                >
                                    Go to Dashboard
                                </Button>
                                <Button
                                    variant="solid"
                                    className="bg-[#A0522D] hover:bg-[#8B4513] text-white px-8 w-full sm:w-auto font-medium"
                                    onClick={() => router.push("/table-form")}
                                >
                                    Start Designing Table
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

