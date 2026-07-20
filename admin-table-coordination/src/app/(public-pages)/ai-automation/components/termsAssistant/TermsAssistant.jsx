"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { TbRobot } from "react-icons/tb";

const faqChips = [
  "Cancellation policy?",
  "Delivery schedule?",
  "Deposit & refund?",
  "Damage liability?",
];

const TermsAssistant = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="mt-6">
      <h2 className="text-[29px] font-semibold leading-tight text-[#2A211D] sm:text-[30px]">
        FAQ / Terms Assistant
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Ask questions based on company FAQs and Terms of Service
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {faqChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setMessage(chip)}
            className="rounded-full border border-[#E8D9CD] bg-white px-4 py-1.5 text-[12px] text-[#6C615A]"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-[#F1E5DC] bg-white p-4 sm:p-5">
        <div className="flex justify-end">
          <div>
            <div className="rounded-[18px] bg-[#B76836] px-4 py-3 text-[12px] text-white">
              What is the return window for event rental items?
            </div>
            <p className="mt-1 text-right text-[10px] text-[#D0BBB0]">10:24 AM</p>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1E8] text-[#C07B52]">
            <TbRobot size={15} />
          </div>

          <div className="max-w-[760px] rounded-2xl border border-[#EFE2D9] bg-[#FFFDFC] px-4 py-4">
            <p className="text-[12px] leading-6 text-[#6C625C]">
              According to the KIREIZ Rental Terms &amp; Conditions (Section
              4.2), event rental items must be returned within 48 hours after
              the scheduled event end date. Late returns are subject to a daily
              fee of 15% of the rental value per item. For items damaged beyond
              normal wear, replacement costs apply as outlined in the Damage
              Assessment Policy.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] text-[#C0ABA0]">
                Terms &amp; Conditions — Section 4.2 (Rental Return)
              </p>
              <span className="rounded-full bg-[#E6F7EC] px-3 py-1 text-[10px] font-medium text-[#1CA174]">
                96% confidence
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-xl border border-[#F1E5DC] px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about company policies, terms, or FAQs..."
              className="w-full bg-transparent text-[12px] text-[#6C615A] outline-none placeholder:text-[#D7C7BC]"
            />
            <button
              type="button"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                message.trim() ? "bg-[#B76836]" : "bg-[#E4C4AE]"
              }`}
            >
              <FiSend size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAssistant;