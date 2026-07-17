"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import RichTextEditor from "@/components/shared/RichTextEditor"; // apne path ke according change kr lena
import Button from "@/components/ui/Button";

// const variables = [
//   "{CLIENT_NAME}",
//   "{DATE}",
//   "{FABRIC}",
//   "{VALID_DATE}",
//   "{QUANTITY}",
//   "{PRICE}",
//   "{SUBTOTAL}",
//   "{DISCOUNT}",
//   "{TOTAL}",
// ];

const QuotationTemplate = () => {
  const [editorData, setEditorData] = useState({
    html: "",
    text: "",
    json: null,
  });

  const preview = `
<h2>QUOTATION #Q-2024-001</h2>

<p><strong>Date:</strong> 04/12/2025</p>
<p><strong>Valid until:</strong> 18/12/2025</p>

<br/>

<p>Dear John Doe,</p>

<p>
Thank you for your interest in our products. Based on your requirements,
we are pleased to offer the following quotation:
</p>

<p>
Item: Premium Cotton 400TC<br/>
Quantity: 150 meters<br/>
Unit Price: $12.50
</p>

<hr/>

<p>
Subtotal: $1,875.00<br/>
Discount: -$187.50
</p>

<hr/>

<p><strong>TOTAL: $1,687.50</strong></p>

<br/>

<p><strong>Terms & Conditions:</strong></p>

<ol>
<li>50% advance payment required.</li>
<li>Delivery within 14 days of confirmation.</li>
</ol>

<br/>

<p>Sincerely,</p>
<p>Sales Team</p>
`;
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            Quotation Templates
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Design and preview your quote layouts
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="border border-gray-300 text-[#91A1B6] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Reset Default
          </button>

          <button
            type="button"
            className="bg-[#1C4FA8] text-[#FFFFFF] px-3 py-2 rounded-md text-sm fw-500 flex items-center gap-2"
          >
            <FiPlus size={16} /> Save Template
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="border rounded-xl bg-white overflow-hidden">
          {/* <div className="px-4 py-2 border-b flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-2">Variables:</span>

            {variables.map((item) => (
              <button
                key={item}
                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {item}
              </button>
            ))}
          </div> */}

          <RichTextEditor
            content=""
            onChange={(value) => setEditorData(value)}
            editorContentClass="min-h-[650px]"
          />
        </div>

        {/* RIGHT */}
        <div className="bg-[#E5E7EB] rounded-xl p-6">
          <div className="bg-white rounded-lg shadow-sm mx-auto max-w-[550px] min-h-[650px] p-5">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate;
