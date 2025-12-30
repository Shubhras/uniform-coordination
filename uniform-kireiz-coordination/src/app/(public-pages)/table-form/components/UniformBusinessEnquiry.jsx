"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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

const UniformBusinessEnquiry = () => {
  const [cardsPerView, setCardsPerView] = useState(3);
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      // if (width >= 1440) setCardsPerView(3);
      // else if (width >= 1024) setCardsPerView(2);
      // // else if (width >= 600) setCardsPerView(1);
      // else setCardsPerView(1); // ✅ REQUIRED

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



  // const handleNext = () => {
  //   setIndex((prev) =>
  //     prev + 3 >= bottomCards.length ? 0 : prev + 1
  //   );
  // };

  // const handlePrev = () => {
  //   setIndex((prev) =>
  //     prev === 0 ? bottomCards.length - 3 : prev - 1
  //   );
  // };
  const handleNext = () => {
    setIndex((prev) =>
      prev + cardsPerView >= bottomCards.length ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setIndex((prev) =>
      prev === 0 ? bottomCards.length - cardsPerView : prev - 1
    );
  };
  const handleMedicalFormDesigning = () => {
    router.push("/medical-form");
  };
  return (
    <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="">

        {/* TITLE */}
        <h2 className="text-center text-3xl font-semibold text-[#402936] pt-14">
          Why Choose KIREIZ SPACE
        </h2>

        {/* TOP FEATURE CARDS */}

        <div
          className="
    mt-10
    grid 
    gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    ml-6 mr-6
  "
        >
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
                className="
          bg-[#F8D7DA33]
          rounded-xl
          border border-[#D4A6A6]
          shadow-sm
          px-4 py-5
          text-left
          hover:shadow-md
          transition
        "
              >
                {/* ICON */}
                <Icon
                  size={30}
                  className="mb-3 text-[#8A5A75]"
                />

                {/* TEXT */}
                <p className="text-[#402936] font-semibold text-sm">
                  {item.title}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
        {/* Divider */}
        <div className="w-full h-px bg-gray-300 my-14" />
        <h2 className="text-center text-3xl font-semibold text-[#402936]">
          Explore Our Table Themes
        </h2>
        <div className="flex justify-end gap-3 mt-6 mr-6">
          {/* <button
            onClick={handlePrev}
            className="h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <FiArrowLeft size={30} className="text-lg text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <FiArrowRight className="text-lg text-gray-600" />
          </button> */}
          <FiArrowLeft onClick={handlePrev} size={25} className="text-lg cursor-pointer text-[#5D4A4A]" />
          <FiArrowRight onClick={handleNext} size={25} className="text-lg text-[#5D4A4A] ml-8 cursor-pointer" />
        </div>

        {/* INDUSTRY SLIDER */}
        <div className="mt-6 overflow-hidden pb-12 ">
          <div className="flex gap-6 transition-transform duration-500 ease-in-out justify-center ">
            {bottomCards
              .slice(index, index + cardsPerView)
              .map((item, i) => (
                <div
                  key={i}
                  className="
    relative
    overflow-hidden
    shadow-md
    cursor-pointer
    w-full
    p-3 rounded-tl-4xl rounded-br-4xl
    bg-[#F5E9DB]
    border
    border-[#D4A6A6]
  "
                  onClick={handleMedicalFormDesigning}
                >
                  {/* IMAGE */}
                  <div className="relative w-full h-[300px] overflow-hidden rounded-tl-4xl rounded-br-4xl">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />

                    {/* OVERLAY BUTTON */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
                      <button
                        className="
          w-full
          py-3
           border border-white
          text-lg
          font-medium
          text-white
          bg-[#D9B3B3]
          rounded-xl
          
        "
                      >
                        Try This Theme
                      </button>
                    </div>
                  </div>

                  {/* TEXT (UNCHANGED DATA) */}
                  <div className="p-4">
                    <h3 className="text-[#1C2C56] text-[18px] font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-[#6B7280] text-[14px] mt-2 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>

              ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default UniformBusinessEnquiry;
