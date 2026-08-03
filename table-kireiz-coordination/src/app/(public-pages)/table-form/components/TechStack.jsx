'use client'

import React from "react";
import {
  PiMapPinFill,
  PiToteFill,
  PiPoliceCarFill,
} from "react-icons/pi";

const stackList = [
  {
    id: "location",
    icon: PiMapPinFill,
    title: "Choose Theme",
    description:
      "Select your preferred table theme and color palette.",
  },
  {
    id: "quote",
    icon: PiToteFill,
    title: "Customize",
    description:
      "Tailor items, fabrics, and sizes according to your space setup.",
  },
  {
    id: "order",
    icon: PiPoliceCarFill,
    title: "Order Setup",
    description:
      "Confirm rental duration and get seamless delivery to your location.",
  },
];

/**
 * TechStack Component
 * 
 * "How it works" section illustrating the 3-step workflow for table coordination rentals.
 */
const TechStack = () => {
  return (
    <section className="w-full bg-[#A0522D0D] mx-auto px-5 md:px-8 lg:px-12">
      <div className="px-6 md:px-10 py-10 md:py-16">
        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#402936]">
            How it works
          </h2>
          <p className="mt-3 max-w-[650px] mx-auto text-[#402936] text-sm md:text-base">
            Simple 3-step process to transform your event or space design.
          </p>
        </div>

        {/* CONTENT */}
        <div className="relative mx-auto">
          {/* Horizontal line (Desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[15%] h-[2px] bg-gray-300" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {stackList.map((stack) => {
              const Icon = stack.icon;
              return (
                <div
                  key={stack.id}
                  className="flex flex-col items-center text-center md:text-left"
                >
                  {/* ICON */}
                  <div className="relative z-20 mb-6">
                    <div className="w-20 h-20 rounded-xl bg-[#E8B4A94D] flex items-center justify-center shadow-sm">
                      <Icon size={40} className="text-[#A0522DCC]" />
                    </div>
                  </div>

                  {/* TEXT */}
                  <h3 className="text-base font-semibold text-[#1A202C] mb-2">
                    {stack.title}
                  </h3>
                  <p className="text-[#7A7A7A] text-sm leading-relaxed max-w-xs">
                    {stack.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;