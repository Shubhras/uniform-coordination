"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  FiEdit2,
  FiLock,
  FiMail,
  FiBox,
  FiChevronRight,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import { HiCheckCircle } from "react-icons/hi";
import { GoArrowRight } from "react-icons/go";

import {
  apiGetProfile,
  apiSimulationExportPdf,
  apiSimulationHistory,
} from "@/services/AuthProfileService";
import { apiUserOrderList } from "@/services/OrderService";
import { formatDate } from "@/utils/formatDate";

const MyProfile = () => {
  const router = useRouter();
  const fileRef = useRef(null);
  const { data: session } = useSession();

  // Profile state
  const [profile, setProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Orders state
  const [ordersList, setOrdersList] = useState([]);

  // Simulation history state
  const [simulationData, setSimulationData] = useState([]);
  const [simulationLoading, setSimulationLoading] = useState(true);
  const visibleRecentSimulations = simulationData.slice(0, 3);

  // PDF download state
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [pdfError, setPdfError] = useState("");

  // Fetch profile details
  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchProfile = async () => {
      try {
        const res = await apiGetProfile(session.accessToken);
        setProfile(res?.data);
        setImage(res?.data?.profileImage || null);
      } catch (error) {
        console.error("Profile API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.accessToken]);

  // Fetch active orders
  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchActiveOrders = async () => {
      try {
        setLoading(true);
        const params = {
          page: 1,
          page_size: 3,
        };

        const response = await apiUserOrderList(session.accessToken, params);
        if (response?.status && Array.isArray(response?.data)) {
          setOrdersList(response.data);
        } else {
          setOrdersList([]);
        }
      } catch (err) {
        console.error("Error fetching active orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();
  }, [session?.accessToken]);

  // Fetch simulation history
  const fetchSimulationHistory = async () => {
    try {
      if (!session?.accessToken) return;
      setSimulationLoading(true);
      const params = {
        category: "",
        sort: "new",
        range: "30",
      };

      const res = await apiSimulationHistory(session.accessToken, params);
      if (res?.status) {
        setSimulationData(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load Simulation History:", err);
    } finally {
      setSimulationLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.accessToken) return;
    fetchSimulationHistory();
  }, [session?.accessToken]);

  // Image handlers
  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Navigation & action handlers
  const handleViewDetails = (orderId) => {
    router.push(`/profile/my-order-rentals/${orderId}`);
  };

  const handleRedirectSimulation = (id) => {
    router.push(`/dashboards/design-result/${id}`);
  };

  const handlePdfDownload = async (id) => {
    try {
      if (!session?.accessToken || !id) return;

      setPdfLoadingId(id);
      setPdfError("");

      const res = await apiSimulationExportPdf(session.accessToken, id);

      if (res?.status && res?.pdf_url) {
        window.open(res.pdf_url, "_blank");
      } else {
        setPdfError(res?.message || "PDF URL not found");
      }
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setPdfError("Failed to download PDF. Please try again.");
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="relative bg-[#F8F3EF] rounded-2xl shadow-md md:p-6 p-2 flex flex-col lg:flex-row gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="w-[180px] border border-[#A0522D] rounded-2xl flex flex-col items-center gap-3 p-3 bg-[#F8F3EF]">
            <div className="border border-white rounded-full p-1">
              <Avatar
                size={110}
                src={image}
                className="shadow-md object-cover"
              />
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              className="hidden"
              onChange={handleSelectImage}
            />

            <div className="flex gap-4 text-xs">
              <button
                onClick={() => fileRef.current.click()}
                className="text-[#A0522D] font-medium hover:underline"
              >
                Upload
              </button>

              {image && (
                <button
                  onClick={handleRemoveImage}
                  className="text-red-500 font-medium hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <span className="mt-3 flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-3 py-1 rounded-full lg:hidden">
            <HiCheckCircle size={14} />
            Verified Account
          </span>
        </div>

        {/* Personal Details Section */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="border border-[#A0522D] rounded-2xl p-6 bg-[#F5F0EE30]">
            <h4 className="text-sm font-semibold text-[#A0522D] mb-5">
              Personal Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10">
              <div>
                <p className="text-xs text-[#626262]">First Name</p>
                <p className="text-sm font-medium text-[#5A3E2B]">
                  {profile?.firstName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Last Name</p>
                <p className="text-sm font-medium text-[#5A3E2B]">
                  {profile?.lastName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Email Address</p>
                <p className="text-sm font-medium flex items-center gap-1 text-[#5A3E2B]">
                  {profile?.email || "-"}
                  <HiCheckCircle className="text-green-500" />
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Phone Number</p>
                <p className="text-sm font-medium text-[#5A3E2B]">
                  {profile?.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Position</p>
                <p className="text-sm font-medium text-[#5A3E2B]">
                  {profile?.roleName || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => router.push("/profile/personal-information")}
              size="sm"
              className="flex rounded-lg items-center gap-2 border border-[#7D7D7D] text-[#515254]"
            >
              <FiEdit2 /> Edit Profile
            </Button>
            <Button
              onClick={() => router.push("/profile/change-password")}
              size="sm"
              className="flex items-center rounded-lg gap-2 border border-[#7D7D7D] text-[#515254]"
            >
              <FiLock /> Change Password
            </Button>
            <Button
              size="sm"
              className="flex items-center rounded-lg gap-2 border border-[#7D7D7D] text-[#515254]"
            >
              <FiMail /> Verify Email
            </Button>
          </div>
        </div>

        {/* Desktop Verified Badge */}
        <div className="hidden lg:block">
          <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <HiCheckCircle size={14} />
            Verified Account
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Section */}
        <div className="rounded-2xl border border-[#D6B8A6] overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#D6B8A6]">
            <h4 className="text-[15px] font-semibold flex items-center gap-2 text-[#393939]">
              <FiBox size={17} /> Recent Orders
            </h4>
            <button
              onClick={() => router.push("/profile/my-order-rentals")}
              className="text-xs text-[#A0522D] font-medium flex items-center gap-1"
            >
              View All <GoArrowRight />
            </button>
          </div>

          <div className="px-6 py-5 border-b border-[#D6B8A6]">
            <div className="flex justify-between items-center mb-3 border-b border-[#D6B8A6] pb-2">
              <div>
                <p className="text-[11px] text-[#A0A0A0]">Order Number</p>
                <p className="text-sm font-semibold text-[#545454]">
                  {ordersList[0]?.order_id}
                </p>
              </div>
              <span className="text-[11px] bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {ordersList[0]?.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[11px] text-[#A0A0A0]">Date</p>
                <p className="text-sm font-medium text-[#545454]">
                  {formatDate(ordersList[0]?.created_at)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#A0A0A0]">Total Amount</p>
                <p className="text-sm font-medium text-[#545454]">
                  ¥{ordersList[0]?.total_amount}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="sm"
                className="bg-[#A0522D] hover:bg-[#8B4513] text-white w-full rounded-lg"
                onClick={() => handleViewDetails(ordersList[0]?.order_id)}
              >
                View Details
              </Button>
              <Button
                size="sm"
                variant="default"
                className="border border-[#A0522D] text-[#A0522D] w-full rounded-lg"
              >
                Track
              </Button>
            </div>
          </div>

          {/* Linked Orders List */}
          <div className="px-6 py-4">
            <p className="text-[12px] font-semibold text-[#484848] mb-3">
              Linked Quotes & Orders
            </p>

            <div className="space-y-2">
              {ordersList.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-[#F8F3EF] rounded-lg px-4 py-3 cursor-pointer"
                  onClick={() => handleViewDetails(item.order_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md">
                      <FiFileText size={16} className="text-[#A0522D]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#454545]">
                        {item.order_id}
                      </p>
                      <p className="text-[11px] text-[#535353]">
                        {item.item_name}
                      </p>
                    </div>
                  </div>
                  <FiChevronRight className="text-[#8B6A55]" />
                </div>
              ))}
            </div>

            <p
              className="text-xs text-center mt-4 text-[#A0522D] cursor-pointer"
              onClick={() => router.push("/profile/my-order-rentals")}
            >
              View All Linked Orders
            </p>
          </div>
        </div>

        {/* Recent Simulations Section */}
        <div className="rounded-2xl border border-[#D6B8A6] overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#D6B8A6]">
            <h4 className="text-[15px] font-semibold text-[#393939] flex items-center gap-2">
              <FiFileText size={17} />
              Recent Simulations
            </h4>
            <button
              type="button"
              onClick={() => router.push("/profile/simulation-history")}
              className="text-xs text-[#A0522D] font-medium flex items-center gap-1 hover:underline"
            >
              View All <GoArrowRight />
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            {simulationLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size={24} />
              </div>
            ) : simulationData.length > 0 ? (
              <div className="space-y-0">
                {visibleRecentSimulations.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex gap-3 mb-4">
                      <span className="w-3 h-3 rounded-full border border-[#A0522D] mt-1"></span>
                      <div>
                        <p className="text-sm font-medium text-[#5A3E2B]">
                          {item.productName}
                        </p>
                        <p className="text-xs text-[#8B6A55] mt-2">
                          {formatDate(item.created_at)}
                        </p>
                        <button
                          className="text-xs text-[#A0522D] flex items-center gap-1 mt-2 mb-2"
                          onClick={() => handlePdfDownload(item?.id)}
                          disabled={pdfLoadingId === item?.id}
                        >
                          <FiDownload />{" "}
                          {pdfLoadingId === item?.id
                            ? "Downloading..."
                            : "PDF Download"}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[11px] px-3 py-1 rounded-md ${
                          item.isActive === true
                            ? "text-[#7A3E1D] bg-[#E6D2C4]"
                            : "text-[#8B6A55] bg-[#F5F0EE30]"
                        }`}
                      >
                        {item.isActive ? "OPEN" : "CLOSED"}
                      </span>
                      <p
                        className="text-[11px] text-[#8B6A55] mt-2 cursor-pointer"
                        onClick={() => handleRedirectSimulation(item?.id)}
                      >
                        View Details
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[11px] text-[#9CA3AF]">
                No recent simulations found
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-[#D6B8A6]">
            <Button
              variant="default"
              className="w-full border border-[#A0522D] text-[#A0522D] bg-[#F5F0EE30]"
            >
              Create New Simulation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
