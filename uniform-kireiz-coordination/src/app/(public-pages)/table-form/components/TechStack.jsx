// 'use client'

// import React from "react";
// import {
//   PiMapPinFill,
//   PiToteFill,
//   PiPoliceCarFill
// } from "react-icons/pi";

// const stackList = [
//   {
//     id: "location",
//     icon: PiMapPinFill,
//     title: "Design Uniform/Table",
//     description:
//       "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
//   },
//   {
//     id: "Vector",
//     icon:   PiToteFill,
//     title: "Request for Quotation",
//     description:
//       "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
//   },
//   {
//     id: "car-front-fill",
//     icon:   PiPoliceCarFill,
//     title: "Order Custom Uniform",
//     description:
//       "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
//   },
// ];

// const TechStack = () => {
//   return (
//      <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 z-20 py-16 md:py-6">
//       <div className=" text-center mb-12">
//         <h2 className="text-3xl md:text-3xl font-semibold mb-3">
//           How it works
//         </h2>
//         <p className="mx-auto max-w-[650px] text-gray-500 text-sm md:text-base px-4">
//           Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//           eiusmod tempor incididunt ut labore et
//         </p>
//       </div>

//       <div className="mx-auto px-4">
//         <div className="flex flex-row items-start justify-between gap-4 relative">
//           {/* HORIZONTAL LINE BEHIND ICONS */}
//           <div className="absolute top-[48px] left-[7%] right-[13%] h-[2px] bg-gray-300 z-0"></div>

//           {stackList.map((stack) => {
//             const Icon = stack.icon;
//             return (
//               <div
//                 key={stack.id}
//                 className="flex flex-col items-center relative z-20 flex-1 max-w-[280px]"
//               >
//                 {/* ICON BLOCK */}
//                 <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-[#f3f6fb] shadow-sm mb-6 mr-24">
//                   {/* <img
//                     src={`/img/kireiz-form/tech/${stack.id}.png`}
//                     alt={stack.title}
//                     className="max-h-10"
//                   /> */}
//                   <Icon size={40} color="#1C2C56" />
//                 </div>

//                 {/* TITLE */}
//                 <h3 className="text-base font-semibold mb-3 text-gray-800 text-left w-full">
//                   {stack.title}
//                 </h3>

//                 {/* DESCRIPTION */}
//                 <p className="text-gray-500 text-sm leading-relaxed text-left w-full">
//                   {stack.description}
//                 </p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default TechStack;

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
    title: "Design Uniform/Table",
    description:
      "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
  },
  {
    id: "quote",
    icon: PiToteFill,
    title: "Request for Quotation",
    description:
      "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
  },
  {
    id: "order",
    icon: PiPoliceCarFill,
    title: "Order Custom Uniform",
    description:
      "Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices, orci vitae convallis mattis.",
  },
];

const TechStack = () => {
  return (
    <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12 ">
      <div className="bg-[#F8D7DA33] rounded-3xl px-6 md:px-10 py-10 md:py-16">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#402936]">
            How it works
          </h2>
          <p className="mt-3 max-w-[650px] mx-auto text-[#402936] text-sm md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et
          </p>
        </div>

        {/* CONTENT */}
        <div className="relative  mx-auto">
          {/* Horizontal line (Desktop only) */}
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] bg-gray-300" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {stackList.map((stack) => {
              const Icon = stack.icon;
              return (
                <div
                  key={stack.id}
                  className="flex flex-col items-center text-center md:text-left"
                >
                  {/* ICON */}
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#FFB6A3]">
                      <Icon size={40} className="text-[#8A5A75]" />
                    </div>
                  </div>

                  {/* TEXT */}
                  <h3 className="text-base font-semibold text-[#8A5A75] mb-2 ">
                    {stack.title}
                  </h3>
                  <p className="text-[#8A5A75] text-sm leading-relaxed max-w-xs">
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