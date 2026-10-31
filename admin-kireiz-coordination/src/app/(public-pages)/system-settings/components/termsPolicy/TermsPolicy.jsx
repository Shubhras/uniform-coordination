"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  FiEdit2,
  FiFileText,
  FiCheck,
  FiPlus,
  FiSave,
  FiX,
  FiFilePlus,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetPrivacyPolicyList,
  apiCreatePrivacyPolicy,
  apiUpdatePrivacyPolicy,
} from "@/services/PrivacyPolicyService";

const TABS = [
  {
    id: "privacy",
    typeKey: "privacy_and_policy",
    labelKey: "privacyPolicy",
  },
  {
    id: "terms",
    typeKey: "terms_and_conditions",
    labelKey: "termsAndConditions",
  },
];

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>
  );

const extractFirstItem = (res) => {
  if (!res) return null;
  const data = res.data !== undefined ? res.data : res;
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  if (data.results && Array.isArray(data.results)) {
    return data.results.length > 0 ? data.results[0] : null;
  }
  if (typeof data === "object" && (data.id || data.title || data.content)) {
    return data;
  }
  return null;
};

const formatDate = (doc) => {
  const rawDate =
    doc?.updated_at ||
    doc?.updatedAt ||
    doc?.created_at ||
    doc?.createdAt ||
    doc?.date;
  if (!rawDate) return "30/10/2026";
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return "30/10/2026";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "30/10/2026";
  }
};

const isContentEmpty = (html) => {
  if (!html || typeof html !== "string") return true;
  const clean = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return clean.length === 0 && !html.includes("<hr") && !html.includes("<img");
};

const TermsPolicy = () => {
  const t = useTranslations("systemSettings.termsPolicy");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [activeTabId, setActiveTabId] = useState("privacy");
  const [activeDoc, setActiveDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form (Add / Edit) state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [errors, setErrors] = useState({ title: "", content: "" });
  const [editorKey, setEditorKey] = useState(0);

  const activeTabConfig =
    TABS.find((t) => t.id === activeTabId) || TABS[0];
  const currentTabLabel = t(activeTabConfig.labelKey);

  // Fetch document for the selected policy type
  const fetchPolicy = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetPrivacyPolicyList(
        accessToken,
        activeTabConfig.typeKey,
        "table"
      );
      const item = extractFirstItem(res);
      setActiveDoc(item);
    } catch (error) {
      console.error("Failed to load policy document:", error);
      setActiveDoc(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, activeTabConfig.typeKey]);

  useEffect(() => {
    setIsFormOpen(false);
    setErrors({ title: "", content: "" });
    fetchPolicy();
  }, [fetchPolicy]);

  // Open "Add" mode
  const handleOpenAdd = () => {
    setFormMode("create");
    setFormData({
      title: "",
      content: "",
    });
    setErrors({ title: "", content: "" });
    setEditorKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  // Open "Edit" mode
  const handleOpenEdit = () => {
    if (!activeDoc) return;
    setFormMode("edit");
    setFormData({
      title: activeDoc.title || "",
      content: activeDoc.content || "",
    });
    setErrors({ title: "", content: "" });
    setEditorKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setErrors({ title: "", content: "" });
    setIsFormOpen(false);
  };

  // Submit Add or Edit
  const handleSubmit = async (e) => {
    e?.preventDefault();

    const newErrors = {};
    if (!formData.title?.trim()) {
      newErrors.title = t("titleRequired");
    }

    if (isContentEmpty(formData.content)) {
      newErrors.content = t("contentRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({ title: "", content: "" });

    try {
      setSubmitting(true);

      if (formMode === "create") {
        const payload = {
          title: formData.title.trim(),
          privacyPolicyType: activeTabConfig.typeKey,
          type: "table",
          content: formData.content,
          language: "en",
          version: "1.0",
          isActive: true,
        };

        const res = await apiCreatePrivacyPolicy(accessToken, payload);
        if (res?.status === false) {
          notify(t("errorTitle"), "danger", res?.message || t("createError"));
          return;
        }

        notify(
          t("successTitle"),
          "success",
          t("createSuccess", { type: currentTabLabel })
        );
      } else {
        const payload = {
          title: formData.title.trim(),
          privacyPolicyType: activeTabConfig.typeKey,
          type: "table",
          content: formData.content,
          language: activeDoc?.language || "en",
          version: activeDoc?.version || "1.0",
          isActive: activeDoc?.isActive ?? true,
        };

        const res = await apiUpdatePrivacyPolicy(
          accessToken,
          activeDoc.id,
          payload
        );
        if (res?.status === false) {
          notify(t("errorTitle"), "danger", res?.message || t("updateError"));
          return;
        }

        notify(
          t("successTitle"),
          "success",
          t("updateSuccess", { type: currentTabLabel })
        );
      }

      setIsFormOpen(false);
      await fetchPolicy();
    } catch (error) {
      console.error("Save policy error:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        t("unexpectedError");
      notify(t("errorTitle"), "danger", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
      {/* Left Navigation: Privacy Policy & Terms and Conditions */}
      <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (activeTabId !== tab.id) {
                setActiveTabId(tab.id);
              }
            }}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTabId === tab.id
              ? "bg-[#F1F5F9] text-[#1C2C56] font-semibold shadow-xs"
              : "text-[#64748B] hover:text-[#1C2C56] hover:bg-gray-50"
              }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Right Main Content Area */}
      <div className="flex-1 w-full min-w-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-[#1C2C56]">
            {currentTabLabel}
          </h2>

          {!isFormOpen && (
            activeDoc ? (
              /* When data exists: show EDIT button */
              <button
                type="button"
                onClick={handleOpenEdit}
                className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#163F86] transition-colors"
              >
                <FiEdit2 size={15} />
                <span>{t("edit")}</span>
              </button>
            ) : (
              /* When data is null: show ADD button */
              <button
                type="button"
                onClick={handleOpenAdd}
                className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#163F86] transition-colors"
              >
                <FiPlus size={16} />
                <span>{t("add")}</span>
              </button>
            )
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="border border-[#E2E8F0] rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ) : isFormOpen ? (
          /* Form (Add / Edit) View: Title & Content */
          <div className="border border-[#E2E8F0] rounded-2xl bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#1C2C56] mb-5">
              {formMode === "create"
                ? t("addTitle", { type: currentTabLabel })
                : t("editTitle", { type: currentTabLabel })}
            </h3>

            <div className="space-y-6">
              {/* Section 1: Title */}
              <div>
                <label className="block text-sm font-semibold text-[#1C2C56] mb-1.5">
                  {t("titleLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, title: e.target.value }));
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: "" }));
                    }
                  }}
                  placeholder={t("titlePlaceholder", { type: currentTabLabel })}
                  className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-[#1C2C56] font-medium outline-none transition-all ${errors.title
                      ? "border-red-500 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                      : "border-[#CBD5E1] focus:ring-2 focus:ring-blue-200 focus:border-[#1C4FA8]"
                    }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>
                )}
              </div>

              {/* Section 2: Content */}
              <div>
                <label className="block text-sm font-semibold text-[#1C2C56] mb-1.5">
                  {t("contentLabel")} <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-xl overflow-hidden transition-all ${errors.content
                      ? "border border-red-500 ring-1 ring-red-500"
                      : "border border-[#CBD5E1]"
                    }`}
                >
                  <RichTextEditor
                    key={editorKey}
                    content={formData.content}
                    invalid={Boolean(errors.content)}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, content: val.html }));
                      if (errors.content) {
                        setErrors((prev) => ({ ...prev, content: "" }));
                      }
                    }}
                    editorContentClass="min-h-[350px] p-4 text-[#1C2C56]"
                  />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>
                )}
              </div>

              {/* Form Bottom Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#163F86] transition-colors"
                >
                  <FiSave size={15} />
                  <span>
                    {submitting
                      ? t("saving")
                      : formMode === "create"
                        ? t("savePolicy")
                        : t("saveChanges")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : activeDoc ? (
          /* View Mode: When activeDoc exists */
          <div className="border border-[#E2E8F0] rounded-2xl bg-white p-6 sm:p-8 shadow-sm">
            {/* Card Top Meta Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="font-semibold text-[#1C2C56] text-base sm:text-lg">
                    {activeDoc.title || currentTabLabel}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {t("updated")} {formatDate(activeDoc)}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  v{activeDoc.version || "1.0"}
                </span>
                <span className="bg-[#ECFDF5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <FiCheck size={12} className="stroke-[3]" />
                  {activeDoc.isActive ?? true ? t("active") : t("inactive")}
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-[#F1F5F9] my-6" />

            {/* Document HTML Content */}
            <div
              className="prose max-w-none text-[#475569] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: activeDoc.content || "" }}
            />
          </div>
        ) : (
          /* Empty State: When activeDoc is null */
          <div className="border border-dashed border-[#CBD5E1] rounded-2xl bg-[#F8FAFC] p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 text-[#1C4FA8] flex items-center justify-center mb-4">
              <FiFilePlus size={26} />
            </div>
            <h3 className="text-lg font-semibold text-[#1C2C56] mb-1">
              {t("noDocumentFound", { type: currentTabLabel })}
            </h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
              {t("noDocumentDesc", { type: currentTabLabel })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsPolicy;
