"use client";

import { useState } from "react";
import { apiDraftGenerator } from "@/services/AiAutomation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";

const DraftGenerator = () => {
  const [inquiry, setInquiry] = useState("");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [draftResponse, setDraftResponse] = useState("");
  const [apiMessage, setApiMessage] = useState("");

  const handleGenerateDraft = async () => {
    if (!inquiry.trim()) return;

    try {
      setLoading(true);
      setApiMessage("");
      setDraftResponse("");

      const res = await apiDraftGenerator(accessToken, inquiry.trim());

      console.log("Draft Generator:", res);

      if (res?.success) {
        // response ke according change kar lena
        setDraftResponse(res?.data?.draft || "");
      } else {
        setApiMessage(res?.message || "Unable to generate draft.");
      }
    } catch (error) {
      console.error(error);
      setApiMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-[24px] font-semibold leading-tight text-[#2A1A0E] sm:text-[24px]">
        Draft Response Generator
      </h2>

      <p className="mt-1 text-[13px] text-[#B29D8C]">
        AI-assisted reply drafts for customer inquiries — review, edit, and
        approve before sending.
      </p>

      <div className="mt-6">
        <textarea
          rows={10}
          value={inquiry}
          onChange={(e) => setInquiry(e.target.value)}
          placeholder="Type the customer inquiry here...

Example:
I want to rent 20 round tables for my wedding event next month. Please share pricing and availability."
          className="min-h-[260px] w-full resize-none rounded-xl border border-[#EFE3DA] bg-[#FFFCFA] p-4 text-[13px] text-[#4B4039] outline-none placeholder:text-[#C7B4A8] focus:border-[#B76836]"
        />

        {apiMessage && (
          <p className="mt-4 text-sm text-red-500">{apiMessage}</p>
        )}

        {draftResponse && (
          <div className="mt-6 rounded-xl border border-[#EFE3DA] bg-[#FFFCFA] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#2A211D]">
              AI Draft
            </h3>

            <p className="whitespace-pre-wrap text-sm text-[#5C524B]">
              {draftResponse}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={!inquiry.trim() || loading}
            className={`flex items-center gap-2 rounded-l px-6 py-2 text-[14px] font-medium text-white ${
              inquiry.trim()
                ? "bg-[#A85A32]"
                : "bg-[#E4C4AE] cursor-not-allowed"
            }`}
          >
            {loading ? "Generating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftGenerator;
