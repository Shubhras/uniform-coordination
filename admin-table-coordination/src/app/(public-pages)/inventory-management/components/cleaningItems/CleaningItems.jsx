"use client";

import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

const cleaningItemsData = [
  {
    id: 1,
    name: "Ivory Velvet Throne Chair",
    category: "Seating",
    added: "28 Jun 2025",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300",
  },
  {
    id: 2,
    name: "Gold Charger Plate",
    category: "Tableware",
    added: "01 Jul 2025",
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300",
  },
];

const CleaningItems = () => {
  const [items, setItems] = useState(cleaningItemsData);

  const moveToAvailable = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-[#EFE5DD] rounded-2xl shadow-sm px-5 py-4 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between gap-6">
            {/* Left */}
            <div className="flex items-center gap-4 flex-1">
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-md object-cover border border-[#EFE5DD] flex-shrink-0"
              />

              <div>
                <h2 className="text-[20px] font-semibold text-[#231815] leading-none">
                  {item.name}
                </h2>

                <p className="mt-2 text-[13px] text-[#9B8878]">
                  {item.category} · Added {item.added}
                </p>
              </div>
            </div>

            {/* Right */}
            <button
              onClick={() => moveToAvailable(item.id)}
              className="flex items-center gap-2 px-5 h-9 rounded-full border border-[#BDEFD9] font-semibold bg-[#ECFDF5] text-[#007A55] text-[13px] font-medium hover:bg-[#DDFBF0] transition"
            >
              <FiRefreshCw size={13} />
              Move to Available
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CleaningItems;
