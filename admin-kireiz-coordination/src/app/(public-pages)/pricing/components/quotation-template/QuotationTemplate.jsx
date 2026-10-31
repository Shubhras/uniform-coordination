"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FiSave, FiRotateCcw } from "react-icons/fi";
import RichTextEditor from "@/components/shared/RichTextEditor";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetActiveQuotationTemplate,
  apiSaveActiveQuotationTemplate,
} from "@/services/PdfTemplateService";

// Variable tokens supported by the quotation template engine.
const VARIABLE_KEYS = [
  "QUOTATION_ID",
  "DATE",
  "VALID_DATE",
  "CLIENT_NAME",
  "COMPANY_NAME",
  "COMPANY_ADDRESS",
  "FABRIC",
  "ITEM_TYPE",
  "QUANTITY",
  "PRICE",
  "SUBTOTAL",
  "DISCOUNT",
  "TOTAL",
];

const VARIABLES = VARIABLE_KEYS.map((key) => `{${key}}`);

const copyToClipboard = async (text) => {
  if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback below
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
};

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const QuotationTemplate = () => {
  const t = useTranslations("pricingQuotation.quotationTemplate");
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
      notify(t("errorTitle"), "danger", t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, t]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  // Sample values used for live preview, localized per user language.
  const previewSample = useMemo(
    () => ({
      QUOTATION_ID: t("sample.quotationId"),
      DATE: t("sample.date"),
      VALID_DATE: t("sample.validDate"),
      CLIENT_NAME: t("sample.clientName"),
      COMPANY_NAME: t("sample.companyName"),
      COMPANY_ADDRESS: t("sample.companyAddress"),
      FABRIC: t("sample.fabric"),
      ITEM_TYPE: t("sample.itemType"),
      QUANTITY: t("sample.quantity"),
      PRICE: t("sample.price"),
      SUBTOTAL: t("sample.subtotal"),
      DISCOUNT: t("sample.discount"),
      TOTAL: t("sample.total"),
    }),
    [t],
  );

  // Live preview: substitute the sample values into whatever is in the editor.
  const preview = useMemo(
    () =>
      Object.entries(previewSample).reduce(
        (html, [key, value]) => html.split(`{${key}}`).join(value),
        content || "",
      ),
    [content, previewSample],
  );

  const handleSave = async () => {
    if (saving || !content.trim()) {
      if (!content.trim()) {
        notify(t("requiredTitle"), "warning", t("emptyContent"));
      }
      return;
    }

    try {
      setSaving(true);
      const res = await apiSaveActiveQuotationTemplate(accessToken, { content });
      if (res?.status) {
        notify(t("successTitle"), "success", t("saveSuccess"));
      } else {
        notify(t("errorTitle"), "danger", res?.message || t("saveFailed"));
      }
    } catch (error) {
      console.error("Failed to save quotation template:", error);
      notify(t("errorTitle"), "danger", t("saveFailed"));
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
        notify(t("successTitle"), "success", t("resetSuccess"));
      } else {
        notify(t("errorTitle"), "danger", res?.message || t("resetFailed"));
      }
    } catch (error) {
      console.error("Failed to reset quotation template:", error);
      notify(t("errorTitle"), "danger", t("resetFailed"));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1C2C56]">
            {t("title")}
          </h2>

          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            disabled={loading || resetting}
            className="flex-1 sm:flex-initial border border-gray-300 text-[#91A1B6] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
          >
            <FiRotateCcw size={15} className="shrink-0" />
            <span>{resetting ? t("resetting") : t("resetDefault")}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="flex-1 sm:flex-initial bg-[#1C4FA8] text-[#FFFFFF] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#163e85] flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap transition-colors"
          >
            <FiSave size={16} className="shrink-0" />
            <span>{saving ? t("saving") : t("saveTemplate")}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — editor */}
        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">
              {t("variablesLabel")}
            </span>

            {VARIABLES.map((item) => (
              <button
                key={item}
                type="button"
                title={t("copyToClipboard")}
                onClick={async () => {
                  await copyToClipboard(item);
                  notify(
                    t("copiedTitle"),
                    "info",
                    t("copiedMessage", { variable: item }),
                  );
                }}
                className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium"
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-4 min-h-[720px]">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-[650px] w-full bg-gray-100 rounded mt-4 animate-pulse" />
            </div>
          ) : (
            <RichTextEditor
              key={editorKey}
              content={content}
              onChange={(value) => setContent(value.html)}
              editorContentClass="min-h-[720px] h-[calc(100vh-300px)]"
            />
          )}
        </div>

        {/* RIGHT — live preview with sample data */}
        <div className="bg-[#E5E7EB] rounded-xl p-6">
          <div className="bg-white rounded-lg shadow-sm mx-auto max-w-[550px] min-h-[720px] p-5">
            {content?.trim() ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            ) : (
              <p className="text-sm text-gray-400 text-center mt-20">
                {t("previewPlaceholder")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate;
