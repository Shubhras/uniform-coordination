"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { LuPalette, LuRocket } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FiDollarSign } from "react-icons/fi";

const bottomCards = [
  {
    img: "/img/table-form/themes/theme1.png",
    title: "Warm Elegance",
    desc: "Romantic whites and ivories for your special day",
  },
  {
    img: "/img/table-form/themes/theme2.png",
    title: "Olive Chic",
    desc: "Modern natural tones with sophisticated greenery",
  },
  {
    img: "/img/table-form/themes/theme3.png",
    title: "Classy Corporate",
    desc: "Modern natural tones with sophisticated greenery",
  },
];

/**
 * UniformBusinessEnquiry Component
 * 
 * Features showcase section detailing space coordination advantages and responsive slider for table themes.
 * 
 * @param {Object} props
 * @param {Array} [props.tableThemes=[]] - Array of theme objects.
 */
const UniformBusinessEnquiry = ({ tableThemes = [] }) => {
  const [cardsPerView, setCardsPerView] = useState(3);
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const cards = useMemo(() => {
    return tableThemes.map((item) => ({
      img: item.image,
      title: item.title,
      desc: item.description,
    }));
  }, [tableThemes]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1440) {
        setCardsPerView(4);      // xl / large desktop
      } else if (width >= 1280) {
        setCardsPerView(3);      // lg desktop
      } else if (width >= 1024) {
        setCardsPerView(2);      // laptop
      } else if (width >= 768) {
        setCardsPerView(2);      // tablet
      } else if (width >= 640) {
        setCardsPerView(2);      // large mobile
      } else {
        setCardsPerView(1);      // small mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Navigates theme carousel forward.
   */
  const handleNext = () => {
    setIndex((prev) =>
      prev + cardsPerView >= (cards.length || bottomCards.length) ? 0 : prev + 1
    );
  };

  /**
   * Navigates theme carousel backward.
   */
  const handlePrev = () => {
    setIndex((prev) =>
      prev === 0 ? Math.max(0, (cards.length || bottomCards.length) - cardsPerView) : prev - 1
    );
  };

  /**
   * Redirects to Browse by Theme catalog.
   */
  const handleThemeClick = () => {
    router.push("/browse-by-theme");
  };

  return (
    <section className="w-full bg-white mx-auto px-5 md:px-8 lg:px-12">
      <h2 className="text-center text-3xl font-semibold text-[#402936] pt-14">
        Why Choose KIREIZ SPACE
      </h2>
      <div className="mt-10 grid gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[
          {
            icon: LuPalette,
            title: "Visual Design Tools",
            desc: "See your designs come to life",
          },
          {
            icon: FaArrowTrendUp,
            title: "Professional Results",
            desc: "Industry-specific solutions",
          },
          {
            icon: FiDollarSign,
            title: "Bulk Pricing & Delivery",
            desc: "Rental options & bulk pricing",
          },
          {
            icon: LuRocket,
            title: "Custom Branding",
            desc: "From design to delivery",
          },
        ].map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className="bg-[#E8B4A924] rounded-xl shadow-sm px-4 py-5 text-left hover:shadow-md transition"
            >
              <Icon
                size={30}
                className="mb-3 text-[#A0522D]"
              />
              <p className="text-black font-semibold text-sm">
                {item.title}
              </p>
              <p className="text-[#7A7A7A] text-xs mt-1">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
      <div className="w-full h-px bg-gray-300 my-14" />
      <h2 className="text-center text-3xl font-semibold text-[#402936]">
        Explore Our Table Themes
      </h2>
      <div className="flex justify-end gap-3 mt-6 mr-6">
        <FiArrowLeft onClick={handlePrev} size={25} className="text-lg cursor-pointer text-[#5D4A4A]" />
        <FiArrowRight onClick={handleNext} size={25} className="text-lg text-[#5D4A4A] ml-8 cursor-pointer" />
      </div>
      <div className="mt-6 overflow-hidden pb-12">
        <div className="flex gap-6 transition-transform duration-500 ease-in-out justify-center">
          {cards
            .slice(index, index + cardsPerView)
            .map((item, i) => (
              <div
                key={i}
                className="relative flex-none overflow-hidden shadow-md w-full p-3 rounded-tl-4xl rounded-br-4xl bg-[#FEF3C7] hover:bg-[#A0522D] transition-all duration-200 group"
                style={{
                  maxWidth: `calc(${100 / cardsPerView}% - ${((cardsPerView - 1) * 24) / cardsPerView}px)`,
                }}
              >
                <div className="relative w-full h-[300px] overflow-hidden rounded-tl-4xl rounded-br-4xl">
                  <Image
                    src={item.img || "/img/table-form/themes/theme1.png"}
                    alt={item.title || "Category Image"}
                    fill
                    className="object-cover"
                    priority={i === 0}
                    unoptimized
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
                    <button
                      className="w-full py-3 border border-white text-lg font-medium text-white group-hover:text-black bg-[#A0522D] rounded-xl cursor-pointer group-hover:bg-[#FEF3C7] transition-all duration-200"
                      onClick={handleThemeClick}
                    >
                      Try This Theme
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-[#1C2C56] group-hover:text-white text-[18px] font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280] group-hover:text-white text-[14px] mt-2 leading-tight line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default UniformBusinessEnquiry;

