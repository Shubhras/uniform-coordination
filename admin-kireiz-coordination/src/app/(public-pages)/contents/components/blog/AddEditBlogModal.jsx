"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiUpload } from "react-icons/fi";

const AddEditBlogModal = ({ isOpen, onClose, mode = "add", initialData }) => {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setCategory(initialData.category || "");
      setDate(initialData.date || "");
      setDescription(initialData.desc || "");
      setPreview(initialData.img || null);
      setImageFile(null);
      setValidated(Boolean(initialData.img));
      return;
    }

    setTitle("");
    setCategory("");
    setDate("");
    setDescription("");
    setImageFile(null);
    setPreview(null);
    setValidated(false);
  }, [mode, initialData, isOpen]);

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

  const handleSave = ({ keepOpen }) => {
    const payload = {
      title,
      category,
      date,
      description,
      image: imageFile,
    };

    if (mode === "edit") {
      console.log("EDIT BLOG:", payload);
    } else {
      console.log("ADD BLOG:", payload);
    }

    if (keepOpen && mode !== "edit") {
      setTitle("");
      setCategory("");
      setDate("");
      setDescription("");
      setImageFile(null);
      setPreview(null);
      setValidated(false);
      return;
    }

    onClose();
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

        <div className="md:px-5 py-5 space-y-5 overflow-y-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                Category<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Type category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
              />
            </div>

            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                Date<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="08-11-2025"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
              />
            </div>
          </div>

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
          <Button variant="plain" onClick={onClose} size="sm">
            Cancel
          </Button>

          <Button
            variant="plain"
            size="sm"
            onClick={() => handleSave({ keepOpen: true })}
          >
            Save & Add Another
          </Button>

          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
            onClick={() => handleSave({ keepOpen: false })}
          >
            {mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditBlogModal;
