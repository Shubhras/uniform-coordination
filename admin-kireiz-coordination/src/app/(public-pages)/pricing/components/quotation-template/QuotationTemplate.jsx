"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiSave, FiRotateCcw } from "react-icons/fi";
import RichTextEditor from "@/components/shared/RichTextEditor";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetActiveQuotationTemplate,
  apiSaveActiveQuotationTemplate,
} from "@/services/PdfTemplateService";

// Sample values used only to render the live preview, so the admin sees what a
// real quotation will look like instead of raw {PLACEHOLDER} tokens.
const PREVIEW_SAMPLE = {
  QUOTATION_ID: "Q-2024-001",
  DATE: "04/12/2025",
  VALID_DATE: "18/12/2025",
  CLIENT_NAME: "John Doe",
  COMPANY_NAME: "Acme Industries",
  COMPANY_ADDRESS: "1-2-3 Shibuya, Tokyo",
  FABRIC: "Premium Cotton 400TC",
  ITEM_TYPE: "Chef Jacket",
  QUANTITY: "150 meters",
  PRICE: "$12.50",
  SUBTOTAL: "$1,875.00",
  DISCOUNT: "-$187.50",
  TOTAL: "$1,687.50",
};

const VARIABLES = Object.keys(PREVIEW_SAMPLE).map((key) => `{${key}}`);

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const QuotationTemplate = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [content, setContent] = useState("");
  // Remount key for the editor — RichTextEditor only picks up `content` on init,
  // so loading or resetting needs a fresh instance.
  const [editorKey, setEditorKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadTemplate = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetActiveQuotationTemplate(accessToken);
      if (res?.status && res.data) {
        setContent(res.data.content || "");
        setEditorKey((k) => k + 1);
      }
    } catch (error) {
      console.error("Failed to load quotation template:", error);
      notify("Error", "danger", "Could not load the quotation template");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  // Live preview: substitute the sample values into whatever is in the editor.
  const preview = useMemo(
    () =>
      Object.entries(PREVIEW_SAMPLE).reduce(
        (html, [key, value]) => html.split(`{${key}}`).join(value),
        content || "",
      ),
    [content],
  );

  const handleSave = async () => {
    if (saving || !content.trim()) {
      if (!content.trim()) {
        notify("Required", "warning", "Template content cannot be empty");
      }
      return;
    }

    try {
      setSaving(true);
      const res = await apiSaveActiveQuotationTemplate(accessToken, { content });
      if (res?.status) {
        notify("Success", "success", "Quotation template saved");
      } else {
        notify("Error", "danger", res?.message || "Could not save template");
      }
    } catch (error) {
      console.error("Failed to save quotation template:", error);
      notify("Error", "danger", "Could not save the template");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = async () => {
    if (resetting) return;

    try {
      setResetting(true);
      const res = await apiSaveActiveQuotationTemplate(accessToken, {
        reset: true,
      });
      if (res?.status && res.data) {
        setContent(res.data.content || "");
        setEditorKey((k) => k + 1);
        notify("Success", "success", "Template reset to default");
      } else {
        notify("Error", "danger", res?.message || "Could not reset template");
      }
    } catch (error) {
      console.error("Failed to reset quotation template:", error);
      notify("Error", "danger", "Could not reset the template");
    } finally {
      setResetting(false);
    }
  };

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
            onClick={handleResetDefault}
            disabled={loading || resetting}
            className="border border-gray-300 text-[#91A1B6] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            <FiRotateCcw size={15} />
            {resetting ? "Resetting..." : "Reset Default"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="bg-[#1C4FA8] text-[#FFFFFF] px-3 py-2 rounded-md text-sm fw-500 flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave size={16} /> {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — editor */}
        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Variables:</span>

            {VARIABLES.map((item) => (
              <button
                key={item}
                type="button"
                title="Copy to clipboard"
                onClick={() => {
                  navigator.clipboard?.writeText(item);
                  notify("Copied", "info", `${item} copied to clipboard`);
                }}
                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-4 min-h-[650px]">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-[560px] w-full bg-gray-100 rounded mt-4 animate-pulse" />
            </div>
          ) : (
            <RichTextEditor
              key={editorKey}
              content={content}
              onChange={(value) => setContent(value.html)}
              editorContentClass="min-h-[650px]"
            />
          )}
        </div>

        {/* RIGHT — live preview with sample data */}
        <div className="bg-[#E5E7EB] rounded-xl p-6">
          <div className="bg-white rounded-lg shadow-sm mx-auto max-w-[550px] min-h-[650px] p-5">
            {content?.trim() ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            ) : (
              <p className="text-sm text-gray-400 text-center mt-20">
                Start typing on the left to see a preview here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate;
