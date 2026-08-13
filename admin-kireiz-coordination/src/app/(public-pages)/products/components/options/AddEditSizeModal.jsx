"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Select from "react-select";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateAttributeOption,
  apiUpdateAttributeOption,
} from "@/services/AttributeOptionService";
import { apiFabricCategoryList } from "@/services/FabricService";

/*
 * Add or edit one size.
 *
 * Stored as an AttributeOption with attribute="size". No image field here — a size is a
 * label, and the backend only requires artwork for the attributes a shopper picks from a
 * picture.
 */

const ATTRIBUTE = "size";

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#1C2C56" : "#CBD5E1",
    boxShadow: "none",
    "&:hover": { borderColor: "#1C2C56" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddEditSizeModal = ({ isOpen, onClose, initialData, onSaveSuccess }) => {
  const t = useTranslations("productSpecification.sizes");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const isEdit = Boolean(initialData?.id);

  const [name, setName] = useState("");
  const [order, setOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const loadCategories = async () => {
      try {
        const res = await apiFabricCategoryList(accessToken);
        if (res?.status && res?.data) {
          setCategoryOptions([
            // No category means the size is offered everywhere, the same rule fabrics
            // follow.
            { value: "", label: t("allCategories") },
            ...res.data.map((c) => ({ value: c.id, label: c.categoryName })),
          ]);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, [isOpen, accessToken, t]);

  useEffect(() => {
    if (!isOpen) return;

    setError("");

    if (isEdit) {
      setName(initialData.name || "");
      setOrder(String(initialData.order ?? 1));
      setIsActive(initialData.isActive ?? true);
      setCategory(
        initialData.category
          ? { value: initialData.category, label: initialData.categoryName }
          : { value: "", label: t("allCategories") },
      );
    } else {
      setName("");
      setOrder("1");
      setIsActive(true);
      setCategory({ value: "", label: t("allCategories") });
    }
  }, [isOpen, isEdit, initialData, t]);

  const handleSave = async () => {
    if (!accessToken || saving) return;

    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("attribute", ATTRIBUTE);
    formData.append("name", name.trim());
    formData.append("order", Number(order) || 0);
    formData.append("isActive", isActive);
    // Empty detaches the category, making the size global.
    formData.append("category", category?.value ?? "");

    try {
      setSaving(true);
      const res = isEdit
        ? await apiUpdateAttributeOption(accessToken, initialData.id, formData)
        : await apiCreateAttributeOption(accessToken, formData);

      if (res?.status) {
        notify("Success", "success", isEdit ? t("updated") : t("created"));
        onSaveSuccess?.();
      } else {
        const detail =
          res?.error && typeof res.error === "object"
            ? Object.values(res.error).flat().join(" ")
            : res?.message;
        setError(detail || t("saveFailed"));
      }
    } catch (err) {
      console.error("Failed to save size:", err);
      setError(err?.response?.data?.message || t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={480}>
      <h4 className="text-lg font-semibold text-[#1C2C56]">
        {isEdit ? t("editTitle") : t("addTitle")}
      </h4>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-[#1C2C56]">
            {t("nameLabel")}
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#1C2C56]">
              {t("categoryLabel")}
            </label>
            <Select
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              styles={selectStyles}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C2C56]">
              {t("orderLabel")}
            </label>
            <Input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-[#1C2C56]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-[#1C4FA8]"
          />
          {t("activeLabel")}
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1C2C56] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? t("saving") : isEdit ? t("update") : t("save")}
        </button>
      </div>
    </Dialog>
  );
};

export default AddEditSizeModal;
