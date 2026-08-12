"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { TbRobot } from "react-icons/tb";
import { apiFaqAssistant } from "@/services/AiAutomation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useTranslations } from "next-intl";

const TermsAssistant = () => {
  const t = useTranslations("aiAutomation.termAssistant");

  const faqChips = [
    t("cancelPolicy"),
    t("deliverySchedule"),
    t("deposit"),
    t("damageliability"),
  ];

  const [message, setMessage] = useState("");

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([]);

  const handleSend = async (question = message) => {
    if (!question.trim()) return;

    // user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: question,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await apiFaqAssistant(accessToken, {
        question,
      });

      console.log(res);

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text:
            res?.data?.answer ||
            res?.data?.data?.answer ||
            t("noResponse"),
          confidence: res?.data?.confidence || res?.data?.data?.confidence,
          source: res?.data?.source || res?.data?.data?.source,
        },
      ]);
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: t("somethingWentWrong"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="text-[24px] font-semibold leading-tight text-[#2A1A0E] sm:text-[24px]">
        {t("title")}
      </div>
      <p className="mt-1 text-[13px] text-[#B29D8C]">
        {t("subtitle")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {faqChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleSend(chip)}
            className="rounded-full border border-[#E8D9CD] bg-white px-4 py-1.5 text-[12px] text-[#6C615A]"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-[#F1E5DC] bg-white p-4 sm:p-5">
        <div className="mt-6 space-y-6">
          {messages.map((item, index) =>
            item.type === "user" ? (
              <div key={index} className="flex justify-end">
                <div>
                  <div className="rounded-[18px] bg-[#B76836] px-4 py-3 text-[12px] text-white">
                    {item.text}
                  </div>
                </div>
              </div>
            ) : (
              <div key={index} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1E8] text-[#C07B52]">
                  <TbRobot size={15} />
                </div>

                <div className="max-w-[760px] rounded-2xl border border-[#EFE2D9] bg-[#FFFDFC] px-4 py-4">
                  <p className="text-[12px] leading-6 text-[#6C625C]">
                    {item.text}
                  </p>

                  {(item.source || item.confidence) && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[10px] text-[#C0ABA0]">
                        {item.source}
                      </p>

                      <span className="rounded-full bg-[#E6F7EC] px-3 py-1 text-[10px] font-medium text-[#1CA174]">
                        {item.confidence}% confidence
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ),
          )}

          {loading && (
            <div className="flex gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1E8] text-[#C07B52]">
                <TbRobot size={15} />
              </div>

              <div className="rounded-xl border border-[#EFE2D9] bg-[#FFFDFC] px-5 py-4 text-sm">
                {t("thinking")}
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 rounded-xl border border-[#F1E5DC] px-4 py-2">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("askAbout")}
              className="w-full bg-transparent text-[13px] text-[#6C615A] outline-none placeholder:text-[#D7C7BC]"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSend()}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                message.trim() ? "bg-[#A85A32]" : "bg-[#E4C4AE]"
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
