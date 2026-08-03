"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * HeroContent Component
 * 
 * Top hero banner section with call-to-action buttons navigating to Browse by Color and Browse by Theme pages.
 */
const HeroContent = () => {
  const router = useRouter();
  return (
    <section className="relative w-full min-h-[520px] md:min-h-[620px] overflow-hidden mt-13">
      {/* BACKGROUND GRADIENT */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(104.14deg, rgba(232, 180, 169, 0.2) 8.75%, #FFFFDD 100.72%, rgba(255, 255, 255, 0) 100.72%)",
        }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 min-h-[520px] md:min-h-[620px]">
        {/* LEFT CONTENT */}
        <div className="
          border-r border-b border-white
          rounded-br-[100px] md:rounded-br-[200px]
          h-full
          pb-3 md:pb-4
          pr-3 md:pr-4
        ">
          <div className="
            border-r border-b border-[#A0522D]
            rounded-br-[100px] md:rounded-br-[200px]
            h-full
          ">
            <div className="
              flex flex-col justify-center
              px-4 sm:px-6 md:px-8 lg:px-12
              py-14 sm:py-16 md:py-20
            ">
              <h1 className="
                text-[30px] sm:text-[36px] md:text-[50px] lg:text-[60px]
                font-bold
                text-[#3B2B2F]
                leading-[1.15]
              ">
                Design your <br />
                special day <br />
                with calm <br />
                and joy.
              </h1>

              <div className="flex flex-wrap gap-4 mt-8 md:mt-10">
                <button className="px-6 py-3 rounded-md border border-white bg-[#A0522D] text-white text-sm cursor-pointer hover:bg-[#8B4513] transition-colors" onClick={() => router.push("/browse-by-color")}>
                  Browse by Color
                </button>
                <button className="px-6 py-3 rounded-md border border-white bg-[#EEC04F] text-sm text-white cursor-pointer hover:bg-[#dcae3d] transition-colors" onClick={() => router.push("/browse-by-theme")}>
                  Browse by Theme
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE AREA */}
        <div className="
          border-l border-t border-[#A0522D]
          rounded-tl-[100px] md:rounded-tl-[200px]
          h-[260px] sm:h-[320px] md:h-full
          pt-3 md:pt-4
          pl-3 md:pl-4
          md:mt-4
        ">
          <div className="
            border-l border-t border-white
            rounded-tl-[100px] md:rounded-tl-[200px]
            h-full
            relative
            overflow-hidden
          ">
            <Image
              src="/img/table-form/themes/theme2.png"
              alt="Table Design"
              fill
              priority
              className="object-cover rounded-tl-[100px] md:rounded-tl-[200px] pt-4 pl-4"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroContent;

