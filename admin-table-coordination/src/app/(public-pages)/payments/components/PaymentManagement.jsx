"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  FiDollarSign,
  FiCreditCard,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiPlus,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiTag,
  FiFileText,
  FiX,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import {
  apiGetAdminPayments,
  apiGetAdminPaymentDetails,
  apiGetAdminRefunds,
  apiProcessRefund,
  apiGetPromocodes,
  apiCreatePromocode,
  apiUpdatePromocode,
  apiDeletePromocode,
  apiGetPaymentPdf,
} from "@/services/PaymentService";

export default function PaymentManagement() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken || session?.accessToken;

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // State for Payments & Analytics
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);

  // State for Refunds
  const [refunds, setRefunds] = useState([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [refundSearch, setRefundSearch] = useState("");
  const [refundStatusFilter, setRefundStatusFilter] = useState("all");
  const [refundPage, setRefundPage] = useState(1);
  const [refundTotalPages, setRefundTotalPages] = useState(1);

  // State for Promocodes & Coupons
  const [promocodes, setPromocodes] = useState([]);
  const [promocodesLoading, setPromocodesLoading] = useState(false);
  const [promocodeSearch, setPromocodeSearch] = useState("");
  const [promocodeStatusFilter, setPromocodeStatusFilter] = useState("all");
  const [promocodeTypeFilter, setPromocodeTypeFilter] = useState("all");
  const [promocodePage, setPromocodePage] = useState(1);
  const [promocodeTotalPages, setPromocodeTotalPages] = useState(1);

  // Modals & Action States
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [selectedPromocode, setSelectedPromocode] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isPromocodeModalOpen, setIsPromocodeModalOpen] = useState(false);

  const [refundAmount, setRefundAmount] = useState("");
  const [refundPercentage, setRefundPercentage] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Promocode Form State
  const [promoForm, setPromoForm] = useState({
    promocodeName: "",
    description: "",
    promocodeType: "discount",
    amount: "",
    min_order_value: "",
    limit_uses: false,
    max_uses: "",
    started_at: "",
    ended_at: "",
    isActive: true,
    imageFile: null,
  });
  const [promoSubmitting, setPromoSubmitting] = useState(false);

  // Toast Helper
  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  // Format Currency (USD by default)
  const formatUSD = (val) => {
    const num = parseFloat(val || 0);
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Fetch Payments & Summary
  const fetchPayments = useCallback(async () => {
    if (!accessToken) return;
    setPaymentsLoading(true);
    try {
      const res = await apiGetAdminPayments(accessToken, {
        page: paymentPage,
        pageSize: 10,
        search: paymentSearch,
        status: paymentStatusFilter === "all" ? "" : paymentStatusFilter,
      });
      if (res) {
        const paymentList = res.data || (Array.isArray(res) ? res : []);
        setPayments(paymentList);
        if (res.summary) {
          setPaymentSummary(res.summary);
        } else {
          // Fallback summary calculation if needed
          const totalAmt = paymentList.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
          setPaymentSummary({
            total_payments_count: paymentList.length,
            total_amount: totalAmt,
            successful_amount: totalAmt,
            successful_count: paymentList.length,
            successful_percentage: 100,
            refunds_amount: 0,
            refunds_percentage: 0,
            pending_amount: 0,
            pending_count: 0,
            pending_percentage: 0,
            failed_amount: 0,
            failed_count: 0,
            failed_percentage: 0,
          });
        }
        if (res.pagination) {
          setPaymentTotalPages(res.pagination.total_pages || 1);
        } else if (res.count) {
          setPaymentTotalPages(Math.ceil(res.count / 10) || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [accessToken, paymentPage, paymentSearch, paymentStatusFilter]);

  // Fetch Refunds
  const fetchRefunds = useCallback(async () => {
    if (!accessToken) return;
    setRefundsLoading(true);
    try {
      const res = await apiGetAdminRefunds(accessToken, {
        page: refundPage,
        pageSize: 10,
        search: refundSearch,
        status: refundStatusFilter === "all" ? "" : refundStatusFilter,
      });
      if (res) {
        setRefunds(res.data || (Array.isArray(res) ? res : []));
        if (res.pagination) setRefundTotalPages(res.pagination.total_pages || 1);
      }
    } catch (err) {
      console.error("Error fetching refunds:", err);
    } finally {
      setRefundsLoading(false);
    }
  }, [accessToken, refundPage, refundSearch, refundStatusFilter]);

  // Fetch Promocodes
  const fetchPromocodes = useCallback(async () => {
    if (!accessToken) return;
    setPromocodesLoading(true);
    try {
      const res = await apiGetPromocodes(accessToken, {
        page: promocodePage,
        pageSize: 10,
        search: promocodeSearch,
        status: promocodeStatusFilter === "all" ? "" : promocodeStatusFilter,
        type: promocodeTypeFilter === "all" ? "" : promocodeTypeFilter,
      });
      if (res) {
        setPromocodes(res.data || (Array.isArray(res) ? res : []));
        if (res.pagination) setPromocodeTotalPages(res.pagination.total_pages || 1);
      }
    } catch (err) {
      console.error("Error fetching promocodes:", err);
    } finally {
      setPromocodesLoading(false);
    }
  }, [accessToken, promocodePage, promocodeSearch, promocodeStatusFilter, promocodeTypeFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (activeTab === "refunds") fetchRefunds();
  }, [activeTab, fetchRefunds]);

  useEffect(() => {
    if (activeTab === "coupons" || activeTab === "promocodes") fetchPromocodes();
  }, [activeTab, fetchPromocodes]);

  // Open Payment Details Modal
  const handleOpenDetails = async (payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
    if (payment.payment_id) {
      try {
        const detailRes = await apiGetAdminPaymentDetails(accessToken, payment.payment_id);
        if (detailRes && detailRes.data) {
          setSelectedPayment(detailRes.data);
        }
      } catch (e) {
        console.error("Payment detail error:", e);
      }
    }
  };

  // Open Process Refund Modal
  const handleOpenRefundModal = (refundOrPayment) => {
    if (refundOrPayment.refund_amount || refundOrPayment.reason) {
      setSelectedRefund(refundOrPayment);
      setRefundAmount(refundOrPayment.refund_amount || "");
    } else {
      setSelectedRefund({
        id: refundOrPayment.id,
        order_id: refundOrPayment.order?.order_id || refundOrPayment.order_id,
        payment: refundOrPayment,
        refund_amount: refundOrPayment.amount,
      });
      setRefundAmount(refundOrPayment.amount || "");
    }
    setRefundPercentage("");
    setRefundNote("");
    setIsRefundModalOpen(true);
  };

  // Handle Process Refund Submit
  const handleProcessRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRefund) return;
    setRefundSubmitting(true);
    try {
      const payload = {};
      if (refundAmount) payload.refund_amount = parseFloat(refundAmount);
      if (refundPercentage) payload.refund_percentage = parseFloat(refundPercentage);
      if (refundNote) payload.admin_note = refundNote;

      const res = await apiProcessRefund(accessToken, selectedRefund.id, payload);
      if (res && res.status) {
        showToast(res.message || "Refund processed successfully!", "success");
        setIsRefundModalOpen(false);
        fetchRefunds();
        fetchPayments();
      } else {
        showToast(res?.message || "Failed to process refund", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Error processing refund", "error");
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Open Create/Edit Promocode Modal
  const handleOpenPromoModal = (promo = null) => {
    setSelectedPromocode(promo);
    if (promo) {
      setPromoForm({
        promocodeName: promo.promocodeName || "",
        description: promo.description || "",
        promocodeType: promo.promocodeType || "discount",
        amount: promo.amount || "",
        min_order_value: promo.min_order_value || "",
        limit_uses: promo.limit_uses || false,
        max_uses: promo.max_uses || "",
        started_at: promo.started_at ? promo.started_at.slice(0, 16) : "",
        ended_at: promo.ended_at ? promo.ended_at.slice(0, 16) : "",
        isActive: promo.isActive !== undefined ? promo.isActive : true,
        imageFile: null,
      });
    } else {
      setPromoForm({
        promocodeName: "",
        description: "",
        promocodeType: "discount",
        amount: "",
        min_order_value: "",
        limit_uses: false,
        max_uses: "",
        started_at: "",
        ended_at: "",
        isActive: true,
        imageFile: null,
      });
    }
    setIsPromocodeModalOpen(true);
  };

  // Handle Save Promocode
  const handleSavePromo = async (e) => {
    e.preventDefault();
    setPromoSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("promocodeName", promoForm.promocodeName);
      formData.append("description", promoForm.description);
      formData.append("promocodeType", promoForm.promocodeType);
      if (promoForm.amount) formData.append("amount", promoForm.amount);
      if (promoForm.min_order_value) formData.append("min_order_value", promoForm.min_order_value);
      formData.append("limit_uses", promoForm.limit_uses);
      if (promoForm.limit_uses && promoForm.max_uses) formData.append("max_uses", promoForm.max_uses);
      if (promoForm.started_at) formData.append("started_at", promoForm.started_at);
      if (promoForm.ended_at) formData.append("ended_at", promoForm.ended_at);
      formData.append("isActive", promoForm.isActive);

      if (promoForm.imageFile) {
        formData.append("promocodeImage", promoForm.imageFile);
      }

      let res;
      if (selectedPromocode) {
        res = await apiUpdatePromocode(accessToken, selectedPromocode.id, formData);
      } else {
        res = await apiCreatePromocode(accessToken, formData);
      }

      if (res && (res.status || res.statusCode === 200)) {
        showToast(
          selectedPromocode ? "Promocode updated successfully!" : "Promocode created successfully!",
          "success"
        );
        setIsPromocodeModalOpen(false);
        fetchPromocodes();
      } else {
        showToast(res?.message || "Failed to save promocode", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Error saving promocode", "error");
    } finally {
      setPromoSubmitting(false);
    }
  };

  // Delete Promocode
  const handleDeletePromo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promocode?")) return;
    try {
      const res = await apiDeletePromocode(accessToken, id);
      if (res && res.status) {
        showToast("Promocode deleted successfully", "success");
        fetchPromocodes();
      } else {
        showToast(res?.message || "Failed to delete promocode", "error");
      }
    } catch (err) {
      showToast("Error deleting promocode", "error");
    }
  };

  // Download PDF Invoice
  const handleDownloadInvoice = async (paymentId) => {
    if (!paymentId) return;
    setPdfLoadingId(paymentId);
    try {
      const res = await apiGetPaymentPdf(accessToken, paymentId);
      if (res && res.status && res.pdf_url) {
        window.open(res.pdf_url, "_blank");
        showToast("Invoice PDF opened successfully!", "success");
      } else {
        showToast(res?.message || "Could not generate invoice PDF", "error");
      }
    } catch (err) {
      showToast("Error downloading invoice PDF", "error");
    } finally {
      setPdfLoadingId(null);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied code: ${code}`, "success");
    setTimeout(() => setCopiedCode(""), 3000);
  };

  // Render Status Badges
  const renderStatusBadge = (status) => {
    const st = (status || "pending").toLowerCase();
    if (st === "success" || st === "processed" || st === "confirmed" || st === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Success
        </span>
      );
    }
    if (st === "pending" || st === "processing") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Pending
        </span>
      );
    }
    if (st === "failed" || st === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300">
        {status || "Unknown"}
      </span>
    );
  };

  // Render Payment Method Badge
  const renderMethodBadge = (method) => {
    const m = (method || "card").toLowerCase();
    let label = "Credit Card / Stripe";
    if (m === "paypal") label = "PayPal";
    if (m === "bank_transfer" || m === "bank") label = "Bank Transfer";
    if (m === "paypay") label = "PayPay";
    if (m === "conbini") label = "Convenience Store";

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
        <FiCreditCard className="text-gray-400 dark:text-gray-500" />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform duration-300 ${
            notification.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200"
              : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
          }`}
        >
          {notification.type === "error" ? (
            <FiAlertCircle className="text-rose-500 text-lg flex-shrink-0" />
          ) : (
            <FiCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FiCreditCard className="text-xl" />
            </span>
            Payment Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor USD transactions, process refunds, manage promotional campaigns, and generate invoices.
          </p>
        </div>

        {(activeTab === "coupons" || activeTab === "promocodes") && (
          <button
            onClick={() => handleOpenPromoModal(null)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm hover:shadow"
          >
            <FiPlus className="text-lg" />
            Create Promocode
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 overflow-x-auto bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        {[
          { id: "dashboard", label: "Payment Dashboard", icon: FiDollarSign },
          { id: "transactions", label: "Payment Transactions", icon: FiCreditCard },
          { id: "refunds", label: "Refund Management", icon: FiRefreshCw },
          { id: "coupons", label: "Coupon Management", icon: FiTag },
          { id: "promocodes", label: "Promotional Campaigns", icon: FiCopy },
          { id: "invoices", label: "Invoice Management", icon: FiFileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Icon className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PAYMENT DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Revenue */}
            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FiDollarSign />
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatUSD(paymentSummary?.total_amount)}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {paymentSummary?.total_payments_count || 0} total transactions
              </div>
            </div>

            {/* Successful Payments */}
            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Successful</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FiCheckCircle />
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatUSD(paymentSummary?.successful_amount)}
              </div>
              <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {paymentSummary?.successful_count || 0} paid ({paymentSummary?.successful_percentage || 0}%)
              </div>
            </div>

            {/* Refunds Processed */}
            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Refunded</span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <FiRefreshCw />
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatUSD(paymentSummary?.refunds_amount)}
              </div>
              <div className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                {paymentSummary?.refunds_percentage || 0}% of revenue
              </div>
            </div>

            {/* Pending Payments */}
            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <FiClock />
                </span>
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatUSD(paymentSummary?.pending_amount)}
              </div>
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                {paymentSummary?.pending_count || 0} in progress
              </div>
            </div>

            {/* Failed Payments */}
            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Failed</span>
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <FiXCircle />
                </span>
              </div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatUSD(paymentSummary?.failed_amount)}
              </div>
              <div className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {paymentSummary?.failed_count || 0} failed
              </div>
            </div>
          </div>

          {/* Recent Payments Preview Table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">Recent Transactions</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest customer payment activity</p>
              </div>
              <button
                onClick={() => setActiveTab("transactions")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View All Transactions &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5">Payment ID</th>
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Amount (USD)</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paymentsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                        Loading recent transactions...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                        No recent transactions found.
                      </td>
                    </tr>
                  ) : (
                    payments.slice(0, 5).map((pay) => (
                      <tr key={pay.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          {pay.payment_id || `PAY-${pay.id}`}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {pay.order?.order_id || pay.order_id || "-"}
                        </td>
                        <td className="px-6 py-4">{renderMethodBadge(pay.payment_method)}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {formatUSD(pay.amount)}
                        </td>
                        <td className="px-6 py-4">{renderStatusBadge(pay.payment_status)}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {pay.created_at ? new Date(pay.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenDetails(pay)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT TRANSACTIONS */}
      {activeTab === "transactions" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order ID, Payment ID..."
                value={paymentSearch}
                onChange={(e) => {
                  setPaymentSearch(e.target.value);
                  setPaymentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FiFilter className="text-gray-400" />
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setPaymentPage(1);
                }}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Payment Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50/70 dark:bg-gray-800/70 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Payment ID</th>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">Amount (USD)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paymentsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Loading payment transactions...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No payment transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                        {pay.payment_id || `PAY-${pay.id}`}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {pay.order?.order_id || pay.order_id || "-"}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {pay.order?.customer?.name || pay.order?.user?.userName || "Customer"}
                        </div>
                        <div className="text-gray-400">{pay.order?.customer?.email || pay.order?.user?.email || ""}</div>
                      </td>
                      <td className="px-5 py-4">{renderMethodBadge(pay.payment_method)}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                        {formatUSD(pay.amount)}
                      </td>
                      <td className="px-5 py-4">{renderStatusBadge(pay.payment_status)}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {pay.created_at ? new Date(pay.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(pay)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(pay.id)}
                            disabled={pdfLoadingId === pay.id}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                            title="Download Invoice PDF"
                          >
                            <FiDownload className={pdfLoadingId === pay.id ? "animate-spin" : ""} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 text-sm text-gray-500">
            <span>
              Page {paymentPage} of {paymentTotalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                disabled={paymentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setPaymentPage((p) => Math.min(paymentTotalPages, p + 1))}
                disabled={paymentPage >= paymentTotalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REFUND MANAGEMENT */}
      {activeTab === "refunds" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Refund / Order ID..."
                value={refundSearch}
                onChange={(e) => {
                  setRefundSearch(e.target.value);
                  setRefundPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FiFilter className="text-gray-400" />
              <select
                value={refundStatusFilter}
                onChange={(e) => {
                  setRefundStatusFilter(e.target.value);
                  setRefundPage(1);
                }}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Refund Statuses</option>
                <option value="requested">Requested</option>
                <option value="processed">Processed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50/70 dark:bg-gray-800/70 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Refund ID</th>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Refund Amount</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {refundsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Loading refund requests...
                    </td>
                  </tr>
                ) : refunds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No refund requests found.
                    </td>
                  </tr>
                ) : (
                  refunds.map((ref) => (
                    <tr key={ref.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                        REF-{ref.id}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {ref.order_id || ref.order?.order_id || "-"}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-900 dark:text-white">
                        {ref.user_name || "Customer"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-purple-600 dark:text-purple-400">
                        {formatUSD(ref.refund_amount)}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate">
                        {ref.reason || "Customer requested refund"}
                      </td>
                      <td className="px-5 py-4">{renderStatusBadge(ref.status)}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {ref.created_at ? new Date(ref.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {ref.status !== "processed" ? (
                          <button
                            onClick={() => handleOpenRefundModal(ref)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium dark:bg-purple-950/60 dark:text-purple-300 transition"
                          >
                            <FiRefreshCw />
                            Process
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 text-sm text-gray-500">
            <span>
              Page {refundPage} of {refundTotalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRefundPage((p) => Math.max(1, p - 1))}
                disabled={refundPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setRefundPage((p) => Math.min(refundTotalPages, p + 1))}
                disabled={refundPage >= refundTotalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4 & 5: COUPON & PROMOCODE MANAGEMENT */}
      {(activeTab === "coupons" || activeTab === "promocodes") && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Search & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Promocode..."
                value={promocodeSearch}
                onChange={(e) => {
                  setPromocodeSearch(e.target.value);
                  setPromocodePage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={promocodeStatusFilter}
                onChange={(e) => {
                  setPromocodeStatusFilter(e.target.value);
                  setPromocodePage(1);
                }}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={promocodeTypeFilter}
                onChange={(e) => {
                  setPromocodeTypeFilter(e.target.value);
                  setPromocodePage(1);
                }}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none"
              >
                <option value="all">All Discount Types</option>
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Price Amount</option>
              </select>

              <button
                onClick={() => handleOpenPromoModal(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
              >
                <FiPlus />
                New Code
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {promocodesLoading ? (
              <div className="col-span-full py-12 text-center text-gray-400">Loading promocodes...</div>
            ) : promocodes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">
                No promotional codes found. Create a new promo code to get started!
              </div>
            ) : (
              promocodes.map((promo) => (
                <div
                  key={promo.id}
                  className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow transition relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {promo.promocodeType === "fix_price" ? "Fixed Price" : "Discount"}
                        </span>
                        <h4 className="text-lg font-bold font-mono text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                          {promo.promocodeName}
                          <button
                            onClick={() => handleCopyCode(promo.promocodeName)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition"
                            title="Copy Promocode"
                          >
                            {copiedCode === promo.promocodeName ? (
                              <FiCheck className="text-emerald-500 text-sm" />
                            ) : (
                              <FiCopy className="text-sm" />
                            )}
                          </button>
                        </h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          promo.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {promo.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {promo.description || "No specific promotional terms specified."}
                    </p>

                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value / Discount:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {promo.promocodeType === "fix_price"
                            ? formatUSD(promo.amount)
                            : `${promo.amount}% OFF`}
                        </span>
                      </div>

                      {promo.min_order_value && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Order Value:</span>
                          <span>{formatUSD(promo.min_order_value)}</span>
                        </div>
                      )}

                      {promo.limit_uses && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Usage Limit:</span>
                          <span>{promo.max_uses || "Unlimited"} uses</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {promo.ended_at ? `Expires: ${new Date(promo.ended_at).toLocaleDateString()}` : "No Expiry"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPromoModal(promo)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Edit Promocode"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Delete Promocode"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: INVOICE MANAGEMENT */}
      {activeTab === "invoices" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Invoices & Receipts</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Download generated PDF invoices for customer payment orders
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Invoice / Order..."
                value={paymentSearch}
                onChange={(e) => {
                  setPaymentSearch(e.target.value);
                  setPaymentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50/70 dark:bg-gray-800/70 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Invoice / Payment ID</th>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Billing Amount (USD)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paymentsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Loading invoice records...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No invoices available.
                    </td>
                  </tr>
                ) : (
                  payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                        INV-{pay.id}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {pay.order?.order_id || pay.order_id || "-"}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-900 dark:text-white">
                        {pay.order?.customer?.name || pay.order?.user?.userName || "Customer"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                        {formatUSD(pay.amount)}
                      </td>
                      <td className="px-5 py-4">{renderStatusBadge(pay.payment_status)}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {pay.created_at ? new Date(pay.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(pay.id)}
                          disabled={pdfLoadingId === pay.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-950/60 dark:text-blue-300 transition disabled:opacity-50"
                        >
                          <FiDownload className={pdfLoadingId === pay.id ? "animate-spin" : ""} />
                          PDF Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL INSPECTION MODAL */}
      {isDetailModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiCreditCard className="text-blue-600" />
                Payment Transaction Details
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/50">
                <span className="text-gray-400">Payment ID:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {selectedPayment.payment_id || `PAY-${selectedPayment.id}`}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/50">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedPayment.order?.order_id || selectedPayment.order_id || "-"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/50">
                <span className="text-gray-400">Payment Method:</span>
                <span>{renderMethodBadge(selectedPayment.payment_method)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/50">
                <span className="text-gray-400">Status:</span>
                <span>{renderStatusBadge(selectedPayment.payment_status)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/50">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  {formatUSD(selectedPayment.amount)} USD
                </span>
              </div>

              {selectedPayment.paid_at && (
                <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/50">
                  <span className="text-gray-400">Paid Timestamp:</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {new Date(selectedPayment.paid_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleDownloadInvoice(selectedPayment.id);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <FiDownload /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROCESS REFUND MODAL */}
      {isRefundModalOpen && selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleProcessRefundSubmit}
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiRefreshCw className="text-purple-600" />
                Process Order Refund
              </h3>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Refund Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter amount in USD"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Or Refund Percentage (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={refundPercentage}
                  onChange={(e) => setRefundPercentage(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Admin Note
                </label>
                <textarea
                  rows={3}
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  placeholder="Add note regarding approval/refund processing..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refundSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {refundSubmitting ? "Processing..." : "Approve & Execute Refund"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE / EDIT PROMOCODE MODAL */}
      {isPromocodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSavePromo}
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiTag className="text-blue-600" />
                {selectedPromocode ? "Edit Promocode" : "Create New Promocode"}
              </h3>
              <button
                type="button"
                onClick={() => setIsPromocodeModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Promocode Name / Code *
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.promocodeName}
                  onChange={(e) => setPromoForm({ ...promoForm, promocodeName: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="Promocode offer terms & details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={promoForm.promocodeType}
                    onChange={(e) => setPromoForm({ ...promoForm, promocodeType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  >
                    <option value="discount">Percentage Discount (%)</option>
                    <option value="fix_price">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Amount / Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={promoForm.amount}
                    onChange={(e) => setPromoForm({ ...promoForm, amount: e.target.value })}
                    placeholder={promoForm.promocodeType === "discount" ? "e.g. 15 (%)" : "e.g. 50 ($)"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Minimum Order Value ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={promoForm.min_order_value}
                  onChange={(e) => setPromoForm({ ...promoForm, min_order_value: e.target.value })}
                  placeholder="Optional minimum cart total"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="limit_uses"
                  checked={promoForm.limit_uses}
                  onChange={(e) => setPromoForm({ ...promoForm, limit_uses: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="limit_uses" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Limit Maximum Total Uses
                </label>
              </div>

              {promoForm.limit_uses && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Max Uses Count
                  </label>
                  <input
                    type="number"
                    value={promoForm.max_uses}
                    onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={promoForm.started_at}
                    onChange={(e) => setPromoForm({ ...promoForm, started_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={promoForm.ended_at}
                    onChange={(e) => setPromoForm({ ...promoForm, ended_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={promoForm.isActive}
                  onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Promocode is Active
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsPromocodeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={promoSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {promoSubmitting ? "Saving..." : selectedPromocode ? "Update Promocode" : "Save Promocode"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
