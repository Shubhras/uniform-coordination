"use client";

import Image from "next/image";
import { useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const bottomCards = [
  {
    img: "/img/landing/features/uniform-card-img-one.png",
    title: "Medical & Nursing Care",
    desc: "Comfortable, functional medical uniforms",
  },
  {
    img: "/img/landing/features/uniform-card-img-two.png",
    title: "Food Service & Dining",
    desc: "Hygienic, professional kitchen & serving wear",
  },
  {
    img: "/img/landing/features/uniform-card-img-one.png",
    title: "Office & Back-End Operations",
    desc: "Professional corporate branding",
  },
];

const UniformBusinessEnquiry = () => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % bottomCards.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? bottomCards.length - 1 : prev - 1));
  };

  return (
    <section className="w-full bg-white px-6 py-14 md:py-20">
      <div className="max-w-7xl mx-auto relative">
        {/* BACKGROUND FRAME */}
        <div className="relative w-full max-w-6xl mx-auto">
          <Image
            src="/img/landing/features/uniform-bussiness-frame.png"
            width={1500}
            height={900}
            alt="Frame Background"
            className="w-full mx-auto object-contain pointer-events-none"
          />

          {/* CONTENT INSIDE FRAME */}
          <div className="absolute inset-0 px-6 md:px-16 pt-14 overflow-hidden">
            {/* TITLE */}
            <h2 className="text-center text-3xl md:text-4xl font-semibold text-[#1C2C56]">
              How KIREIZ Helps Your Business
            </h2>

            {/* TOP 4 CARDS – SMALLER SIZE */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                {
                  img: "/img/landing/features/Frame.png",
                  title: "Visual Design Tools",
                  desc: "See your designs come to life",
                },
                {
                  img: "/img/landing/features/Frame (1).png",
                  title: "Professional Results",
                  desc: "Industry-specific solutions",
                },
                {
                  img: "/img/landing/features/Frame (2).png",
                  title: "Bulk Pricing & Delivery",
                  desc: "Rental options & bulk pricing",
                },
                {
                  img: "/img/landing/features/Frame (3).png",
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
            <h2 className="text-center text-3xl md:text-4xl mt-8 font-semibold text-[#1C2C56]">
              Industry-Specific Uniform Solutions
            </h2>

            {/* ARROWS */}
            <div className="flex justify-end gap-3 mt-20">
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

            {/* INDUSTRY-SPECIFIC CARDS — FIGMA EXACT DESIGN */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {bottomCards.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E3E8F1] rounded-[28px] shadow-md p-6 pb-0 flex flex-col w-2xs max-w-xs"
                >
                  {/* Image Circle Background - Centered */}
                  <div className="w-full flex justify-center mb-6">
                    <div className="w-[200px] h-[200px] rounded-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={160}
                        alt={item.title}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Text Content - Left Aligned */}
                  <div className="flex flex-col items-start">
                    {/* Title */}
                    <h3 className="text-[#1C2C56] text-[18px] font-semibold text-left">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#6B7280] text-[14px] text-left mt-2 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniformBusinessEnquiry;
