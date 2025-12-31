"use client";

import Image from "next/image";

const HeroContent = () => {
  return (
    <section className="relative w-full min-h-[620px] overflow-hidden mt-13">

      {/* BACKGROUND GRADIENT */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(104deg, rgba(232,180,169,0.25) 0%, rgba(255,182,163,0.55) 100%)",
        }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-[620px]">

        {/* LEFT CONTENT */}
        <div className="flex flex-col justify-center px-10 sm:px-16 lg:px-28">
          <h1 className="text-[42px] md:text-[50px] lg:text-[60px] font-bold text-[#3B2B2F] leading-[1.12]">
            Design your <br />
            special day <br />
            with calm <br />
            and joy.
          </h1>

          <div className="flex gap-4 mt-10">
            <button className="px-6 py-3 rounded-md bg-[#C98B8B] text-white text-sm">
              Browse by Color
            </button>
            <button className="px-6 py-3 rounded-md border border-[#C98B8B] text-sm">
              Browse by Theme
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE AREA */}
        <div className="relative w-full h-full">

          {/* CURVE */}
          <svg
            viewBox="0 0 600 1000"
            preserveAspectRatio="none"
            className="absolute left-[-120px] top-0 h-full w-[260px]"
          >
            <path
              d="
                M300,0
                C120,200 120,800 300,1000
                L0,1000
                L0,0
                Z
              "
              fill="rgba(255,255,255,0.35)"
            />
          </svg>

          {/* IMAGE */}
          <Image
            src="/img/table-form/hero-image.png"
            alt="Table Design"
            fill
            priority
            className="object-cover"
          />
        </div>

      </div>
    </section>
  );
};

export default HeroContent;
