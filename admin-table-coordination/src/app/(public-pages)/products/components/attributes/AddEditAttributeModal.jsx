"use client";

import { useState, useEffect } from "react";
import { FiX, FiUploadCloud } from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useTranslations } from "next-intl";

const AddEditAttributeModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData = null,
  attributeTitle = "Item",
  service = null,
  onSaveSuccess,
}) => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const t = useTranslations("productSpecification.fabric");
  const ts = useTranslations("successTitle");

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setName(initialData.name || "");
        setImagePreview(initialData.image || "");
      } else {
        setName("");
        setImageFile(null);
        setImagePreview("");
      }
      setError("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`Please enter a valid ${attributeTitle} name.`);
      return;
    }
    if (!accessToken || !service) return;

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", name.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;
      if (mode === "add") {
        response = await service.create(accessToken, formData);
      } else {
        response = await service.update(accessToken, initialData.id, formData);
      }

      if (response?.status || response?.statusCode === 200) {
        toast.push(
          <Notification title={ts("success")} type="success">
            {response.message || `${attributeTitle} saved successfully!`}
          </Notification>,
        );
        onSaveSuccess();
      } else {
        const errMsg =
          typeof response?.message === "string"
            ? response.message
            : Object.values(response?.message || {}).flat()[0] ||
              `Failed to save ${attributeTitle}.`;
        setError(errMsg);
      }
    } catch (err) {
      console.error(`Error saving ${attributeTitle}:`, err);
      setError(`An unexpected error occurred while saving ${attributeTitle}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#1C2C56]">
            {mode === "add"
              ? t("addAttribute", { attribute: attributeTitle })
              : t("editAttribute", { attribute: attributeTitle })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1C2C56] mb-1">
              {attributeTitle} {t("name")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("enterName", {
                attribute: attributeTitle.toLowerCase(),
              })}
              className="w-full border border-[#00345F] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C2C56] mb-1">
              {t("imageOptional")}
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center relative hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 object-contain rounded mb-2"
                  />
                  <span className="text-xs text-[#A0522D] font-medium">
                    {t("clickToChangeImage")}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FiUploadCloud size={28} className="mb-1" />
                  <span className="text-xs"> {t("clickToChangeImage")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#A0522D] text-white px-5 py-2 text-xs font-semibold rounded-lg hover:bg-[#8B4513] disabled:opacity-50 transition-colors"
            >
              {loading
                ? t("saving")
                : mode === "add"
                  ? t("addItem")
                  : t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditAttributeModal;
