"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { FiArrowLeft } from "react-icons/fi";
import RichTextEditor from "@/components/shared/RichTextEditor";

const defaultTemplate = `
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
    <div style="display:flex;gap:16px;">
        <div style="width:90px;height:90px;background:#E5E7EB;border-radius:4px;"></div>

        <div>
            <h2 style="margin:0;font-size:18px;">Company Name</h2>
            <p style="margin-top:6px;color:#64748B;">Address</p>
        </div>
    </div>

    <p style="margin:0;">
        <strong>Date:</strong> 23-12-2025
    </p>
</div>

<p>
Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam in hendrerit urna.
Pellentesque sit amet sapien. Pellentesque sit amet sapien.
</p>

<p>
Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam in hendrerit urna.
Pellentesque sit amet sapien. Pellentesque sit amet sapien.
</p>

<p>
Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam in hendrerit urna.
Pellentesque sit amet sapien. Pellentesque sit amet sapien.
</p>
`;

export default function AddTemplate() {
  const router = useRouter();

  const [content, setContent] = useState(defaultTemplate);

  const handleSave = () => {
    console.log(content);

    // TODO: Call Create Template API

    router.back();
  };

  return (
    <div className="bg-[#F4F7FC] min-h-screen p-6">
      {/* Heading */}

      {/* Heading */}

      <div className="mb-6 flex items-start gap-3">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
        >
          <FiArrowLeft className="text-[#1C2C56] text-lg" />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-[#1C2C56]">
            Content & Media
          </h1>

          <p className="text-[#64748B] mt-1 text-sm">
            Design and preview your quote layouts
          </p>
        </div>
      </div>

      {/* Paper */}

      <div className="rounded-xl p-3">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Editor */}

          <div className="border-b">
            <RichTextEditor
              content={content}
              onChange={(data) => setContent(data.html)}
            />
          </div>

          {/* Preview */}
          {/* 
          <div className="p-8 min-h-[700px]">
            <div
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          </div> */}
        </div>
      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="plain"
          onClick={() => router.back()}
          size="sm"
          className="bg-blue-100 rounded-lg"
        >
          Cancel
        </Button>

        <button
          type="button"
          className="bg-[#1C4FA8] text-[#FFFFFF] px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
          onClick={handleSave}
        >
          Save Template
        </button>
      </div>
    </div>
  );
}
