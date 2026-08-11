"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * HeroContent Component.
 * Displays the hero banner for the medical category with dynamic category image, title, description, and collection link matching Figma design.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.categoryData - Category information payload (name, image, description).
 * @returns {JSX.Element} Hero banner section view.
 */
const HeroContent = ({ categoryData }) => {
  const router = useRouter();

  const dynamicImageSrc =
    categoryData?.categoryImage ||
    categoryData?.bannerImage ||
    categoryData?.heroImage ||
    categoryData?.image ||
    "/img/medical-form/hero/doctors.png";

  return (
    <section className="w-full bg-white md:px-0 lg:px-0">
      <div className="w-full bg-[#dce4f7] rounded-br-[100px] overflow-hidden">
        <div className="relative mx-auto">
          {/* ===== DESKTOP VIEW ===== */}
          <div className="hidden lg:block relative min-h-[80vh] mb-25">
            {/* LEFT WHITE CARD */}
            <div className="absolute left-0 w-[45%] z-0 -bottom-10">
              <div className="bg-gradient-to-r to-[#dce4f7] from-white rounded-tl-[60px] rounded-tr-[60px] rounded-br-[60px] px-16 py-40 shadow-[0_30px_80px_rgba(28,44,86,0.15)]">
                <h1 className="text-[#1C2C56] text-5xl font-bold leading-tight mb-4">
                  {categoryData?.categoryName || "Medical Care Uniforms"}
                </h1>
                <p className="text-[#6B7280] text-base mb-6 font-medium max-w-md">
                  {categoryData?.description ||
                    "Professional, hygienic, and comfortable uniforms for healthcare excellence"}
                </p>
                <button
                  onClick={() => router.push("/kireiz-form")}
                  className="bg-[#1C2C56] text-white px-6 py-3 rounded-md text-sm font-medium w-fit cursor-pointer hover:bg-[#152243] transition-colors"
                >
                  Browse All Collection
                </button>
              </div>
            </div>

            {/* RIGHT DYNAMIC HERO BANNER IMAGE */}
            <div className="absolute right-0 bottom-0 w-[62%] h-[80vh] z-10 overflow-hidden rounded-bl-[60px] lg:rounded-bl-[100px]">
              <img
                src={dynamicImageSrc}
                alt={categoryData?.categoryName || "Category"}
                className="w-full h-full object-cover object-center rounded-bl-[60px] lg:rounded-bl-[100px]"
              />
            </div>
          </div>

          {/* ===== MOBILE / TABLET VIEW ===== */}
          <div className="lg:hidden flex flex-col gap-6">
            <div className="relative w-full min-h-96 rounded-b-[50px] overflow-hidden">
              <Image
                src={dynamicImageSrc}
                alt={categoryData?.categoryName || "Medical Team"}
                fill
                className="object-cover object-center"
                priority
                unoptimized
              />
            </div>

            <div className="text-center px-2 pb-8">
              <h1 className="text-[#1C2C56] text-3xl md:text-4xl font-bold mb-3">
                {categoryData?.categoryName || "Medical Care Uniforms"}
              </h1>
              <p className="text-[#6B7280] text-sm md:text-base mb-5">
                {categoryData?.description ||
                  "Professional, hygienic, and comfortable uniforms for healthcare excellence"}
              </p>

              <button
                onClick={() => router.push("/kireiz-form")}
                className="bg-[#1C2C56] text-white px-6 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-[#152243] transition-colors"
              >
                Browse All Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroContent;
