"use client";

import { useEffect, useState, useRef } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreatePart, apiUpdatePart } from "@/services/PartsService";
import { apiGetFabricList } from "@/services/FabricService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const AddEditPartModal = ({ isOpen, onClose, mode = "add", initialData, onSaveSuccess }) => {
  const fileInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const categoryOptions = [
    { value: "body", label: "Body" },
    { value: "caps", label: "Caps" },
    { value: "collars", label: "Collars" },
    { value: "cuffs", label: "Cuffs" },
    { value: "hoods", label: "Hoods" },
    { value: "pockets", label: "Pockets" },
    { value: "sleeves", label: "Sleeves" },
    { value: "straps", label: "Straps" },
  ];

  // Form fields
  const [partName, setPartName] = useState("");
  const [category, setCategory] = useState(null);
  const [fabric, setFabric] = useState(null);
  const [zIndex, setZIndex] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);

  // Fabric options from API
  const [fabricOptions, setFabricOptions] = useState([]);
  const [loadingFabrics, setLoadingFabrics] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------- SELECT STYLES ---------- */
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

  /* ---------- FETCH FABRICS ---------- */
  useEffect(() => {
    if (!isOpen || !accessToken) return;

    const fetchFabrics = async () => {
      setLoadingFabrics(true);
      try {
        const response = await apiGetFabricList(accessToken, 1, 100);
        if (response?.status && response?.data) {
          const options = response.data
            .filter((f) => f.isActive && !f.isDeleted)
            .map((f) => ({
              value: f.id,
              label: f.fabricName,
            }));
          setFabricOptions(options);
        }
      } catch (err) {
        console.error("Failed to load fabrics:", err);
      } finally {
        setLoadingFabrics(false);
      }
    };

    fetchFabrics();
  }, [isOpen, accessToken]);

  /* ---------- RESET / PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setPartName(initialData.partName || "");
      setCategory(
        categoryOptions.find((c) => c.value === initialData.category) || null
      );
      setZIndex(initialData.zIndex?.toString() || "");
      setImageFile(null);

      // Build preview from API image
      if (initialData.partImage) {
        const imgUrl = initialData.partImage.startsWith("http")
          ? initialData.partImage
          : `${API_BASE}${initialData.partImage}`;
        setPreview(imgUrl);
      } else {
        setPreview(null);
      }
      setValidated(!!initialData.partImage);

      // Pre-select fabric
      if (initialData.fabric) {
        // fabric is an ID from API response
        setFabric({ value: initialData.fabric, label: `Fabric #${initialData.fabric}` });
      } else {
        setFabric(null);
      }
    } else {
      // RESET for add mode
      setPartName("");
      setCategory(null);
      setFabric(null);
      setZIndex("");
      setImageFile(null);
      setPreview(null);
      setValidated(false);
    }
    setError("");
  }, [mode, initialData, isOpen]);

  // Update fabric label once fabricOptions load (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData?.fabric && fabricOptions.length > 0) {
      const match = fabricOptions.find((f) => f.value === initialData.fabric);
      if (match) {
        setFabric(match);
      }
    }
  }, [fabricOptions, mode, initialData]);

  /* ---------- FILE HANDLERS ---------- */
  const handleFile = (file) => {
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setValidated(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleBrowse = (e) => {
    handleFile(e.target.files[0]);
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    // Validation
    if (!partName.trim()) {
      setError("Part name is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("partName", partName.trim());
      formData.append("category", category.value);

      if (fabric) {
        formData.append("fabric", fabric.value);
      }
      if (zIndex) {
        formData.append("zIndex", zIndex);
      }
      if (imageFile) {
        formData.append("partImage", imageFile);
      }

      if (mode === "edit" && initialData?.id) {
        await apiUpdatePart(accessToken, initialData.id, formData);
      } else {
        await apiCreatePart(accessToken, formData);
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Part save error:", err);
      setError(err?.response?.data?.message || "Failed to save part. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[620px] mx-auto"
    >
      <div className="flex flex-col">

        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? "Edit Part" : "Upload New Part"}
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="md:px-5 py-5 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Part Name */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Part Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="Eg:- Premium Collar"
              className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Category<span className="text-red-500">*</span>
            </label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              styles={selectStyles}
              placeholder="Select Category"
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
              className="mt-1"
            />
          </div>

          {/* Fabric (from API) */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Fabric
            </label>
            <Select
              options={fabricOptions}
              value={fabric}
              onChange={setFabric}
              styles={selectStyles}
              placeholder="Select Fabric"
              isLoading={loadingFabrics}
              loadingMessage={() => "Loading fabrics..."}
              noOptionsMessage={() => "No fabrics found"}
              isClearable
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
              className="mt-1"
            />
          </div>

          {/* z-Index */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              z-Index
            </label>
            <input
              type="number"
              value={zIndex}
              onChange={(e) => setZIndex(e.target.value)}
              placeholder="Eg:- 1"
              className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Upload Image
            </label>

            <button
              className="w-full bg-[#1C2C56] text-white py-2 rounded-md text-sm mt-2"
              onClick={() => fileInputRef.current.click()}
            >
              Upload image
            </button>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
            >
              Drag & Drop your image file here
              <br />
              or{" "}
              <span
                className="text-[#1C2C56] underline cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                click to browse here
              </span>

              <p className="text-xs mt-2 text-[#64748B]">
                PNG, JPG, JPEG files
              </p>
              <p className="text-xs mt-2 text-[#64748B]">
                Maximum dimension 1000×1000px
              </p>
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
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
                className="w-32 h-32 object-contain rounded-lg shadow"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
            onClick={handleSave}
            loading={saving}
          >
            {mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>

      </div>
    </Dialog>
  );
};

export default AddEditPartModal;
