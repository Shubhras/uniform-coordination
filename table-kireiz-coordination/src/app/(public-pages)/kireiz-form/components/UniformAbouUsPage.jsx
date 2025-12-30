"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const testimonials = [
  {
    text:
      "“KIREIZ transformed our restaurant's appearance. The staff uniforms and table settings are consistently praised by our customers.”",
    name: "Maria Rodriguez",
    role: "Restaurant Owner",
  },
  {
    text:
      "“KIREIZ transformed our restaurant's appearance. The staff uniforms and table settings are consistently praised by our customers.”",
    name: "James Chen",
    role: "Corporate Event Manager",
  },
  {
    text: "“KIREIZ elevated our brand presence across departments.”",
    name: "Amit Verma",
    role: "Operations Head",
  },
  {
    text:
      "“KIREIZ transformed our restaurant's appearance. The staff uniforms and table settings are consistently praised by our customers.”",
    name: "Ananya Sharma",
    role: "Marketing Lead",
  },
  {
    text: "“KIREIZ elevated our brand presence across departments.”",
    name: "Rahul Mehta",
    role: "Operations Head",
  },
];

const UniformAbouUsPage = () => {
  const [index, setIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);

  // 🔹 Detect screen size
  // const getCardsPerView = () => {
  //   if (typeof window === "undefined") return 2;
  //   if (window.innerWidth >= 1280) return 4; // xl
  //   if (window.innerWidth >= 1024) return 3; // lg
  //   if (window.innerWidth >= 768) return 2;  // md
  //   return 1; // mobile
  // };
  const getCardsPerView = () => {
    if (typeof window === "undefined") return 2;
    if (window.innerWidth >= 1024) return 3; // lg & above → MAX 3
    if (window.innerWidth >= 768) return 2;  // md
    return 1; // mobile
  };
  // 🔹 Resize listener
  useEffect(() => {
    const updateView = () => {
      setCardsPerView(getCardsPerView());
      setIndex(0);
    };

    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  // 🔹 Navigation
  const prev = () => {
    setIndex((prevIndex) =>
      prevIndex === 0
        ? testimonials.length - cardsPerView
        : prevIndex - 1
    );
  };

  const next = () => {
    setIndex((prevIndex) =>
      prevIndex >= testimonials.length - cardsPerView
        ? 0
        : prevIndex + 1
    );
  };


  return (
    <section className="w-full bg-white px-4 sm:px-6 lg:px-12 py-12">
      <div className="bg-[#EEF3FB] rounded-bl-[120px]">
        <div className="relative py-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1C2C56]">
              Trusted by 500+ Businesses
            </h2>
            <div className="w-20 h-[2px] bg-[#1C2C56] mx-auto mt-3" />
          </div>
          <div className="relative flex items-center justify-center">
            {/* <button
              onClick={prev}
              className="absolute left-2 md:left-4 z-10 h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              <FiArrowLeft className="text-lg text-gray-600" />
            </button> */}
             <FiArrowLeft   onClick={prev} size={25} className="text-lg text-gray-600 cursor-pointer absolute left-2 md:left-4" />
            <div
              className=" grid w-full px-14 md:px-18 gap-6 mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {testimonials
                .slice(index, index + cardsPerView)
                .map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm p-6 text-left border-l-4 border-[#6EC1E4]"
                  >
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                      {item.text}
                    </p>
                    <p className="font-semibold text-[#1C2C56]">
                      {item.name}
                    </p>
                    <p className="text-sm text-[#162347]">
                      {item.role}
                    </p>
                  </div>
                ))}
            </div>
            <FiArrowRight  onClick={next} size={25} className="text-lg text-gray-600 cursor-pointer absolute right-2 md:right-4" />
            {/* <button
              onClick={next}
              className="absolute right-2 md:right-4 z-10 h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              <FiArrowRight className="text-lg text-gray-600" />
            </button> */}
          </div>
          <div className="w-full h-px bg-[#A7B5C8] my-20" />
        </div>
        <div className="pb-20 px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-semibold text-[#1C2C56] mb-6">
              About Us
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed text-left">
              Our platform makes professional design accessible to all businesses —
              no design experience needed. We believe every business deserves to
              look professional and every event deserves to be beautiful.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniformAbouUsPage;

