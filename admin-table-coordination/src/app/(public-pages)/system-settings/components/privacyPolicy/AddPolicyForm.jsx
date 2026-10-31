"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Spinner from "@/components/ui/Spinner";
import Switcher from "@/components/ui/Switcher";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { apiCreatePrivacyPolicy, apiUpdatePrivacyPolicy } from "@/services/PrivacyPolicyService";

const isContentEmpty = (html) => {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
};

const AddPolicyForm = ({
  activeSection,
  sectionTitle,
  accessToken,
  initialData = null,
  onCancel,
  onSuccess,
}) => {
  const t = useTranslations("systemSettings.policyTab.form");
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [version, setVersion] = useState(initialData?.version || "1.0");
  const [language, setLanguage] = useState(initialData?.language || "en");
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [content, setContent] = useState(initialData?.content || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ title: "", content: "" });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      setIsActive(initialData.isActive !== false);
      setVersion(initialData.version || "1.0");
      setLanguage(initialData.language || "en");
    } else {
      setTitle("");
      setContent("");
      setIsActive(true);
      setVersion("1.0");
      setLanguage("en");
    }
    setErrors({ title: "", content: "" });
  }, [activeSection, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = { title: "", content: "" };
    let hasError = false;

    if (!title.trim()) {
      newErrors.title = t("titleRequired") || "Title is required";
      hasError = true;
    }

    if (isContentEmpty(content)) {
      newErrors.content = t("contentRequired") || "Content is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      setErrors({ title: "", content: "" });

      const payload = {
        title: title.trim(),
        privacyPolicyType: activeSection,
        type: "table",
        content: content.trim(),
        language,
        version: version.trim() || "1.0",
        isActive,
      };

      if (isEdit) {
        await apiUpdatePrivacyPolicy(accessToken, initialData.id, payload);
        toast.push(
          <Notification title={t("successTitle") || "Success"} type="success">
            {t("updateSuccess", { section: sectionTitle }) || `${sectionTitle} updated successfully!`}
          </Notification>
        );
      } else {
        await apiCreatePrivacyPolicy(accessToken, payload);
        toast.push(
          <Notification title={t("successTitle") || "Success"} type="success">
            {t("createSuccess", { section: sectionTitle }) || `${sectionTitle} created successfully!`}
          </Notification>
        );
      }

      onSuccess?.();
    } catch (err) {
      console.error(`Error ${isEdit ? "updating" : "creating"} policy:`, err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        (isEdit
          ? t("updateFailed", { section: sectionTitle }) || `Failed to update ${sectionTitle}`
          : t("createFailed", { section: sectionTitle }) || `Failed to create ${sectionTitle}`);
      toast.push(
        <Notification title={t("errorTitle") || "Error"} type="danger">
          {errMsg}
        </Notification>
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8DDD4] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">
            {isEdit
              ? t("editTitle", { section: sectionTitle }) || `Edit ${sectionTitle}`
              : t("createTitle", { section: sectionTitle }) || `Create ${sectionTitle}`}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#E8DDD4] bg-white px-4 py-2 text-sm font-medium text-[#6E5A4D] hover:bg-gray-50 transition cursor-pointer"
        >
          {t("back") || "Back"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-[15px] font-medium text-[#8C6E5D] mb-1">
            {t("titleLabel") || "Title"} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: "" }));
              }
            }}
            placeholder={
              t("titlePlaceholder", { section: sectionTitle }) ||
              `e.g. ${sectionTitle} for Space App`
            }
            className={`w-full h-12 rounded-xl border bg-[#FCFAF8] px-4 outline-none transition ${errors.title
              ? "border-red-500 focus:border-red-500"
              : "border-[#E9DDD3] focus:border-[#A85A32]"
              }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.title}
            </p>
          )}
        </div>


        {/* Content Editor */}
        <div>
          <label className="block text-[15px] font-medium text-[#8C6E5D] mb-1.5">
            {t("contentLabel") || "Content"} <span className="text-red-500">*</span>
          </label>
          <div
            className={`border rounded-xl overflow-hidden bg-white min-h-[220px] transition ${errors.content
              ? "border-red-500 focus-within:border-red-500"
              : "border-[#E9DDD4]"
              }`}
          >
            <RichTextEditor
              content={content}
              onChange={(data) => {
                setContent(data.html);
                if (errors.content && !isContentEmpty(data.html)) {
                  setErrors((prev) => ({ ...prev, content: "" }));
                }
              }}
            />
          </div>
          {errors.content && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.content}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DDD4]">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-[#E8DDD4] bg-white px-6 py-2.5 text-sm font-medium text-[#6E5A4D] hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl bg-[#A0522D] hover:bg-[#8B4513] px-6 py-2.5 text-sm font-medium text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
          >
            {saving ? (
              <>
                <Spinner size={16} customColorClass="text-white" />
                <span>
                  {isEdit ? t("updating") || "Updating..." : t("creating") || "Creating..."}
                </span>
              </>
            ) : (
              <span>
                {isEdit
                  ? t("updateBtn", { section: sectionTitle }) || `Update ${sectionTitle}`
                  : t("createBtn", { section: sectionTitle }) || `Create ${sectionTitle}`}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPolicyForm;
