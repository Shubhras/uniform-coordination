'use client'

import React from "react";

const stackList = [
  {
    id: "location",
    title: "Design Uniform/Table",
    description:
      "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
  },
  {
    id: "Vector",
    title: "Request for Quotation",
    description:
      "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
  },
  {
    id: "car-front-fill",
    title: "Order Custom Uniform",
    description:
      "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
  },
];

const TechStack = () => {
  return (
    <div className="relative z-20 py-16 md:py-20 bg-white">
      {/* Heading Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-3">
          How it works
        </h2>
        <p className="mx-auto max-w-[650px] text-gray-500 text-sm md:text-base px-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-row items-start justify-between gap-4 relative">
          {/* HORIZONTAL LINE BEHIND ICONS */}
          <div className="absolute top-[48px] left-[19%] right-[19%] h-[2px] bg-gray-300 z-0"></div>

          {stackList.map((stack) => {
            return (
              <div
                key={stack.id}
                className="flex flex-col items-center relative z-20 flex-1 max-w-[280px]"
              >
                {/* ICON BLOCK */}
                <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-[#f3f6fb] shadow-sm mb-6 mr-24">
                  <img
                    src={`/img/landing/tech/${stack.id}.png`}
                    alt={stack.title}
                    className="max-h-10"
                  />
                </div>

                {/* TITLE */}
                <h3 className="text-base font-semibold mb-3 text-gray-800 text-left w-full">
                  {stack.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-gray-500 text-sm leading-relaxed text-left w-full">
                  {stack.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TechStack;
