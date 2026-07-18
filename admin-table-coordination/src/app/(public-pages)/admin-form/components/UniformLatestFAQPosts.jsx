// "use client";

// import { useState } from "react";
// import Container from "./LandingContainer";
// import { FiPlus, FiMinus } from "react-icons/fi";

// const faqs = [
//   {
//     question: "Can I request samples?",
//     answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
//   },
//   {
//     question: "What is the minimum order quantity and lead time?",
//     answer:
//       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
//   },
//   {
//     question: "Support and contact details",
//     answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
//   },
// ];

// const UniformLatestFAQPosts = () => {
//   const [activeIndex, setActiveIndex] = useState(1);

//   const toggleFAQ = (index) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   return (
//     <section className="relative mx-auto px-5 md:px-8 lg:px-12 py-16 md:py-0 bg-white">
//       {/* <Container> */}
      
//         <div className="text-center mb-14">
//           <h2 className="text-3xl md:text-4xl font-semibold text-[#1C2C56] mb-3">
//             FAQ’s
//           </h2>
//           <p className="text-[#1C2C56] text-sm md:text-base">
//             About design and coordination flow
//           </p>
//         </div>
//         <div className="max-w-7xl mx-auto space-y-6">
//           {faqs.map((faq, index) => {
//             const isOpen = activeIndex === index;

//             return (
//               <div
//                 key={index}
//                 className={`rounded-xl px-6 py-5 transition-all duration-300 ${
//                   isOpen
//                     ? "bg-white shadow-md"
//                     : "bg-[#F5F7FB]"
//                 }`}
//               >
//                 <button
//                   onClick={() => toggleFAQ(index)}
//                   className="w-full flex items-center justify-between text-left"
//                 >
//                   <span className="text-[#1C2C56] font-medium text-sm md:text-base">
//                     {faq.question}
//                   </span>

//                   <span className="text-[#1C2C56] text-xl">
//                     {isOpen ? <FiMinus /> : <FiPlus />}
//                   </span>
//                 </button>
//                 {isOpen && faq.answer && (
//                   <p className="mt-4 text-sm text-gray-600 leading-relaxed">
//                     {faq.answer}
//                   </p>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       {/* </Container> */}
//     </section>
//   );
// };

// export default UniformLatestFAQPosts;
"use client";

import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const UniformLatestFAQPosts = ({ faqs = [], loading }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (loading) return <p className="text-center">Loading FAQs...</p>;

  return (
    <section className="px-5 py-16 bg-white">
      <div className="text-center mb-14">
        <h2 className="text-4xl font-semibold text-[#1C2C56]">FAQ’s</h2>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div
              key={faq.id}
              className={`rounded-xl px-6 py-5 ${
                isOpen ? "bg-white shadow-md" : "bg-[#F5F7FB]"
              }`}
            >
              <button
                onClick={() => setActiveIndex(isOpen ? null : index)}
                className="w-full flex justify-between"
              >
                <span className="font-medium text-[#1C2C56]">
                  {faq.title}
                </span>
                {isOpen ? <FiMinus /> : <FiPlus />}
              </button>

              {isOpen && (
                <ul className="mt-4 space-y-2">
                  {faq.descriptions.map((d) => (
                    <li key={d.id} className="text-gray-600 text-sm">
                      • {d.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UniformLatestFAQPosts;
