"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiDamagedItemsList, apiUpdateDamagedItem } from "@/services/InventoryManagement";
import Spinner from "@/components/ui/Spinner";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useTranslations } from "next-intl";

const DamagedItemsList = () => {
  const t = useTranslations("inventoryManagement.damagedItems");
  const ts = useTranslations("successTitle");
  const te = useTranslations("errorTitle");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDamagedItems = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await apiDamagedItemsList(accessToken);

      if (res?.status) {
        setItems(res.data || []);
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

  const updateStatus = async (id, status) => {
    if (!accessToken) return;
    try {
      const res = await apiUpdateDamagedItem(accessToken, id, {
        status: status.toLowerCase(),
      });
      if (res?.status) {
        toast.push(
          <Notification type="success" title={ts("success")}>
            {t("statusUpdated", { status: t(status) })}
          </Notification>
        );
        fetchDamagedItems();
      } else {
        toast.push(
          <Notification type="danger" title={te("error")}>
            {res?.message || t("updateStatusFailed")}
          </Notification>
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || t("updateStatusFailed");
      toast.push(
        <Notification type="danger" title={te("error")}>
          {errMsg}
        </Notification>
      );
    }
  };

  const handleMoveToAvailable = async (id) => {
    if (!accessToken) return;
    try {
      const res = await apiUpdateDamagedItem(accessToken, id, {
        status: "moved",
      });
      if (res?.status) {
        toast.push(
          <Notification type="success" title={ts("success")}>
            {t("movedToAvailable")}
          </Notification>
        );
        fetchDamagedItems();
      } else {
        toast.push(
          <Notification type="danger" title={te("error")}>
            {res?.message || t("moveFailed")}
          </Notification>
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || t("moveFailed");
      toast.push(
        <Notification type="danger" title={te("error")}>
          {errMsg}
        </Notification>
      );
    }
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
                  src={item.image || "/images/no-image.png"}
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
                        {item.category} · {t("addedOn", { date: item.added })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${
                          item.status === "repair"
                            ? "bg-[#FFF5E8] text-[#D97706]"
                            : item.status === "discard"
                              ? "bg-[#FFF1F1] text-[#EF4444]"
                              : "bg-[#F3F4F6] text-gray-500"
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
                      {t("damageReason")}
                    </p>

                    <p className="text-[#C45B5B] text-[13px] mt-1 leading-6">
                      {item.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-[#8B6D4E] font-semibold">
                        {t("updateStatus")}
                      </span>

                      <button
                        onClick={() => updateStatus(item.id, "pending")}
                        className={`px-4 h-8 rounded-full border text-[12px] font-medium transition cursor-pointer ${
                          item.status === "pending"
                            ? "bg-[#8B6D4E] border-[#8B6D4E] text-white font-semibold"
                            : "bg-white border-[#D8CABC] text-[#6B4A2A] font-semibold hover:bg-orange-50/20"
                        }`}
                      >
                        {t("pending")}
                      </button>

                      <button
                        onClick={() => updateStatus(item.id, "repair")}
                        className={`px-4 h-8 rounded-full border text-[12px] font-medium transition cursor-pointer ${
                          item.status === "repair"
                            ? "bg-[#E17100] border-[#D97706] text-white font-semibold"
                            : "bg-white border-[#D8CABC] text-[#7B6656] hover:bg-orange-50/20"
                        }`}
                      >
                        {t("repair")}
                      </button>

                      <button
                        onClick={() => updateStatus(item.id, "discard")}
                        className={`px-4 h-8 rounded-full border text-[12px] font-medium transition cursor-pointer ${
                          item.status === "discard"
                            ? "bg-[#EF4444] border-[#EF4444] text-white font-semibold"
                            : "bg-white border-[#D8CABC] text-[#6B4A2A] font-semibold hover:bg-orange-50/20"
                        }`}
                      >
                        {t("discard")}
                      </button>
                    </div>

                    <button
                      onClick={() => handleMoveToAvailable(item.id)}
                      className="ml-auto px-5 h-9 rounded-full border border-[#BDEFD9] bg-[#ECFDF5] text-[#007A55] text-[13px] font-medium hover:bg-[#DDFBF0] transition flex items-center gap-2 cursor-pointer"
                    >
                      <FiRefreshCw size={13} className="text-[#007A55]" />
                      {t("moveToAvailable")}
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
          {t("noDamageIem")}
        </div>
      )}
    </div>
  );
};

export default DamagedItemsList;
