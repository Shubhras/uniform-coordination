"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateBlog, apiUpdateBlog, apiGetBlogCategoryList } from "@/services/BlogService";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#1C2C56" : "#E2E8F0",
    boxShadow: "none",
    "&:hover": { borderColor: "#1C2C56" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1C2C56"
      : state.isFocused
        ? "#EEF2FF"
        : "white",
    color: state.isSelected ? "white" : "#1E293B",
    fontSize: "14px",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddEditBlogModal = ({ isOpen, onClose, mode = "add", initialData, onSaveSuccess }) => {
  const fileInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);

  // Category options from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    if (!isOpen || !accessToken) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await apiGetBlogCategoryList(accessToken);
        if (response?.status && response?.data) {
          const options = response.data.map((c) => ({
            value: c.id,
            label: c.categoryName,
          }));
          setCategoryOptions(options);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen, accessToken]);

  /* ---------- RESET / PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPreview(initialData.image || null);
      setImageFile(null);
      setValidated(Boolean(initialData.image));

      // Pre-select category by name
      if (initialData.categoryName) {
        setCategory({ value: initialData.category || initialData.id, label: initialData.categoryName });
      } else {
        setCategory(null);
      }
    } else {
      setTitle("");
      setCategory(null);
      setDescription("");
      setImageFile(null);
      setPreview(null);
      setValidated(false);
    }
    setError("");
  }, [mode, initialData, isOpen]);

  // Resolve category label once options load (edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData?.categoryName && categoryOptions.length > 0) {
      const match = categoryOptions.find((c) => c.label === initialData.categoryName);
      if (match) setCategory(match);
    }
  }, [categoryOptions, mode, initialData]);

  /* ---------- FILE HANDLERS ---------- */
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setValidated(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0]);
  };

  const handleBrowse = (event) => {
    handleFile(event.target.files[0]);
  };

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setTitle("");
    setCategory(null);
    setDescription("");
    setImageFile(null);
    setPreview(null);
    setValidated(false);
    setError("");
  };

  /* ---------- SAVE ---------- */
  const handleSave = async ({ keepOpen = false } = {}) => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());

      if (category) {
        formData.append("category", category.value);
      }
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (mode === "edit" && initialData?.id) {
        await apiUpdateBlog(accessToken, initialData.id, formData);
      } else {
        await apiCreateBlog(accessToken, formData);
      }

      if (keepOpen && mode !== "edit") {
        resetForm();
        // Re-fetch list in background
        if (onSaveSuccess) onSaveSuccess();
        return;
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Blog save error:", err);
      setError(err?.response?.data?.message || "Failed to save blog. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[720px] mx-auto"
    >
      <div className="flex flex-col">
        <div className="border-b p-2 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? "Edit Blog" : "Create Blog"}
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="md:px-5 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Type blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>

          {/* Category (React Select from API) */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Category<span className="text-red-500">*</span>
            </label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              styles={selectStyles}
              placeholder="Select category..."
              isLoading={loadingCategories}
              loadingMessage={() => "Loading categories..."}
              noOptionsMessage={() => "No categories found"}
              isClearable
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
              className="mt-1"
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Image<span className="text-red-500">*</span>
            </label>

            <button
              className="w-full bg-[#1C2C56] text-white py-2 rounded-md text-sm mt-2 flex items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload size={16} />
              Upload image
            </button>

            <div
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
            >
              Drag & Drop your image here
              <br />
              or{" "}
              <span
                className="text-[#1C2C56] underline cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                click to browse here
              </span>

              <p className="text-xs mt-2 text-[#64748B]">
                JPG, PNG, or WEBP files
              </p>
              <p className="text-xs mt-2 text-[#64748B]">
                Recommended size 1200×800px
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleBrowse}
            />
          </div>

          {validated && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              ✔ Image validated successfully
            </p>
          )}

          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-28 object-cover rounded-lg shadow"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Type blog description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm h-[150px] resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="plain"
            size="sm"
            onClick={() => handleSave({ keepOpen: true })}
            disabled={saving}
          >
            Save & Add Another
          </Button>

          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
            onClick={() => handleSave({ keepOpen: false })}
            loading={saving}
          >
            {mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditBlogModal;
