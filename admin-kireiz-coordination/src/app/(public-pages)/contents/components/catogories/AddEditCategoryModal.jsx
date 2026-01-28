"use client";

import { useEffect, useState, useRef } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiUpload } from "react-icons/fi";

const AddEditCategoryModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
}) => {
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);

  /* ================= PREFILL / RESET ================= */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPreview(initialData.image || null);

      setImageFile(null);
      setValidated(true);
    } else {
      // ✅ RESET FOR ADD MODE
      setName("");
      setDescription("");
      setImageFile(null);
      setPreview(null);
      setValidated(false);
    }
  }, [mode, initialData, isOpen]);

  /* ================= FILE HANDLERS ================= */
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

  /* ================= SAVE ================= */
  const handleSave = () => {
    const payload = {
      name,
      description,
      image: imageFile,
    };

    if (mode === "edit") {
      console.log("EDIT CATEGORY:", payload);
    } else {
      console.log("ADD CATEGORY:", payload);
    }

    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[620px] mx-auto"
    >
      <div className="flex flex-col">
        {/* ================= HEADER ================= */}
        <div className="border-b p-2 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? "Edit Categories" : "Create Categories"}
          </h2>
        </div>

        {/* ================= BODY ================= */}
        <div className="md:px-5 py-5 space-y-5 overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Name<span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Eg:- Cotton Canvas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Image<span className="text-red-500">*</span>
            </label>

            {/* Upload Button */}
            <button
              className="w-full bg-[#1C2C56] text-white py-2 rounded-md text-sm mt-2 flex items-center justify-center gap-2"
              onClick={() => fileInputRef.current.click()}
            >
              <FiUpload size={16} />
              Upload image
            </button>

            {/* Drag Drop Box */}
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

              <p className="text-xs mt-2 text-[#64748B]">PNG files only</p>
              <p className="text-xs mt-2 text-[#64748B]">
                Maximum dimension 1000×1000px
              </p>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              accept="image/png"
              ref={fileInputRef}
              className="hidden"
              onChange={handleBrowse}
            />
          </div>

          {/* Validated */}
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

          {/* Description */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              Description
            </label>

            <textarea
              placeholder="type....."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm h-[90px] resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
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

export default AddEditCategoryModal;
