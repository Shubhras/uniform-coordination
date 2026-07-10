"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiBadgeCheck } from "react-icons/hi";
import HaederPage from "../../header/HaederPage";

const AccountVerifiedPage = () => {
    const router = useRouter();

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
                </div>
            </div>
        </>
    );
};

export default AccountVerifiedPage;
