// "use client";

// // import Container from "@/components/shared/Container";
// import { useState } from "react";
// import { FiPlus, FiMinus, FiSearch } from "react-icons/fi";

// const faqs = [
//     {
//         question: "Can I request samples?",
//         answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
//     },
//     {
//         question: "What is the minimum order quantity and lead time?",
//         answer:
//             "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
//     },
//     {
//         question: "Support and contact details",
//         answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempomod tempor incididunt ut labore et dolore.",
//     },
//     {
//         question: "What is the minimum order quantity and lead time?",
//         answer:
//             "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
//     },
//     {
//         question: "Support and contact details",
//         answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempoLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempomod tempor incididunt ut labore et dolore.",
//     },
// ];

// const FaqSection = () => {
//     const [activeIndex, setActiveIndex] = useState(1);

//     const toggleFAQ = (index) => {
//         setActiveIndex(activeIndex === index ? null : index);
//     };

//     return (
//         <section className="relative pt-8 pb-20 bg-white px-5">
//             {/* <Container> */}
//                 {/* Header */}
//                 <div className="text-center mb-8">
//                     {/* <h2 className="text-3xl md:text-4xl font-semibold text-[#1C2C56] mb-3">
//                         FAQ’s
//                     </h2> */}
//                     <div className="w-full flex justify-center mb-5">
//                         <div className="relative w-full max-w-sm ">
//                             <FiSearch
//                                 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//                                 size={18}
//                             />
//                             <input
//                                 type="text"
//                                 placeholder="Search"
//                                 className="w-full h-11 pl-11 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#005CA7]/30 text-sm"
//                             />
//                         </div>
//                     </div>
//                     <p className="text-[#1C2C56] md:text-2xl text-xl">
//                         About design and coordination flow
//                     </p>
//                 </div>

//                 {/* FAQ List */}
//                 <div className="max-w-5xl mx-auto space-y-6">
//                     {faqs.map((faq, index) => {
//                         const isOpen = activeIndex === index;

//                         return (
//                             <div
//                                 key={index}
//                                 className={`rounded-xl px-6 py-5 transition-all duration-300 ${isOpen
//                                     ? "bg-white shadow-md"
//                                     : "bg-[#F5F7FB]"
//                                     }`}
//                             >
//                                 {/* Question */}
//                                 <button
//                                     onClick={() => toggleFAQ(index)}
//                                     className="w-full flex items-center justify-between text-left"
//                                 >
//                                     <span className="text-[#1C2C56] font-medium text-sm md:text-base">
//                                         {faq.question}
//                                     </span>

//                                     <span className="text-[#1C2C56] text-xl">
//                                         {isOpen ? <FiMinus /> : <FiPlus />}
//                                     </span>
//                                 </button>

//                                 {/* Answer */}
//                                 {isOpen && faq.answer && (
//                                     <p className="mt-4 text-sm text-gray-600 leading-relaxed">
//                                         {faq.answer}
//                                     </p>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>
//             {/* </Container> */}
//         </section>
//     );
// };

// export default FaqSection;


"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiMinus, FiSearch } from "react-icons/fi";
import { apiGetFaq } from "@/services/FaqService";

const FaqSection = () => {
    const [faqs, setFaqs] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setLoading(true);

                const response = await apiGetFaq();

                if (response?.status && Array.isArray(response.data)) {
                    // 🔹 Map API data → existing UI structure
                    const mappedFaqs = response.data.map((item) => ({
                        question: item.title,
                        answer: item.descriptions
                            ?.map((d) => d.description)
                            .join(" "),
                    }));

                    setFaqs(mappedFaqs);
                }
            } catch (error) {
                console.error("Failed to fetch FAQs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    return (
        <section className="relative pt-8 pb-20 bg-white px-5">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-full flex justify-center mb-5">
                    <div className="relative w-full max-w-sm">
                        <FiSearch
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full h-11 pl-11 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#005CA7]/30 text-sm"
                        />
                    </div>
                </div>

                <p className="text-[#1C2C56] md:text-2xl text-xl">
                    About design and coordination flow
                </p>
            </div>

            {/* FAQ List */}
            <div className="max-w-5xl mx-auto space-y-6">
                {loading && (
                    <p className="text-center text-gray-500 text-sm">
                        Loading FAQs...
                    </p>
                )}
                {!loading && faqs.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">
                        No FAQs available
                    </p>
                )}
                {!loading &&
                    faqs.map((faq, index) => {
                        const isOpen = activeIndex === index;

                        return (
                            <div
                                key={index}
                                className={`rounded-xl px-6 py-5 transition-all duration-300 ${isOpen
                                        ? "bg-white shadow-md"
                                        : "bg-[#F5F7FB]"
                                    }`}
                            >
                                {/* Question */}
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between text-left"
                                >
                                    <span className="text-[#1C2C56] font-medium text-sm md:text-base">
                                        {faq.question}
                                    </span>

                                    <span className="text-[#1C2C56] text-xl">
                                        {isOpen ? <FiMinus /> : <FiPlus />}
                                    </span>
                                </button>

                                {/* Answer */}
                                {isOpen && faq.answer && (
                                    <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                )}
                            </div>
                        );
                    })}
            </div>
        </section>
    );
};

export default FaqSection;
