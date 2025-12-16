"use client";

import Image from "next/image";
import { useState } from "react";
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
];

const UniformBusinessEnquiry = () => {
   const router = useRouter();
  const [index, setIndex] = useState(0);

  // const handleNext = () => {
  //   setIndex((prev) => (prev + 1) % bottomCards.length);
  // };

  // const handlePrev = () => {
  //   setIndex((prev) => (prev === 0 ? bottomCards.length - 1 : prev - 1));
  // };
  const handleNext = () => {
    setIndex((prev) =>
      prev + 3 >= bottomCards.length ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setIndex((prev) =>
      prev === 0 ? bottomCards.length - 3 : prev - 1
    );
  };
  const handleMedicalFormDesigning = () => {
    router.push("/medical-form");
  };
  return (
    <section className="w-full bg-white px-6 py-0 md:py-0">
      <div className="max-w-7xl mx-auto relative">
        {/* BACKGROUND FRAME */}
        <div className="relative w-full max-w-7xl mx-auto">
          <Image
            src="/img/kireiz-form/features/uniform-bussiness-frame111.png"
            width={1500}
            height={900}
            alt="Frame Background"
            className="w-full mx-auto object-contain pointer-events-none"
          />

          {/* CONTENT INSIDE FRAME */}
          <div className="absolute inset-0 px-6 md:px-16 pt-14 overflow-hidden">
            {/* TITLE */}
            <h2 className="text-center text-3xl md:text-3xl font-semibold text-[#1C2C56]">
              How KIREIZ Helps Your Business
            </h2>

            {/* TOP 4 CARDS – SMALLER SIZE */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
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
                  className="bg-white rounded-xl border border-gray-200 shadow px-4 py-5 text-left"
                >
                  <Image
                    src={item.img}
                    width={40}
                    height={40}
                    alt=""
                    className="mx-auto mb-2"
                  />
                  <p className="text-[#1C2C56] font-semibold text-sm">
                    {item.title}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-gray-300 mt-10 mx-auto"></div>

            {/* SECOND TITLE */}
            <h2 className="text-center text-3xl md:text-3xl mt-8 font-semibold text-[#1C2C56]">
              Industry-Specific Uniform Solutions
            </h2>

            {/* ARROWS */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={handlePrev}
                className="h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                <FiArrowLeft className="text-lg text-gray-600" />
              </button>
              <button
                onClick={handleNext}
                className="h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                <FiArrowRight className="text-lg text-gray-600" />
              </button>
            </div>
            {/* INDUSTRY-SPECIFIC CARDS — SLIDER */}
            <div className="mt-10 overflow-hidden pb-8 ">
              <div className="flex gap-4 transition-transform duration-500 ease-in-out justify-center">
                {bottomCards
                  .slice(index, index + 3)
                  .map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#E3E8F1] rounded-[15px] shadow-md p-4 pt-2 pb-4 flex-shrink-0 w-[320px] cursor-pointer"
                       onClick={handleMedicalFormDesigning}
                    >
                      <div className="w-full flex justify-center mb-6">
                        <div className="w-[200px] h-[220px] rounded-full overflow-hidden">
                          <Image
                            src={item.img}
                            width={200}
                            height={220}
                            alt={item.title}
                            className="object-cover"
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
        </div>
      </div>
    </section>
  );
};

export default UniformBusinessEnquiry;
