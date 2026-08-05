"use client";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

/**
 * ColorPickerPopup Component
 *
 * Displays a hex color picker popup allowing the user to select a
 * color, previews the selected color with its hex code, and notifies
 * the parent via onChange as the color updates.
 */
export default function ColorPickerPopup({ value, onChange, onClose }) {
  const [color, setColor] = useState(value);

   /**
   * Updates the local color state and notifies the parent
   * component of the new selected color.
   */
  function updateColor(newColor) {
    setColor(newColor);
    onChange(newColor);
  }
  return (
    <div className="absolute top-12 left-0 bg-white shadow-xl rounded-xl p-4 z-50 w-[260px]">
      <div className="flex justify-end mb-2">
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
        >
          ✕
        </button>
      </div>
      <HexColorPicker color={color} onChange={updateColor} />
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
