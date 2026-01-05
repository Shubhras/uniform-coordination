"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";
import { HiBadgeCheck } from "react-icons/hi";
import { useRouter } from "next/navigation";

const EmailVerifiedPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl px-8 py-10 text-center shadow-lg w-full max-w-xl">

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
                    <span className="text-blue-600 underline">Verify Email</span> Starts with{" "}

                    XYZ*****01

                </p>

                {/* NOTE */}
                <p className="text-sm text-gray-500 mt-4">
                    If you didn&apos;t sign up, ignore this email{" "}
                    <span className="text-blue-600 underline cursor-pointer">
                        Click Verify Email
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
    );
};

export default EmailVerifiedPage;
