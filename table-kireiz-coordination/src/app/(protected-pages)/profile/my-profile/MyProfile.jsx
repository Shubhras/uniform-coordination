"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Dialog from "@/components/ui/Dialog";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Alert from "@/components/ui/Alert";
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
  apiResendVerificationEmail,
} from "@/services/AuthProfileService";
import { apiUserOrderList } from "@/services/OrderService";
import { formatDate } from "@/utils/formatDate";
import RentalTimelineModal from "@/components/shared/RentalTimelineModal";

const MyProfile = () => {
  const router = useRouter();
  const fileRef = useRef(null);
  const { data: nextAuthSession } = useSession();
  const { session: currentSession } = useCurrentSession();
  const session = nextAuthSession || currentSession;
  const token = session?.accessToken || session?.user?.accessToken;

  // Profile state
  const [profile, setProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Orders state
  const [ordersList, setOrdersList] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Compatibility alias
  const loading = profileLoading;

  // Simulation history state
  const [simulationData, setSimulationData] = useState([]);
  const [simulationLoading, setSimulationLoading] = useState(true);
  const visibleRecentSimulations = simulationData.slice(0, 3);

  // PDF download state
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [pdfError, setPdfError] = useState("");

  // Email verification dialog state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);

  // Tracking timeline modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const handleOpenTrack = (order) => {
    setTrackingOrder(order || ordersList[0] || null);
    setIsTrackingModalOpen(true);
  };

  // Fetch profile details
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await apiGetProfile(token);
        setProfile(res?.data);
        setImage(res?.data?.profileImage || null);
      } catch (error) {
        console.error("Profile API Error:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Fetch active orders
  useEffect(() => {
    if (!token) return;

    const fetchActiveOrders = async () => {
      try {
        setOrdersLoading(true);
        const params = {
          page: 1,
          page_size: 3,
        };

        const response = await apiUserOrderList(token, params);
        if (response?.status && Array.isArray(response?.data)) {
          setOrdersList(response.data);
        } else {
          setOrdersList([]);
        }
      } catch (err) {
        console.error("Error fetching active orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchActiveOrders();
  }, [token]);

  // Fetch simulation history
  const fetchSimulationHistory = async () => {
    try {
      if (!token) {
        setSimulationLoading(false);
        return;
      }
      setSimulationLoading(true);
      const params = {
        category: "",
        sort: "new",
        range: "30",
      };

      const res = await apiSimulationHistory(token, params);
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
    if (!token) {
      setSimulationLoading(false);
      return;
    }
    fetchSimulationHistory();
  }, [token]);

  // Image handlers
  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
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
        const errorMsg = res?.message || "PDF URL not found";
        setPdfError(errorMsg);
        toast.push(
          <Notification title="Download Failed" type="danger">
            {errorMsg}
          </Notification>
        );
      }
    } catch (err) {
      console.error("Failed to download PDF:", err);
      const errorMsg = "Failed to download PDF. Please try again.";
      setPdfError(errorMsg);
      toast.push(
        <Notification title="Download Failed" type="danger">
          {errorMsg}
        </Notification>
      );
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleResendVerification = async () => {
    const userEmail = profile?.email || session?.user?.email || "-";
    try {
      setVerifyEmailLoading(true);
      if (!token) {
        toast.push(
          <Notification title="Notice" type="info">
            Session token not available. Please sign in again.
          </Notification>
        );
        return;
      }

      const res = await apiResendVerificationEmail(token, { force: true });
      if (res?.status) {
        toast.push(
          <Notification title="Verification Email Sent" type="success">
            {res?.message || `A verification email has been sent to ${userEmail}. Please check your inbox.`}
          </Notification>
        );
        setIsVerifyModalOpen(false);
      } else {
        toast.push(
          <Notification title="Notice" type="info">
            {res?.message || `Your email (${userEmail}) is verified.`}
          </Notification>
        );
      }
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      toast.push(
        <Notification title="Failed to Send" type="danger">
          {err?.response?.data?.message || "Failed to send verification email. Please try again."}
        </Notification>
      );
    } finally {
      setVerifyEmailLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size={40} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  return (
    <div className="w-full p-2 space-y-6">
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
                  {profile?.firstName || session?.user?.firstName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Last Name</p>
                <p className="text-sm font-medium text-[#5A3E2B]">
                  {profile?.lastName || session?.user?.lastName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Email Address</p>
                <p className="text-sm font-medium flex items-center gap-1 text-[#5A3E2B]">
                  {profile?.email || session?.user?.email || "-"}
                  <HiCheckCircle className="text-green-500" />
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Phone Number</p>
                <p className="text-sm font-medium text-[#5A3E2B]">
                  {profile?.phone || session?.user?.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#626262]">Position</p>
                <p className="text-sm font-medium text-[#5A3E2B]">
                  {profile?.roleName || session?.user?.roleName || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => router.push("/profile/personal-information")}
              size="sm"
              className="flex rounded-lg items-center gap-2 border border-[#7D7D7D] text-[#515254] font-medium"
            >
              <FiEdit2 /> Edit Profile
            </Button>
            <Button
              onClick={() => router.push("/profile/change-password")}
              size="sm"
              className="flex items-center rounded-lg gap-2 border border-[#7D7D7D] text-[#515254] font-medium"
            >
              <FiLock /> Change Password
            </Button>
            <Button
              onClick={() => setIsVerifyModalOpen(true)}
              size="sm"
              className="flex items-center rounded-lg gap-2 border border-[#7D7D7D] text-[#515254] font-medium hover:border-[#A0522D] hover:text-[#A0522D]"
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

          {ordersLoading ? (
            <div className="flex items-center justify-center py-8 border-b border-[#D6B8A6]">
              <Spinner size={24} customColorClass="text-[#A0522D]" />
            </div>
          ) : ordersList.length > 0 ? (
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
                    ${Number(ordersList[0]?.total_amount || 0).toLocaleString()}
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
                  className="border border-[#A0522D] text-[#A0522D] hover:bg-[#FAF4EF] w-full rounded-lg transition"
                  onClick={() => handleOpenTrack(ordersList[0])}
                >
                  Track
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-8 border-b border-[#D6B8A6] text-center text-[11px] text-[#9CA3AF]">
              No recent orders found
            </div>
          )}

          {/* Linked Orders List */}
          <div className="px-6 py-4">
            <p className="text-[12px] font-semibold text-[#484848] mb-3">
              Linked Orders
            </p>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size={24} customColorClass="text-[#A0522D]" />
              </div>
            ) : ordersList.length > 0 ? (
              <div className="space-y-2">
                {ordersList.map((item, i) => (
                  <div
                    key={item.order_id || item.id || i}
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
            ) : (
              <div className="text-center text-[11px] text-[#9CA3AF] py-4">
                No linked orders found
              </div>
            )}

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
            {pdfError && (
              <Alert
                showIcon
                closable
                type="danger"
                className="mb-2"
                onClose={() => setPdfError("")}
              >
                <span className="text-xs break-all">{pdfError}</span>
              </Alert>
            )}

            {simulationLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size={24} />
              </div>
            ) : simulationData.length > 0 ? (
              <div className="space-y-0">
                {visibleRecentSimulations.map((item, index) => (
                  <div key={item.id || item.simulation_id || index} className="flex justify-between items-start">
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
                        className={`text-[11px] px-3 py-1 rounded-md ${item.isActive === true
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
              className="w-full border border-[#A0522D] text-[#A0522D] bg-[#F5F0EE30] hover:bg-[#F5F0EE80]"
              onClick={() => router.push("/dashboards/uniform-3d-design")}
            >
              Create New Simulation
            </Button>
          </div>
        </div>
      </div>

      {/* Email Verification Dialog */}
      <Dialog
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onRequestClose={() => setIsVerifyModalOpen(false)}
        className="w-full max-w-lg mx-auto"
      >
        <div className="flex flex-col p-2">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#A0522D]/10 flex items-center justify-center text-[#A0522D]">
              <FiMail size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#5A3E2B]">Email Verification</h3>
              <p className="text-xs text-[#7D7D7D]">Manage and confirm your account email address</p>
            </div>
          </div>

          {/* Body */}
          <div className="py-6 space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50/70 p-4 flex items-start gap-3">
              <HiCheckCircle size={22} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-green-900">
                  {profile?.is_verify === true ? "Email Address is Verified" : "Verification Pending"}
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  Your registered email address <span className="font-semibold underline">{profile?.email || session?.user?.email || "-"}</span> is verified and active on your Kireiz account.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#626262] leading-relaxed">
              All official quotation updates, order confirmations, rental schedules, and notifications are sent directly to this address.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              size="sm"
              variant="plain"
              onClick={() => setIsVerifyModalOpen(false)}
              className="rounded-lg text-[#626262]"
            >
              Close
            </Button>
            <Button
              size="sm"
              loading={verifyEmailLoading}
              onClick={handleResendVerification}
              className="rounded-lg bg-[#A0522D] hover:bg-[#854324] text-white font-medium flex items-center gap-2"
            >
              <FiMail /> Resend Verification Email
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Rental Timeline Tracking Modal */}
      <RentalTimelineModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        orderId={trackingOrder?.order_id}
        initialOrder={trackingOrder}
      />
    </div>
  );
};

export default MyProfile;

