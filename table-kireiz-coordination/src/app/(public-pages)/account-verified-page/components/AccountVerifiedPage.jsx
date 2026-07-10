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
                            src="/img/logo/logo-table.png"
                            alt="Table Form"
                            width={60}
                            height={60}
                        />
                        {/* TITLE */}
                        <h2 className="text-xl font-semibold text-[#583D4C]">
                            Welcome User!
                        </h2>
                    </div>

                    {/* VERIFIED MESSAGE */}
                    <div className="mx-auto flex items-center justify-center text-[#583D4C] text-2xl font-semibold text-center mb-10">
                        <span className="inline-flex items-center gap-2">
                            Your account has been successfully verified <HiBadgeCheck size={30} className="text-[#A0522D]" />
                        </span>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            variant="solid"
                            className="bg-[#FBF4F3]   text-[#A0522D] hover:bg-[#FBF4F3] px-8 w-full sm:w-auto font-medium"
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
                </div>
            </div>
        </>
    );
};

export default AccountVerifiedPage;
