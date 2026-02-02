"use client";

import { useState } from "react";
import { FiSearch, FiPlus, FiCopy } from "react-icons/fi";
import AddEditColorModal from "./AddEditColorModal";

const ColorsTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedColor, setSelectedColor] = useState(null);

  const colors = [
    {
      name: "Navy Blue",
      hex: "#003B5C",
      rgb: "rgb(0, 59, 92)",
      swatch: "#003B5C",
    },
    {
      name: "Ivory",
      hex: "#FFFAE5",
      rgb: "rgb(255, 250, 229)",
      swatch: "#FFFAE5",
    },
    {
      name: "Burgundy",
      hex: "#800020",
      rgb: "rgb(128, 0, 32)",
      swatch: "#800020",
    },
    {
      name: "Black",
      hex: "#000000",
      rgb: "rgb(0, 0, 0)",
      swatch: "#000000",
    },
    {
      name: "Teal",
      hex: "#00A99D",
      rgb: "rgb(0, 169, 157)",
      swatch: "#00A99D",
    },
  ];

  const handleAddColor = () => {
    setModalMode("add");
    setSelectedColor(null);
    setIsModalOpen(true);
  };

  const handleEditColor = (color) => {
    setModalMode("edit");
    setSelectedColor(color);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              Color Palette
            </h2>
            <p className="text-sm text-[#486284]">
              {colors.length} colors available
            </p>
          </div>

          <button
            onClick={handleAddColor}
            className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
          >
            <FiPlus size={14} />
            Add Color
          </button>
        </div>

        <div className="relative w-full md:w-72 mb-6">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Colors..."
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {colors.map((color, index) => (
            <div
              key={index}
              className="border border-[#1C2C5633] rounded-xl overflow-hidden bg-white hover:shadow-md transition"
            >
              <div
                className="h-52"
                style={{ backgroundColor: color.swatch }}
              />

              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#1C2C56]">
                  {color.name}
                </h3>

                <p className="text-xs text-[#486284] mt-1">
                  {color.hex} &nbsp; {color.rgb}
                </p>

                <div className="mt-3">
                  <p className="text-xs text-[#486284] mb-1">
                    Compatible Fabrics:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {["Cotton", "Polyester", "Silk"].map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#1C2C56]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditColor(color)}
                    className="flex-1 bg-[#1C2C56] text-white text-xs py-1.5 rounded-md"
                  >
                    Edit
                  </button>

                  <button className="flex-1 border border-[#1C2C56] text-[#1C2C56] text-xs py-1.5 rounded-md flex items-center justify-center gap-1">
                    <FiCopy size={12} />
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddEditColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedColor}
      />
    </>
  );
};

export default ColorsTab;
