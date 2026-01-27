"use client";

import { useEffect, useState, useRef } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";

const AddEditPartModal = ({ isOpen, onClose, mode = "add", initialData }) => {
  const fileInputRef = useRef(null);

  const categoryOptions = [
    { value: "body", label: "Body" },
    { value: "sleeves", label: "Sleeves" },
    { value: "details", label: "Details" },
    { value: "pockets", label: "Pockets" },
  ];

  const subCategoryOptions = [
    { value: "collar", label: "Collar" },
    { value: "right-sleeve", label: "Right Sleeve" },
    { value: "left-sleeve", label: "Left Sleeve" },
  ];

  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "8px",
      borderColor: "#E2E8F0",
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

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setCategory(
        categoryOptions.find(c => c.label === initialData.category) || null
      );
      setSubCategory(null);
      setImageFile(null);
      setPreview(initialData.image || null);
      setValidated(true);
    } else {
      // ✅ RESET EVERYTHING FOR ADD MODE
      setCategory(null);
      setSubCategory(null);
      setImageFile(null);
      setPreview(null);
      setValidated(false);
    }
  }, [mode, initialData, isOpen]);


  /* ---------------- FILE HANDLERS ---------------- */

  const handleFile = (file) => {
    if (!file || file.type !== "image/png") return;

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

  const handleSave = () => {
    const payload = {
      category: category?.value,
      subCategory: subCategory?.value,
      image: imageFile,
    };

    if (mode === "edit") {
      console.log("EDIT PART:", payload);
    } else {
      console.log("ADD PART:", payload);
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

        {/* HEADER */}
        <div className="border-b p-2 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? "Edit Part" : "Upload New Part"}
          </h2>
        </div>

        {/* BODY */}
        <div className=" md:px-5 py-5 space-y-5 overflow-y-auto">

          {/* Category */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Category
            </label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              styles={selectStyles}
              placeholder="Select Category"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="mt-1"
            />
          </div>

          {/* Sub Category */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Sub Category
            </label>
            <Select
              options={subCategoryOptions}
              value={subCategory}
              onChange={setSubCategory}
              styles={selectStyles}
              placeholder="Select Category"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="mt-1"
            />
          </div>

          {/* Upload */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Upload image
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
              Drag & Drop your PNG file here
              <br />
              or{" "}
              <span
                className="text-[#1C2C56] underline cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                click to browse here
              </span>

              <p className="text-xs mt-2 text-[#64748B]">
                PNG files only
              </p>
              <p className="text-xs mt-2 text-[#64748B]">
                Maximum dimension 1000×1000px
              </p>
            </div>

            <input
              type="file"
              accept="image/png"
              ref={fileInputRef}
              className="hidden"
              onChange={handleBrowse}
            />
          </div>

          {/* Validation */}
          {validated && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              ✔ Image validated successfully
            </p>
          )}

          {/* Preview */}
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

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button variant="plain" onClick={onClose} size="sm">
            Cancel
          </Button>

          <Button variant="plain" size="sm">
            Save & Add Another
          </Button>

          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
            onClick={handleSave}
          >
            {mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>

      </div>
    </Dialog>
  );
};

export default AddEditPartModal;
