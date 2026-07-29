"use client";

import { useState, useEffect } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCleaningItems } from "@/services/InventoryManagement";
import Spinner from "@/components/ui/Spinner";
import { FiRefreshCw } from "react-icons/fi";

const CleaningItems = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCleaningItems = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await apiCleaningItems(accessToken);

      if (res?.data?.status) {
        setItems(res.data.data || []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Cleaning Items Error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaningItems();
  }, [accessToken]);

  const moveToAvailable = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={40} customColorClass="text-[#A0522D]" />
        </div>
      ) : items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#EFE5DD] rounded-2xl shadow-sm px-5 py-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={item.image || "/images/no-image.png"}
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

              <button
                onClick={() => moveToAvailable(item.id)}
                className="flex items-center gap-2 px-5 h-9 rounded-full border border-[#BDEFD9] bg-[#ECFDF5] text-[#007A55] text-[13px] font-semibold hover:bg-[#DDFBF0] transition"
              >
                <FiRefreshCw size={13} />
                Move to Available
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white border border-[#EFE5DD] rounded-xl py-10 text-center text-gray-500">
          No cleaning items found.
        </div>
      )}
    </div>
  );
};

export default CleaningItems;
