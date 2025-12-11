"use client";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

export default function ColorPickerPopup({ value, onChange, onClose }) {
  const [color, setColor] = useState(value);

  function updateColor(newColor) {
    setColor(newColor);
    onChange(newColor);
  }

  return (
    <div className="absolute top-12 left-0 bg-white shadow-xl rounded-xl p-4 z-50 w-[260px]">

      {/* Close Btn */}
      <div className="flex justify-end mb-2">
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
        >
          ✕
        </button>
      </div>

      {/* Color Picker */}
      <HexColorPicker color={color} onChange={updateColor} />

      {/* Selected Color Bubble */}
      <div className="mt-3 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border"
          style={{ background: color }}
        />

        <span className="text-sm font-semibold">{color.toUpperCase()}</span>
      </div>
    </div>
  );
}
