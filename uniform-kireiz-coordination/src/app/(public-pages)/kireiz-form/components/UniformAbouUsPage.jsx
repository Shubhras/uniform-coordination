"use client";
import { useState } from "react";
import Container from "./LandingContainer";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const testimonials = [
  {
    text:
      "“KIREIZ transformed our restaurant's appearance. The staff uniforms and table settings are consistently praised by our customers”.",
    name: "Maria Rodriguez",
    role: "Restaurant Owner",
  },
  {
    text:
      "“KIREIZ transformed our restaurant's appearance. The staff uniforms and table settings are consistently praised by our customers”.",
    name: "James Chen",
    role: "Corporate Event Manager",
  },
  {
    text: "“KIREIZ elevated our brand presence across departments.”",
    name: "Amit Verma",
    role: "Operations Head",
  },
];

const UniformAbouUsPage = () => {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex(index === 0 ? testimonials.length - 2 : index - 1);

  const next = () =>
    setIndex(index >= testimonials.length - 2 ? 0 : index + 1);

  return (
    <section className="w-full bg-white px-6 py-2 md:py-2 ">
      <Container className="bg-[#EEF3FB] px-0 rounded-bl-[120px]">
        <div className="relative">
          <div className="text-center mb-8 pt-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1C2C56]">
              Trusted by 500+ Businesses
            </h2>
            <div className="w-50 h-[2px] bg-[#1C2C56] mx-auto mt-3 " />
          </div>
          <div className="relative flex items-center justify-center">
            <button
              onClick={prev}
              className="absolute left-4 h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
            >
             <FiArrowLeft className="text-lg text-gray-600" />
            </button>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
              {[testimonials[index], testimonials[index + 1]].map(
                (item, i) => (
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
                )
              )}
            </div>
            <button
              onClick={next}
              className="absolute right-4 h-10 w-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
            >
               <FiArrowRight className="text-lg text-gray-600" />
            </button>
          </div>
          <div className="w-full h-px bg-[#A7B5C8] my-20" />
        </div>
        <div className="pt-2 pb-26 px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1C2C56] mb-6">
              About Us
            </h2>

            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              platform makes professional design accessible to all businesses –
              no design experience needed. We believe every business deserves to
              look professional and every event deserves to be beautiful. Our
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default UniformAbouUsPage;

