"use client";

import Image from "next/image";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useRouter } from "next/navigation";

const HeroContent = ({ data }) => {
  const { session } = useCurrentSession();
  const router = useRouter();

  const userName = session?.user?.name || session?.user?.email || "Admin";

  return (
    <section className="relative w-full px-5 md:px-8 lg:px-12 py-10 overflow-hidden">
      {/* OUTER BACKGROUND GRADIENT */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #E9D5FF 0%, #DBEAFE 50%, #E0E7FF 100%)",
        }}
      />

      {/* INNER CARD */}
      <div className="relative z-10 bg-white rounded-xl shadow-lg p-5 md:p-8 flex flex-col gap-6">
        {/* TOP BUTTONS */}
        <div className="flex flex-wrap gap-3">
          <button
            className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => router.push("/products?tab=Products")}
          >
            Upload Product
          </button>

          <button
            className="border border-[#CBD5E1] text-[#1E293B] px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => router.push("/products?tab=Template")}
          >
            Create Template
          </button>

          <button className="border border-[#CBD5E1] text-[#1E293B] px-4 py-2 rounded-md text-sm font-medium">
            View Orders
          </button>

          <button
            className="border border-[#CBD5E1] text-[#1E293B] px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => router.push("/profile")}
          >
            View Profile
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* LEFT TEXT */}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#1E293B]">
              Welcome to Dashboard! {userName}!
            </h1>

            <p className="mt-2 text-sm text-[#64748B] max-w-md">
              You have {data?.Pending_quotes?.total ?? 0} pending quotes. Check
              your dashboard for the latest updates.
            </p>
          </div>

          {/* RIGHT EMOJI (LG ONLY absolute) */}
          <div className="flex justify-center lg:absolute lg:right-5 lg:bottom-0">
            <Image
              src="/img/admin/emoji.png"
              alt="Dashboard Emoji"
              width={300}
              height={220}
              priority
              className="object-contain w-[200px] lg:w-[300px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroContent;
