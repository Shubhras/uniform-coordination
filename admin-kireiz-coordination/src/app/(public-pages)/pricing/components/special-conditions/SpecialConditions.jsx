"use client";

import React from "react";
import { FiUsers, FiCheckCircle } from "react-icons/fi";

const SpecialConditions = () => {
    const cards = [
        {
            title: "Corporate Standard",
            desc: "Standard discount for registered corporate clients with monthly orders.",
            discount: "15%",
            features: ["Priority Support", "Net 30 Terms", "Free Samples"],
        },
        {
            title: "Wholesale Partner",
            desc: "Deep discounts for wholesale partners committing to volume targets.",
            discount: "25%",
            features: ["Priority Support", "Net 30 Terms", "Free Samples"],
        },
        {
            title: "Global Enterprise",
            desc: "Maximum tier for multinational contracts and large commitments.",
            discount: "35%",
            features: ["Priority Support", "Net 30 Terms", "Free Samples"],
        },
    ];

    return (
        <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-4">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#1C2C56]">
                    Special Conditions
                </h2>
                <p className="text-base text-[#486284]">
                    Manage discount tiers and corporate rules
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col"
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 bg-[#EEF2F7] rounded-full flex items-center justify-center mb-4">
                            <FiUsers className="text-[#1C2C56]" size={22} />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-[#1C2C56] mb-2">
                            {card.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-[#64748B] mb-4">
                            {card.desc}
                        </p>

                        {/* Discount */}
                        <div className="text-3xl font-bold text-[#E47A1C] mb-4">
                            {card.discount}
                            <span className="text-sm font-medium text-[#64748B] ml-1">
                                OFF
                            </span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                            {card.features.map((f, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-2 text-sm text-[#486284]"
                                >
                                    <FiCheckCircle className="text-green-500" size={16} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {/* Button */}
                        <button className="mt-auto bg-[#0B3C66] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#083255] transition">
                            Edit Conditions
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpecialConditions;
