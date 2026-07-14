"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const HeroContent = () => {
  const router = useRouter();

  const handleStartDesigning = () => {
    router.push("/kireiz-form");
  };

  return (
    <section className="w-full bg-white mx-auto px-5 md:px-8 lg:px-12 pt-24 md:pt-0">
      <div
        className="
          mx-auto
          flex flex-col md:flex-row 
          gap-8 md:gap-10
          md:h-[700px]
        "
      >
        {/* LEFT SECTION */}
        <div
          className="
            flex flex-col 
            justify-center 
            space-y-3
            max-w-lg
          "
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1C2C56] leading-[1.1] tracking-tight">
            Design <br />
            Professional <br />
            Uniforms for <br />
            Every Industry
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed">
            KIREIZ offers powerful tools for businesses to design custom
            uniforms and for anyone to create stunning table settings for any
            event.
          </p>

          <button
            onClick={handleStartDesigning}
            className="px-6 py-2 bg-[#1C2C56] text-white rounded-md text-sm md:text-base hover:bg-[#162347] transition-all w-fit"
          >
            Start Designing
          </button>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex justify-center md:justify-end">
          <Image
            src="/img/kireiz-form/hero/uniform-home-page.png"
            width={925}
            height={630}
            alt="Uniform Designs"
            className="w-full max-w-[420px] md:max-w-none h-auto md:h-full object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroContent;
