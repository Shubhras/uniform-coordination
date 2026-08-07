"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { FiArrowLeft } from "react-icons/fi";
import RichTextEditor from "@/components/shared/RichTextEditor";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetPdfTemplate,
  apiCreatePdfTemplate,
  apiUpdatePdfTemplate,
} from "@/services/PdfTemplateService";

const defaultTemplate = `
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
    <div style="display:flex;gap:16px;">
        <div style="width:90px;height:90px;background:#E5E7EB;border-radius:4px;"></div>

        <div>
            <h2 style="margin:0;font-size:18px;">{COMPANY_NAME}</h2>
            <p style="margin-top:6px;color:#64748B;">{COMPANY_ADDRESS}</p>
        </div>
    </div>

    <p style="margin:0;">
        <strong>Date:</strong> {QUOTE_DATE}
    </p>
</div>

<p>Dear {CLIENT_NAME},</p>

<p>
Please find below our quotation for {ITEM_TYPE}, quantity {QUANTITY}.
</p>
`;

const PAGE_SIZES = ["A4", "Letter"];

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

export default function AddTemplate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  // Present = edit mode, absent = create mode.
  const templateId = searchParams.get("id");
  const isEdit = !!templateId;

  const [name, setName] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [content, setContent] = useState(defaultTemplate);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const loadTemplate = useCallback(async () => {
    if (!isEdit || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetPdfTemplate(accessToken, templateId);
      if (res?.status && res.data) {
        setName(res.data.name || "");
        setPageSize(res.data.page_size || "A4");
        setContent(res.data.content || "");
      } else {
        notify("Error", "danger", res?.message || "Template not found");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
      notify("Error", "danger", "Could not load the template");
    } finally {
      setLoading(false);
    }
  }, [isEdit, accessToken, templateId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleSave = async () => {
    if (saving) return;

    if (!name.trim()) {
      notify("Required", "warning", "Please enter a template name");
      return;
    }

    if (!content?.trim()) {
      notify("Required", "warning", "Template content cannot be empty");
      return;
    }

    const payload = { name: name.trim(), page_size: pageSize, content };

    try {
      setSaving(true);
      const res = isEdit
        ? await apiUpdatePdfTemplate(accessToken, templateId, payload)
        : await apiCreatePdfTemplate(accessToken, payload);

      if (res?.status) {
        notify(
          "Success",
          "success",
          isEdit ? "Template updated" : "Template created",
        );
        router.push("/contents");
      } else {
        notify("Error", "danger", res?.message || "Could not save template");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      notify("Error", "danger", "Could not save the template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#F4F7FC] min-h-screen p-6">
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
            {isEdit ? "Edit PDF Template" : "Add PDF Template"}
          </h1>

          <p className="text-[#64748B] mt-1 text-sm">
            Design and preview your quote layouts
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 w-full bg-gray-100 rounded mt-6 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Meta fields */}
          <div className="bg-white rounded-lg shadow p-5 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1C2C56] mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard quotation"
                className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C2C56] mb-1">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-[#64748B] md:col-span-2">
              Use placeholders like <code>{"{CLIENT_NAME}"}</code>,{" "}
              <code>{"{ITEM_TYPE}"}</code>, <code>{"{QUANTITY}"}</code> — these
              get filled in when a quotation is generated. The library counts
              distinct placeholders as &quot;customizable fields&quot;.
            </p>
          </div>

          {/* Editor */}
          <div className="rounded-xl">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="border-b">
                <RichTextEditor
                  content={content}
                  onChange={(data) => setContent(data.html)}
                />
              </div>
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
              disabled={saving}
              className="bg-[#1C4FA8] text-[#FFFFFF] px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
