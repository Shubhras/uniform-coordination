"use client";

import Container from "@/components/shared/Container";
import { useEffect, useState } from "react";
import { FiPlus, FiMinus, FiSearch, FiX } from "react-icons/fi";
import { apiGetFaq } from "@/services/FaqService";

/**
 * FaqSection Component
 * 
 * Renders interactive FAQ search input and expandable accordion list populated from API.
 */
const FaqSection = () => {
    const [faqs, setFaqs] = useState([]);
    const [activeIndex, setActiveIndex] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * Toggles expanded FAQ item by index.
     * 
     * @param {number} index - FAQ item index.
     */
    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    /**
     * Fetches FAQ questions and answers from backend service.
     */
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setLoading(true);

                const response = await apiGetFaq();

                if (response?.status && Array.isArray(response.data)) {
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

    const filteredFaqs = faqs.filter(faq =>
        faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="relative pt-8 pb-20 bg-[#FAF6F4] px-5">
            <Container>
                {/* Search Bar */}
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-11 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#005CA7]/30 text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    aria-label="Clear search"
                                >
                                    <FiX size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-[#1C2C56] md:text-2xl text-xl">
                        About design and coordination flow
                    </p>
                </div>

                {/* FAQ Accordion List */}
                <div className="max-w-5xl mx-auto space-y-6">
                    {loading && (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                        </div>
                    )}

                    {!loading && filteredFaqs.length === 0 && (
                        <p className="text-center text-gray-500 text-sm">
                            No FAQs found.
                        </p>
                    )}

                    {!loading &&
                        filteredFaqs.map((faq, index) => {
                            const isOpen = activeIndex === index;

                            return (
                                <div
                                    key={index}
                                    className={`rounded-xl px-6 py-5 transition-all duration-300 ${isOpen
                                        ? "bg-white text-black shadow-md"
                                        : "bg-[#E1D1C7] text-black"
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full flex items-center justify-between text-left"
                                    >
                                        <span className="font-medium text-sm md:text-base">
                                            {faq.question}
                                        </span>

                                        <span className="text-xl">
                                            {isOpen ? (
                                                <FiMinus className="text-[#A0522D]" />
                                            ) : (
                                                <FiPlus />
                                            )}
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

export default FaqSection;

