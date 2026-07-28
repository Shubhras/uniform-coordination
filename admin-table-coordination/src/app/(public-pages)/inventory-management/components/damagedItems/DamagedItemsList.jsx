"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiDamagedItemsList } from "@/services/InventoryManagement";
import Spinner from "@/components/ui/Spinner";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

const statusColors = {
  Pending: {
    bg: "bg-white",
    border: "border-[#D7C6B6]",
    text: "text-[#8A6A4D]",
  },
  Repair: {
    bg: "bg-[#D97706]",
    border: "border-[#D97706]",
    text: "text-white",
  },
  Discard: {
    bg: "bg-[#EF4444]",
    border: "border-[#EF4444]",
    text: "text-white",
  },
};

const DamagedItemsList = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDamagedItems = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await apiDamagedItemsList(accessToken);

      if (res?.data?.status) {
        setItems(res.data.data || []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Damaged Items Error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDamagedItems();
  }, [accessToken]);

  const updateStatus = (id, status) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
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
            className="bg-white border border-[#EFE5DD] rounded-2xl shadow-sm p-5"
          >
            {/* Top */}
            <div className="flex gap-5">
              {/* Left */}
              <div className="flex gap-4 flex-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover border border-[#EFE5DD]"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[22px] font-semibold text-[#231815] leading-none">
                        {item.name}
                      </h2>

                      <p className="text-[13px] text-[#8D7A6E] mt-1">
                        {item.category} · Added {item.added}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${
                          item.status === "Repair"
                            ? "bg-[#FFF5E8] text-[#D97706]"
                            : "bg-[#FFF1F1] text-[#EF4444]"
                        }`}
                      >
                        {item.status}
                      </span>

                      <span className="text-[#D92D20] font-semibold text-[14px]">
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                  {/* Damage Box */}
                  <div className="mt-4 rounded-lg bg-[#FEF2F2] border border-[#F8DEDE] px-4 py-3">
                    <p className="flex items-center gap-2 text-[#C10007] font-semibold text-[13px]">
                      <FiAlertTriangle size={18} className="text-[#C10007]" />
                      Damage Reason
                    </p>

                    <p className="text-[#C45B5B] text-[13px] mt-1 leading-6">
                      {item.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-[#8B6D4E] font-semibold">
                        Update status:
                      </span>

                      <button
                        onClick={() => updateStatus(item.id, "Pending")}
                        className={`px-4 h-8 rounded-full border text-[12px] font-medium transition ${
                          item.status === "Pending"
                            ? "bg-[#8B6D4E] border-[#8B6D4E] text-white"
                            : "bg-white border-[#D8CABC] text-[#6B4A2A] font-semibold"
                        }`}
                      >
                        Pending
                      </button>

                      <button
                        onClick={() => updateStatus(item.id, "Repair")}
                        className={`px-4 h-8 rounded-full border text-[12px] font-medium transition ${
                          item.status === "Repair"
                            ? "bg-[#E17100] border-[#D97706] text-white"
                            : "bg-white border-[#D8CABC] text-[#7B6656]"
                        }`}
                      >
                        Repair
                      </button>

                      <button
                        onClick={() => updateStatus(item.id, "Discard")}
                        className={`px-4 h-8 rounded-full border text-[12px] font-medium transition ${
                          item.status === "Discard"
                            ? "bg-[#EF4444] border-[#EF4444] text-white"
                            : "bg-white border-[#D8CABC] text-[#6B4A2A] font-semibold"
                        }`}
                      >
                        Discard
                      </button>
                    </div>

                    <button className="ml-auto px-5 h-9 rounded-full border border-[#BDEFD9] bg-[#ECFDF5] text-[#007A55] text-[13px] font-medium hover:bg-[#DDFBF0] transition flex items-center gap-2">
                      <FiRefreshCw size={13} className="text-[#007A55]" />
                      Move to Available
                    </button>
                  </div>
                </div>
              </div>

              {/* Right */}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white border border-[#EFE5DD] rounded-xl py-10 text-center text-gray-500">
          No damaged items found.
        </div>
      )}
    </div>
  );
};

export default DamagedItemsList;
