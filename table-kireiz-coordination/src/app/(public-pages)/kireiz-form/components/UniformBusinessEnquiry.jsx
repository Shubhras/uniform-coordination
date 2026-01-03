"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
const bottomCards = [
  {
    img: "/img/kireiz-form/features/uniform-card-img-one.png",
    title: "Medical & Nursing Care",
    desc: "Comfortable, functional medical uniforms",
  },
  {
    img: "/img/kireiz-form/features/uniform-card-img-two.png",
    title: "Food Service & Dining",
    desc: "Hygienic, professional kitchen & serving wear",
  },
  {
    img: "/img/kireiz-form/features/uniform-card-img-one.png",
    title: "Office & Back-End Operations",
    desc: "Professional corporate branding",
  },
  {
    img: "/img/kireiz-form/features/Frame 1430106488.png",
    title: "Medical & Nursing Care",
    desc: "Comfortable, functional medical uniforms",
  },
  {
    img: "/img/kireiz-form/features/Gemini_Generated_Image_fu0gsgfu0gsgfu0g1.png",
    title: "Medical & Nursing Care",
    desc: "Comfortable, functional medical uniforms",
  },
  {
    img: "/img/kireiz-form/features/uniform-card-img-two.png",
    title: "Food Service & Dining",
    desc: "Hygienic, professional kitchen & serving wear",
  },
  {
    img: "/img/kireiz-form/features/uniform-card-img-one.png",
    title: "Office & Back-End Operations",
    desc: "Professional corporate branding",
  },
];

const UniformBusinessEnquiry = () => {
  const [cardsPerView, setCardsPerView] = useState(3);
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1440) {
        setCardsPerView(5);      // xl / large desktop
      } else if (width >= 1280) {
        setCardsPerView(4);      // lg desktop
      } else if (width >= 1024) {
        setCardsPerView(3);      // laptop
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
    <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto bg-[#EEF3FB] rounded-tr-[120px]">

        {/* TITLE */}
        <h2 className="text-center text-3xl font-semibold text-[#1C2C56] pt-14">
          How KIREIZ Helps Your Business
        </h2>

        {/* TOP FEATURE CARDS */}
        <div
          className="
              mt-10
              grid 
              gap-4       
              sm:gap-5     
              md:gap-6    
              lg:gap-8    
              xl:gap-10    
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-4
              ml-6
              mr-6
            ">
          {[
            {
              img: "/img/kireiz-form/features/Frame.png",
              title: "Visual Design Tools",
              desc: "See your designs come to life",
            },
            {
              img: "/img/kireiz-form/features/Frame (1).png",
              title: "Professional Results",
              desc: "Industry-specific solutions",
            },
            {
              img: "/img/kireiz-form/features/Frame (2).png",
              title: "Bulk Pricing & Delivery",
              desc: "Rental options & bulk pricing",
            },
            {
              img: "/img/kireiz-form/features/Frame (3).png",
              title: "Custom Branding",
              desc: "From design to delivery",
            },

          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-5 text-left hover:shadow-md transition"
            >
              <Image
                src={item.img}
                width={40}
                height={40}
                alt={item.title}
                className="mb-3"
              />
              <p className="text-[#1C2C56] font-semibold text-sm">
                {item.title}
              </p>
              <p className="text-gray-600 text-xs mt-1">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        {/* Divider */}
        <div className="w-full h-px bg-gray-300 my-14" />
        <h2 className="text-center text-3xl font-semibold text-[#1C2C56]">
          Industry-Specific Uniform Solutions
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
           <FiArrowLeft  onClick={handlePrev} size={25} className="text-lg text-gray-600 cursor-pointer" />
           <FiArrowRight  onClick={handleNext} size={25} className="text-lg text-gray-600 ml-8 cursor-pointer" />
        </div>

        {/* INDUSTRY SLIDER */}
        <div className="mt-6 overflow-hidden pb-12  ml-6 mr-6">
          <div className="flex gap-6 transition-transform duration-500 ease-in-out justify-center">
            {bottomCards
              .slice(index, index + cardsPerView)
              .map((item, i) => (
                <div
                  key={i}
                  className="
            bg-white border border-[#E3E8F1]
            rounded-[15px] shadow-md p-4
            cursor-pointer
            w-full
            sm:w-[280px]
            md:w-[300px]
            lg:w-[320px]
          "
                  onClick={handleMedicalFormDesigning}
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-[180px] h-[200px] md:w-[200px] md:h-[220px] rounded-full overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={220}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  <h3 className="text-[#1C2C56] text-[18px] font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280] text-[14px] mt-2 leading-tight">
                    {item.desc}
                  </p>
                </div>
              ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default UniformBusinessEnquiry;
