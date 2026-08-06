"use client";

import { useState, useEffect } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiArrowLeft,
  FiCamera,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiInspectionQueueList, apiProcessInspection } from "@/services/InventoryManagement";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "40px",
    borderColor: "#EFE5DD",
    boxShadow: "none",
    borderRadius: "8px",
    "&:hover": {
      borderColor: "#C08457",
    },
  }),

  singleValue: (base) => ({
    ...base,
    color: "#A85A32B2",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#A85A32B2",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#A0522D"
      : state.isFocused
        ? "#F8F2ED"
        : "#fff",
    color: state.isSelected ? "#fff" : "#444",
  }),
};

const InspectionQueueList = ({ onDetailModeChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [inspectionData, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pass Inspection Dialog State
  const [selectedPassItem, setSelectedPassItem] = useState(null);
  const [submittingPass, setSubmittingPass] = useState(false);

  // Fail Inspection Detail State
  const [failItem, setFailItem] = useState(null);
  const [goodQty, setGoodQty] = useState(0);
  const [damagedQty, setDamagedQty] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [submittingFail, setSubmittingFail] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInspectionQueue = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await apiInspectionQueueList(
        accessToken,
        currentPage,
        pageSize,
        debouncedSearch,
      );

      if (res?.status) {
        setInspectionData(res.data || []);
        setTotal(res.pagination?.count || 0);
      } else {
        setInspectionData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setInspectionData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionQueue();
  }, [accessToken, currentPage, pageSize, debouncedSearch]);

  // Handle setting onDetailModeChange in parent
  useEffect(() => {
    if (onDetailModeChange) {
      onDetailModeChange(!!failItem);
    }
  }, [failItem, onDetailModeChange]);

  const handlePassInspection = async () => {
    if (!selectedPassItem || !accessToken) return;
    try {
      setSubmittingPass(true);
      const res = await apiProcessInspection(accessToken, selectedPassItem.id, {
        good_qty: selectedPassItem.returned_qty,
        damaged_qty: 0,
        notes: "Passed inspection",
      });

      if (res?.status) {
        toast.push(
          <Notification type="success" title="Success">
            Inspection passed. Item moved to Cleaning.
          </Notification>
        );
        setSelectedPassItem(null);
        fetchInspectionQueue();
      } else {
        toast.push(
          <Notification type="danger" title="Error">
            {res?.message || "Failed to process inspection"}
          </Notification>
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || "Failed to process inspection";
      toast.push(
        <Notification type="danger" title="Error">
          {errMsg}
        </Notification>
      );
    } finally {
      setSubmittingPass(false);
    }
  };

  const handleOpenFailView = (item) => {
    setFailItem(item);
    setGoodQty(0);
    setDamagedQty(item.returned_qty);
    setNotes("");
    setSelectedPhotos([]);
  };

  const handleGoodChange = (val) => {
    const num = Math.min(failItem.returned_qty, Math.max(0, parseInt(val) || 0));
    setGoodQty(num);
    setDamagedQty(failItem.returned_qty - num);
  };

  const handleDamagedChange = (val) => {
    const num = Math.min(failItem.returned_qty, Math.max(0, parseInt(val) || 0));
    setDamagedQty(num);
    setGoodQty(failItem.returned_qty - num);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedPhotos((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemovePhoto = (index) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFailSubmit = async (e) => {
    e.preventDefault();
    if (!failItem || !accessToken) return;

    if (goodQty + damagedQty !== failItem.returned_qty) {
      toast.push(
        <Notification type="danger" title="Error">
          Good + Damaged quantity must equal Returned quantity
        </Notification>
      );
      return;
    }

    try {
      setSubmittingFail(true);
      const formData = new FormData();
      formData.append("good_qty", goodQty);
      formData.append("damaged_qty", damagedQty);
      formData.append("notes", notes);
      selectedPhotos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await apiProcessInspection(accessToken, failItem.id, formData);
      if (res?.status) {
        toast.push(
          <Notification type="success" title="Success">
            Inspection failed. {damagedQty} unit(s) moved to Damaged.
          </Notification>
        );
        setFailItem(null);
        fetchInspectionQueue();
      } else {
        toast.push(
          <Notification type="danger" title="Error">
            {res?.message || "Failed to process inspection"}
          </Notification>
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || "Failed to process inspection";
      toast.push(
        <Notification type="danger" title="Error">
          {errMsg}
        </Notification>
      );
    } finally {
      setSubmittingFail(false);
    }
  };

  if (failItem) {
    return (
      <div className="w-full">
        {/* Detail Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setFailItem(null)}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition text-[#A85A32]"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-[28px] font-semibold text-[#1A1410]">
            Inspection Queue
          </h1>
        </div>

        {/* Item Information Card */}
        <div className="bg-white border border-[#EFE5DD] rounded-xl p-5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={failItem.product_image || "/images/no-image.png"}
              alt={failItem.item_name}
              className="w-20 h-20 rounded-md object-cover border border-[#EFE5DD]"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {failItem.item_name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {failItem.category_name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              Order ID: <span className="text-[#A85A32]">#ORD-{failItem.id}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Return Date:{" "}
              {new Date(failItem.inspected_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Main Form container */}
        <div className="bg-white border border-[#EFE5DD] rounded-xl p-6 mb-6">
          {/* Condition Assessment Section */}
          <div>
            <h3 className="text-xs font-bold text-[#8B6D4E] uppercase tracking-wider mb-4">
              Condition Assessment
            </h3>
            <div className="flex items-center justify-center gap-6 md:gap-10 py-6 bg-[#FAF7F4] border border-[#EFE5DD] rounded-xl">
              {/* Returned */}
              <div className="flex flex-col items-center justify-center w-28 h-20 bg-[#F5EFEA] border border-[#E6DDD5] rounded-xl">
                <span className="text-2xl font-bold text-[#5C4033]">{failItem.returned_qty}</span>
                <span className="text-[10px] font-semibold text-[#A88C74] uppercase mt-1">Returned</span>
              </div>

              <span className="text-2xl font-semibold text-[#A88C74]">=</span>

              {/* Good Qty input/controls */}
              <div className="flex flex-col items-center justify-center w-36 h-24 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl relative p-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGoodChange(goodQty - 1)}
                    className="w-7 h-7 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={goodQty}
                    onChange={(e) => handleGoodChange(e.target.value)}
                    className="w-12 text-center text-xl font-bold text-[#059669] bg-transparent outline-none border-b border-emerald-300 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleGoodChange(goodQty + 1)}
                    className="w-7 h-7 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] font-semibold text-[#059669] uppercase mt-2">Good</span>
              </div>

              <span className="text-2xl font-semibold text-[#A88C74]">+</span>

              {/* Damaged Qty input/controls */}
              <div className="flex flex-col items-center justify-center w-36 h-24 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl relative p-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDamagedChange(damagedQty - 1)}
                    className="w-7 h-7 bg-white hover:bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-600 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={damagedQty}
                    onChange={(e) => handleDamagedChange(e.target.value)}
                    className="w-12 text-center text-xl font-bold text-[#DC2626] bg-transparent outline-none border-b border-red-300 focus:border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleDamagedChange(damagedQty + 1)}
                    className="w-7 h-7 bg-white hover:bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-600 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] font-semibold text-[#DC2626] uppercase mt-2">Damaged</span>
              </div>
            </div>
          </div>

          {/* Inspection Notes Section */}
          <div className="mt-6">
            <label className="block text-xs font-bold text-[#8B6D4E] uppercase tracking-wider mb-2">
              Inspection Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe condition details, damage notes, or handling instructions..."
              className="w-full min-h-[100px] p-3 rounded-lg border border-[#EFE5DD] outline-none text-sm text-gray-700 focus:border-[#C08457]"
            />
          </div>

          {/* Photos Upload Section */}
          <div className="mt-6">
            <label className="block text-xs font-bold text-[#8B6D4E] uppercase tracking-wider mb-2">
              Photos
            </label>
            <div className="border-2 border-dashed border-[#EFE5DD] rounded-xl p-6 flex flex-col items-center justify-center bg-[#FCFAF9] cursor-pointer hover:bg-orange-50/20 transition relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FiCamera className="text-gray-400 text-3xl mb-2" />
              <span className="text-sm font-medium text-gray-600">Upload damage photos</span>
              <span className="text-xs text-gray-400 mt-1">Click or drag images to upload</span>
            </div>
            {selectedPhotos.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {selectedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-16 border border-gray-200 rounded-md overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      className="w-full h-full object-cover"
                      alt="damage-preview"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="plain"
              onClick={() => setFailItem(null)}
              disabled={submittingFail}
              className="px-6 h-10 border border-[#EFE5DD] rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleFailSubmit}
              loading={submittingFail}
              className="px-6 h-10 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center"
            >
              Fail Inspection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg">
        {/* Search + Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-full lg:max-w-xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#EFE5DD] text-[#C08457] pl-10 pr-4 text-sm outline-none focus:border-[#C08457]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <FiX className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="text-left px-4 py-3 font-normal">Product Name</th>
                <th className="text-left px-4 py-3 font-normal">Order ID</th>
                <th className="text-left px-4 py-3 font-normal">Returned Qty</th>
                <th className="text-left px-4 py-3 font-normal">Return Date</th>
                <th className="text-left px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10">
                    <div className="flex justify-center">
                      <Spinner size={40} customColorClass="text-[#A0522D]" />
                    </div>
                  </td>
                </tr>
              ) : inspectionData.length > 0 ? (
                inspectionData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`text-[13px] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#FBF7F3]"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <h3 className="text-[#2C1A0E] text-[15px] font-semibold">
                        {item.item_name}
                      </h3>
                      <p className="text-[12px] text-[#A08070]">{item.category_name}</p>
                    </td>

                    <td className="px-5 py-3 text-[#2C1A0E] font-semibold text-[14px]">
                      #ORD-{item.id}
                    </td>

                    <td className="px-5 py-3 text-[#2C1A0E] font-semibold text-[14px]">
                      {item.returned_qty} Units
                    </td>

                    <td className="px-5 py-3 text-[#2C1A0E] font-semibold text-[14px]">
                      {new Date(item.inspected_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedPassItem(item)}
                          className="min-w-[68px] h-7 rounded-md border border-[#B8F1D4] bg-[#F2FFF7] text-[#0E9F6E] text-[13px] font-semibold cursor-pointer"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => handleOpenFailView(item)}
                          className="min-w-[68px] h-7 rounded-md border border-[#FFD0D7] bg-white text-[#E11D48] text-[13px] font-semibold cursor-pointer"
                        >
                          Fail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No inspection records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="flex justify-end mt-3"
        style={{ marginRight: "6px", marginLeft: "6px" }}
      >
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Pass Confirmation Dialog */}
      <Dialog
        isOpen={!!selectedPassItem}
        onClose={() => setSelectedPassItem(null)}
        width={450}
      >
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle size={28} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Mark item as Passed</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Are you sure you want to mark this item as passed? It will be sent for cleaning before being added back to available inventory.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setSelectedPassItem(null)}
              className="flex-1 px-4 h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold cursor-pointer"
              disabled={submittingPass}
            >
              Cancel
            </button>
            <button
              onClick={handlePassInspection}
              disabled={submittingPass}
              className="flex-1 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submittingPass ? (
                <Spinner size={18} customColorClass="text-white" />
              ) : (
                <>
                  <FiCheckCircle />
                  Pass Inspection
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default InspectionQueueList;
