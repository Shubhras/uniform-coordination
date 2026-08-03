"use client";

import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useRouter } from "next/navigation";

/**
 * UniformLatestFAQPosts Component
 * 
 * Accordion FAQ list component displaying common questions with expand/collapse interaction.
 * 
 * @param {Object} props
 * @param {Array} [props.faqs=[]] - Array of FAQ objects.
 * @param {boolean} [props.loading] - Loading state boolean.
 */
const UniformLatestFAQPosts = ({ faqs = [], loading }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(null);

  /**
   * Navigates to dedicated FAQ page.
   */
  const handleClick = () => {
    router.push("/faq");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
      </div>
    );

  return (
    <section className="w-full mx-auto px-5 md:px-8 lg:px-12">
      <div className="py-10 md:py-16 bg-[#FAF6F4]">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#402936] mb-3 cursor-pointer" onClick={handleClick}>
            FAQ’s
          </h2>
          <p className="text-[#402936] text-sm md:text-base">
            About design and coordination flow
          </p>
        </div>
        <div className="max-w-7xl mx-auto space-y-6">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={faq.id}
                className={`rounded-xl px-6 py-5 transition-all duration-300 ${isOpen
                  ? "bg-white text-black shadow-md"
                  : "bg-[#E1D1C7] text-black"
                  }`}
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-medium text-sm md:text-base">
                    {faq.title}
                  </span>

                  <span className="text-xl">
                    {isOpen ? <FiMinus className="text-[#A0522D]" /> : <FiPlus />}
                  </span>
                </button>

                {isOpen && (
                  <ul className="mt-4 space-y-2">
                    {faq.descriptions?.map((d) => (
                      <li key={d.id} className="text-gray-600 text-sm">
                        • {d.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {!faqs.length && (
            <p className="text-center text-gray-500 mt-10">
              No FAQs available
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default UniformLatestFAQPosts;

