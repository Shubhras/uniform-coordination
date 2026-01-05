"use client";

import { useState } from "react";
import Container from "./LandingContainer";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useRouter } from "next/navigation";


const faqs = [
  {
    question: "Can I request samples?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    question: "What is the minimum order quantity and lead time?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    question: "Support and contact details",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  },
];

const UniformLatestFAQPosts = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/faq");
  };
  const [activeIndex, setActiveIndex] = useState(1);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative md:py-20 py-10 bg-[#FAF6F4]">
      <Container>

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
                key={index}
                className={`rounded-xl px-6 py-5 transition-all duration-300  ${isOpen
                    ? "bg-white text-black shadow-md"
                    : "bg-[#E1D1C7] text-black"
                  }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className=" font-medium text-sm md:text-base">
                    {faq.question}
                  </span>

                  <span className=" text-xl">
                    {isOpen ? <FiMinus className="text-[#A0522D]" /> : <FiPlus />}
                  </span>
                </button>
                {isOpen && faq.answer && (
                  <p className="mt-4 text-sm text-[#9C8174] leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default UniformLatestFAQPosts;
