"use client";

import React, { useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Spinner from "@/components/ui/Spinner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    FiArrowLeft,
    FiBox,
    FiCheckCircle,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiDownload,
    FiEdit2,
    FiEdit3,
    FiFileText,
    FiList, 
    FiLock,
    FiMaximize2,
    FiMinus,
    FiPlus,
    FiPrinter,
} from "react-icons/fi";
import { HiCheckCircle } from "react-icons/hi";
import { CiUser } from "react-icons/ci";
import { GoArrowRight } from "react-icons/go";
import {
    apiGetProfile,
    apiGetQuotation,
    apiSimulationExportPdf,
    apiSimulationHistory,
} from "@/services/AuthProfileService";
import {
    apiCancelQuotation,
    apiDownloadUserQuotationPdf,
    apiGetUserQuotationDetail,
} from "@/services/QuotationRequestService";
import { jsPDF } from "jspdf";

// const defaultLineItems = [
//     {
//         name: "Chef Coat - Premium Cotton",
//         meta: "White, Size M, Embroidered Logo",
//         qty: 50,
//         price: 45.0,
//         total: 2250.0,
//     },
//     {
//         name: "Apron - Heavy Duty",
//         meta: "Black, Adjustable Strap",
//         qty: 50,
//         price: 25.0,
//         total: 1250.0,
//     },
//     {
//         name: "Setup Fee - Embroidery",
//         meta: "One-time digitizing fee",
//         qty: 1,
//         price: 150.0,
//         total: 150.0,
//     },
// ];
const defaultTerms = [
    "Price includes one-time embroidery setup fee of $150.",
    "Standard shipping via FedEx Ground (3-5 business days).",
    "50% deposit required upon acceptance to begin production.",
    "Returns only accepted for manufacturing defects.",
];

const recentLinkedItems = [
    { id: "#FORM-3024-TPRO", sub: "Medical Scrubs Bulk" },
    { id: "#FORM-4024-SFDB", sub: "Corporate Shirts" },
    { id: "Corporate Girl", sub: "Custom Uniform Set" },
];

const getQuotationStatusMeta = (status) => {
    const normalizedStatus = String(status || "pending").toLowerCase();

    if (normalizedStatus.includes("accept")) {
        return {
            label: "Accepted",
            badgeClass: "bg-[#E8FAF1] text-[#22C55E]",
        };
    }

    if (
        normalizedStatus.includes("cancel") ||
        normalizedStatus.includes("declin") ||
        normalizedStatus.includes("reject")
    ) {
        return {
            label: normalizedStatus.includes("cancel") ? "Cancelled" : "Declined",
            badgeClass: "bg-[#FEF2F2] text-[#DC2626]",
        };
    }

    if (normalizedStatus.includes("review") || normalizedStatus.includes("receiv")) {
        return {
            label: "In Review",
            badgeClass: "bg-[#FFF7ED] text-[#EA580C]",
        };
    }

    return {
        label: "Pending",
        badgeClass: "bg-[#E8F1FF] text-[#1C4FA8]",
    };
};

const normalizePdfUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") {
        return rawUrl;
    }

    const sanitizedUrl = rawUrl
        .replace(/\[|\]|\(|\)|"|`/g, "")
        .trim();

    if (!sanitizedUrl) {
        return rawUrl;
    }

    const preferredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!preferredBaseUrl) {
        return sanitizedUrl;
    }

    try {
        const preferredOrigin = new URL(preferredBaseUrl).origin;

        if (sanitizedUrl.startsWith("/")) {
            return new URL(sanitizedUrl, preferredOrigin).toString();
        }

        const parsedUrl = new URL(sanitizedUrl);
        if (
            parsedUrl.hostname === "localhost" ||
            parsedUrl.hostname === "127.0.0.1"
        ) {
            return new URL(
                `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
                preferredOrigin,
            ).toString();
        }

        return parsedUrl.toString();
    } catch (error) {
        console.error("Failed to normalize PDF URL:", error);
        return sanitizedUrl;
    }
};

const parseSizeRange = (sizeQuantity) => {
    if (Array.isArray(sizeQuantity) && sizeQuantity.length) {
        return sizeQuantity.slice(0, 3).map((item, index) => ({
            label: item?.size || ["XS", "S", "M"][index] || `S${index + 1}`,
            value: item?.quantity || 1,
        }));
    }

    if (sizeQuantity && typeof sizeQuantity === "object") {
        return Object.entries(sizeQuantity)
            .slice(0, 3)
            .map(([label, value]) => ({ label, value: value || 1 }));
    }

    return [
        { label: "XS", value: 1 },
        { label: "S", value: 1 },
        { label: "M", value: 1 },
    ];
};

const formatCreatedLabel = (value) => {
    if (!value) {
        return "Created recently";
    }

    const createdAt = new Date(value);
    if (Number.isNaN(createdAt.getTime())) {
        return "Created recently";
    }

    const now = new Date();
    const diff = Math.max(
        0,
        Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    );

    if (diff === 0) return "Created today";
    if (diff === 1) return "Created 1 day ago";
    return `Created ${diff} days ago`;
};

const formatSimulationDate = (value) => {
    if (!value) return "-";

    const createdAt = new Date(value);
    if (Number.isNaN(createdAt.getTime())) return "-";

    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    const fullDate = createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    if (diffHours < 24) {
        const hourLabel = diffHours <= 1 ? "1 hr" : `${diffHours} hr`;
        return `${hourLabel}, ${fullDate}`;
    }

    return fullDate;
};

const formatDisplayDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const normalizeSizeRange = (quotation) => {
    if (Array.isArray(quotation?.size_range) && quotation.size_range.length) {
        return quotation.size_range.map((item, index) => ({
            label: item?.size || item?.label || `Size ${index + 1}`,
            value: item?.quantity || item?.value || 0,
        }));
    }

    return parseSizeRange(quotation?.size_quantity);
};

const normalizeQuotationItem = (item, index) => ({
    id: item?.id || `line-item-${index}`,
    name: item?.name || item?.description || item?.product_name || "Quotation Item",
    meta: item?.meta || item?.detail || "",
    qty: item?.qty || item?.quantity || 0,
    price: item?.price || item?.unit_price || 0,
    total: item?.total || 0,
    uniform_name:
        item?.uniform_name ||
        item?.name ||
        item?.description ||
        item?.product_name ||
        "Quotation Item",
    category: item?.category || item?.item_type || "-",
    quantity: item?.quantity || item?.qty || 0,
});

const normalizeQuotationRecord = (quotation) => {
    const itemsSource = Array.isArray(quotation?.line_items)
        ? quotation.line_items
        : [];

    return {
        ...quotation,
        id:
            quotation?.id ||
            quotation?.uuids ||
            quotation?.uuid ||
            quotation?.quotation_id ||
            "",
        uuids: quotation?.uuids || quotation?.uuid || quotation?.id || "",
        quotationNo:
            quotation?.quotationNo || quotation?.quotation_id || quotation?.request_id || "",
        company_name:
            quotation?.company_name ||
            quotation?.companyName ||
            quotation?.contact_person ||
            "Quotation",
        amount: quotation?.amount || quotation?.total_amount || "0.00",
        total_amount: quotation?.total_amount || quotation?.amount || "0.00",
        terms:
            quotation?.terms ||
            quotation?.notes_terms ||
            defaultTerms,
        line_items: itemsSource.map(normalizeQuotationItem),
        items: itemsSource.map(normalizeQuotationItem),
        pdf_url: normalizePdfUrl(quotation?.pdf_url || quotation?.pdf || ""),
        created_at: quotation?.created_at || quotation?.submitted_at || "",
        status_label:
            quotation?.status_label ||
            getQuotationStatusMeta(quotation?.quotation_status || quotation?.status).label,
        size_quantity:
            quotation?.size_quantity ||
            quotation?.size_range ||
            {},
        size_range: normalizeSizeRange(quotation),
    };
};

const extractQuotationCollection = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    if (Array.isArray(payload?.results)) return payload.results;
    if (payload?.data && typeof payload.data === "object") return [payload.data];
    return [];
};

const buildQuotationPdfBlobUrl = (quotation) => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 56;

    const navy = [0, 53, 96];
    const darkText = [17, 24, 39];
    const grayText = [75, 85, 99];
    const lightGray = [107, 114, 128];
    const borderBlue = [215, 227, 244];
    const rowBorder = [238, 242, 247];
    const topBarBlue = [13, 77, 126];

    doc.setFillColor(...topBarBlue);
    doc.rect(0, 0, pageWidth, 8, "F");

    const logoSize = 30;
    const logoY = 40;
    doc.setDrawColor(...borderBlue);
    doc.rect(marginX, logoY, logoSize, logoSize);
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("KF", marginX + logoSize / 2, logoY + logoSize / 2 + 3, {
        align: "center",
    });

    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("QUOTATION", marginX, logoY + logoSize + 34);

    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const quotationNo =
        quotation?.quotationNo || quotation?.quotation_id || "Q-2023-88";
    doc.text(`#${quotationNo}`, marginX, logoY + logoSize + 50);

    const companyName =
        quotation?.company_name || quotation?.companyName || "UniformPro Inc.";
    const rightX = pageWidth - marginX;
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(companyName, rightX, 46, { align: "right" });
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("123 Fashion Blvd", rightX, 60, { align: "right" });
    doc.text("New York, NY 10001", rightX, 73, { align: "right" });
    doc.text("USA", rightX, 86, { align: "right" });

    const tableTop = logoY + logoSize + 90;
    const colDesc = marginX;
    const colQty = marginX + 250;
    const colPrice = marginX + 305;
    const colTotal = marginX + 385;

    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Description", colDesc, tableTop);
    doc.text("Qty", colQty, tableTop);
    doc.text("Unit Price", colPrice, tableTop);
    doc.text("Total", colTotal, tableTop);

    doc.setDrawColor(...borderBlue);
    doc.line(marginX, tableTop + 8, rightX, tableTop + 8);

    const items = quotation?.line_items?.length
        ? quotation.line_items
        : [];
    let rowY = tableTop + 32;
    const rowGap = 54;

    items.forEach((item) => {
        doc.setTextColor(...darkText);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(item.name, colDesc, rowY);

        doc.setTextColor(...lightGray);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(item.meta || "", colDesc, rowY + 12);

        doc.setTextColor(...grayText);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(String(item.qty), colQty, rowY);
        doc.text(`$${Number(item.price).toFixed(2)}`, colPrice, rowY);

        doc.setTextColor(...darkText);
        doc.setFont("helvetica", "bold");
        doc.text(
            `$${Number(item.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            colTotal,
            rowY,
        );

        doc.setDrawColor(...rowBorder);
        doc.line(marginX, rowY + 20, rightX, rowY + 20);

        rowY += rowGap;
    });

    const terms = Array.isArray(quotation?.terms) ? quotation.terms : [];
    const footerY = doc.internal.pageSize.getHeight() - 70;
    doc.setDrawColor(...rowBorder);
    doc.line(marginX, footerY, rightX, footerY);
    doc.setTextColor(...lightGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    terms.forEach((term, index) => {
        doc.text(term, marginX, footerY + 16 + index * 12);
    });

    return { url: URL.createObjectURL(doc.output("blob")), doc };
};

const ZOOM_STEP = 10;

const QuotationPreviewCard = ({ quotation, accessToken }) => {
    const [pdfBaseUrl, setPdfBaseUrl] = useState("");
    const [previewLoading, setPreviewLoading] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(100);
    const docRef = useRef(null);

    useEffect(() => {
        let previewObjectUrl = "";
        let generatedObjectUrl = "";
        let isMounted = true;

        const loadPreview = async () => {
            setPreviewLoading(true);
            setZoomLevel(100);

            const existingUrl =
                quotation?.pdf_url ||
                quotation?.pdf ||
                quotation?.quotation_pdf ||
                quotation?.quotationPdf ||
                quotation?.export_pdf_url;

            const quotationUuid =
                quotation?.uuids ||
                quotation?.uuid ||
                quotation?.id ||
                quotation?.quotation_id;

            if (existingUrl && accessToken && quotationUuid) {
                try {
                    const pdfBlob = await apiDownloadUserQuotationPdf(
                        quotationUuid,
                        accessToken,
                        normalizePdfUrl(existingUrl),
                    );

                    if (!isMounted) return;

                    previewObjectUrl = URL.createObjectURL(pdfBlob);
                    docRef.current = null;
                    setPdfBaseUrl(previewObjectUrl);
                    setPreviewLoading(false);
                    return;
                } catch (error) {
                    console.error("Quotation preview blob error:", error);
                }
            }

            const { url, doc } = buildQuotationPdfBlobUrl(quotation);
            if (!isMounted) {
                URL.revokeObjectURL(url);
                return;
            }

            generatedObjectUrl = url;
            docRef.current = doc;
            setPdfBaseUrl(url);
            setPreviewLoading(false);
        };

        loadPreview();

        return () => {
            isMounted = false;
            if (previewObjectUrl) {
                URL.revokeObjectURL(previewObjectUrl);
            }
            if (generatedObjectUrl) {
                URL.revokeObjectURL(generatedObjectUrl);
            }
        };
    }, [quotation, accessToken]);

    const quotationNo =
        quotation?.quotationNo ||
        quotation?.quotation_id ||
        "Uniform_Quote_Q-2023-88";

    const pdfFileName = `${quotationNo}.pdf`;

    const pdfUrl = pdfBaseUrl
        ? `${pdfBaseUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
        : "";
    const zoomScale = zoomLevel / 100;

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(10, prev - ZOOM_STEP));
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => prev + ZOOM_STEP);
    };

    const handleDownload = () => {
        if (docRef.current) {
            docRef.current.save(pdfFileName);
        } else if (pdfBaseUrl) {
            const link = document.createElement("a");
            link.href = pdfBaseUrl;
            link.download = pdfFileName;
            link.click();
        }
    };

    const handlePrint = () => {
        if (!pdfBaseUrl) return;
        const printWindow = window.open(pdfBaseUrl);
        printWindow?.addEventListener("load", () => printWindow.print());
    };

    return (
        <div className="relative h-fit rounded-[20px] bg-[#1F2937] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <div className="mb-3 flex items-center justify-between gap-3 text-[11px] text-white/80">
                <div className="flex items-center gap-3">
                    <span className="max-w-[220px] truncate rounded-md bg-[#344054] px-3 py-2 text-[11px] text-white">
                        {pdfFileName}
                    </span>
                    <span className="rounded-md bg-[#344054] px-3 py-2 text-[10px] text-white/90">
                        Read Only
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md bg-[#1A2233] text-white">
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-l-md text-white transition-colors hover:bg-white/10"
                            onClick={handleZoomOut}
                        >
                            <FiMinus size={14} />
                        </button>
                        <button
                            className="min-w-[64px] text-center text-[12px] font-medium text-white"
                            onClick={() => setZoomLevel(100)}
                        >
                            {zoomLevel}%
                        </button>
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-r-md text-white transition-colors hover:bg-white/10"
                            onClick={handleZoomIn}
                        >
                            <FiPlus size={14} />
                        </button>
                    </div>
                    <span className="h-6 w-px bg-white/20" />
                    <button
                        className="rounded-md p-1.5 text-white transition-colors hover:bg-white/10"
                        onClick={handleDownload}
                    >
                        <FiDownload size={14} />
                    </button>
                    <button
                        className="rounded-md p-1.5 text-white transition-colors hover:bg-white/10"
                        onClick={handlePrint}
                    >
                        <FiPrinter size={14} />
                    </button>
                </div>
            </div>

            <div className="relative h-[560px] overflow-auto rounded-[10px] bg-[#E5E7EB]">
                {pdfUrl && !previewLoading ? (
                    <div
                        className={`relative flex min-h-[560px] ${
                            zoomLevel <= 100 ? "items-start justify-center" : "items-start justify-start"
                        }`}
                        style={{
                            width: zoomLevel > 100 ? `${zoomLevel}%` : "100%",
                            height: zoomLevel > 100 ? `${560 * zoomScale}px` : "560px",
                            minWidth: zoomLevel > 100 ? `${zoomLevel}%` : "100%",
                        }}
                    >
                        <iframe
                            key={pdfBaseUrl}
                            src={pdfUrl}
                            title="Quotation PDF preview"
                            className="border-0 bg-white"
                            style={{
                                width: `${100 / zoomScale}%`,
                                height: `${560 / zoomScale}px`,
                                transform: `scale(${zoomScale})`,
                                transformOrigin: zoomLevel <= 100 ? "top center" : "top left",
                                flexShrink: 0,
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex h-[560px] items-center justify-center">
                        <Spinner size={24} />
                    </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                    <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#111827] px-3 py-1.5 text-[10px] text-white/85 shadow-md">
                        <button className="text-white/60 hover:text-white">
                            <FiChevronLeft size={14} />
                        </button>
                        <span>Page 1 / 1</span>
                        <button className="text-white/60 hover:text-white">
                            <FiChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
const SummarySizeRow = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#4B5563]">
            {label}
        </span>

       
    </div>
);  

const MyProfile = () => {
    const fileRef = useRef(null);
    const { data: session } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [quotationData, setQuotationData] = useState([]);
    const [image, setImage] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [quotationLoading, setQuotationLoading] = useState(true);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [simulationData, setSimulationData] = useState([]);
    const [simulationLoading, setSimulationLoading] = useState(true);
    const [pdfLoadingId, setPdfLoadingId] = useState(null);
    const [quotationDetailLoadingId, setQuotationDetailLoadingId] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelSubmitting, setCancelSubmitting] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const activeQuotation = selectedQuotation || quotationData?.[0] || null;
    const sizeRange = Array.isArray(activeQuotation?.size_range) && activeQuotation.size_range.length
        ? activeQuotation.size_range
        : parseSizeRange(activeQuotation?.size_quantity);
    const terms = Array.isArray(selectedQuotation?.terms) && selectedQuotation.terms.length
        ? selectedQuotation.terms
        : defaultTerms;
    const recentSimulations = simulationData;
    const visibleRecentSimulations = recentSimulations.slice(0, 3);

    const fetchProfile = async () => {
        try {
            if (!session?.accessToken) return;
            setProfileLoading(true);
            const res = await apiGetProfile(session.accessToken);
            if (res?.status && res?.data) {
                setProfile(res.data);
                setImage(res.data.profileImage || null);
            }
        } catch (error) {
            console.error("Profile API error:", error);
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchQuotation = async () => {
        try {
            if (!session?.accessToken) return;
            setQuotationLoading(true);
            const res = await apiGetQuotation(session.accessToken);
            if (res?.success || res?.status) {
                let normalizedQuotations = extractQuotationCollection(res).map(
                    normalizeQuotationRecord,
                );

                const firstQuotationUuid =
                    normalizedQuotations?.[0]?.uuids ||
                    normalizedQuotations?.[0]?.uuid ||
                    normalizedQuotations?.[0]?.id;

                if (firstQuotationUuid) {
                    try {
                        const detailRes = await apiGetUserQuotationDetail(
                            firstQuotationUuid,
                            session.accessToken,
                        );

                        if (detailRes?.success || detailRes?.status) {
                            const detailRecord = normalizeQuotationRecord(
                                detailRes?.data || detailRes,
                            );

                            normalizedQuotations = [
                                detailRecord,
                                ...normalizedQuotations.slice(1),
                            ];
                        }
                    } catch (detailError) {
                        console.error("Initial quotation detail API error:", detailError);
                    }
                }

                setQuotationData(normalizedQuotations);
            }
        } catch (error) {
            console.error("Quotation API error:", error);
        } finally {
            setQuotationLoading(false);
        }
    };
    /* -------------------- FETCH SIMULATION HISTORY -------------------- */
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
            console.error("Failed to load Simulation History", err);
        } finally {
            setSimulationLoading(false);
        }
    };

    useEffect(() => {
        if (!session?.accessToken) return;
        fetchProfile();
        fetchQuotation();
        fetchSimulationHistory();
    }, [session?.accessToken]);

    const handleSelectImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (fileRef.current) {
            fileRef.current.value = "";
        }
    };

    const handleSimulationRedirect = (id) => {
        if (!id) return;
        router.push(`/dashboards/design-result/${id}`);
    };

    const handleSimulationPdfDownload = async (id) => {
        try {
            if (!session?.accessToken || !id) return;
            setPdfLoadingId(id);

            const res = await apiSimulationExportPdf(session.accessToken, id);

            if (res?.status && res?.pdf_url) {
                window.open(normalizePdfUrl(res.pdf_url), "_blank");
            }
        } catch (error) {
            console.error("Simulation PDF download error:", error);
        } finally {
            setPdfLoadingId(null);
        }
    };

    const handleQuotationPreview = async (quotation) => {
        if (!session?.accessToken || !quotation) return;

        const quotationUuid =
            quotation?.uuids || quotation?.uuid || quotation?.id || quotation?.quotation_id;

        if (!quotationUuid) {
            setSelectedQuotation(normalizeQuotationRecord(quotation));
            return;
        }

        try {
            setQuotationDetailLoadingId(quotationUuid);
            const res = await apiGetUserQuotationDetail(
                quotationUuid,
                session.accessToken,
            );

            if (res?.success || res?.status) {
                setSelectedQuotation(
                    normalizeQuotationRecord(res?.data || res),
                );
                return;
            }

            setSelectedQuotation(normalizeQuotationRecord(quotation));
        } catch (error) {
            console.error("Quotation detail API error:", error);
            setSelectedQuotation(normalizeQuotationRecord(quotation));
        } finally {
            setQuotationDetailLoadingId(null);
        }
    };

    const handleOpenCancelDialog = () => {
        setCancelError("");
        setCancelReason("");
        setCancelDialogOpen(true);
    };

    const handleCloseCancelDialog = () => {
        if (cancelSubmitting) return;
        setCancelDialogOpen(false);
        setCancelError("");
        setCancelReason("");
    };

    const handleResetCancelReason = () => {
        setCancelReason("");
        setCancelError("");
    };

    const handleCancelQuotation = async () => {
        const quotationId =
            selectedQuotation?.uuids ||
            selectedQuotation?.uuid ||
            selectedQuotation?.id ||
            selectedQuotation?.quotation_id;

        if (!session?.accessToken || !quotationId) {
            setCancelError("Quotation not found.");
            return;
        }

        if (!cancelReason.trim()) {
            setCancelError("Please enter a reason.");
            return;
        }

        try {
            setCancelSubmitting(true);
            setCancelError("");

            const res = await apiCancelQuotation(
                quotationId,
                { cancel_reason: cancelReason.trim() },
                session.accessToken,
            );

            if (res?.success || res?.status) {
                const updatedQuotation = {
                    ...selectedQuotation,
                    status_label: "Cancelled",
                    quotation_status: "cancelled",
                    status: "cancelled",
                    cancel_reason: cancelReason.trim(),
                };

                setSelectedQuotation(updatedQuotation);
                setQuotationData((prev) =>
                    prev.map((item) => {
                        const itemId =
                            item?.uuids || item?.uuid || item?.id || item?.quotation_id;

                        return itemId === quotationId
                            ? {
                                  ...item,
                                  status_label: "Cancelled",
                                  quotation_status: "cancelled",
                                  status: "cancelled",
                                  cancel_reason: cancelReason.trim(),
                              }
                            : item;
                    }),
                );
                handleCloseCancelDialog();
                return;
            }

            setCancelError(res?.message || "Unable to cancel quotation.");
        } catch (error) {
            console.error("Cancel quotation error:", error);
            setCancelError(
                error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    "Unable to cancel quotation.",
            );
        } finally {
            setCancelSubmitting(false);
        }
    };

    if (profileLoading) {
        return (
            <section className="relative mt-15 mx-auto w-full bg-white px-5 md:px-8 lg:px-12">
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#1C4FA8]" />
                </div>
            </section>
        );
    }

    const selectedStatusMeta = getQuotationStatusMeta(
        selectedQuotation?.quotation_status || selectedQuotation?.status_label,
    );
    const canCancelQuotation =
        selectedStatusMeta.label.toLowerCase() === "pending";

    if (selectedQuotation) {
        return (
            <>
                <div className="mx-auto max-w-7xl rounded-[20px] bg-white p-4 md:p-8">
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setSelectedQuotation(null)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#003560]"
                    >
                        <FiArrowLeft size={16} />
                        Back to Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 items-start xl:grid-cols-[minmax(0,1.4fr)_320px]">
                    <QuotationPreviewCard
                        quotation={selectedQuotation}
                        accessToken={session?.accessToken}
                    />

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${selectedStatusMeta.badgeClass}`}>
                                {selectedQuotation?.status_label || selectedStatusMeta.label}
                            </span>
                            <span className="text-[11px] text-[#9CA3AF]">
                                {formatCreatedLabel(selectedQuotation?.created_at)}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-[38px] font-semibold leading-[1.02] text-[#111827]">
                                Quotation Summary
                            </h2>
                            <p className="mt-2 text-sm text-[#6B7280]">
                                Review the key details before accepting.
                            </p>
                        </div>

                        <div className="rounded-[18px] border border-[#F3F4F6] bg-[#F8FAFC] p-4">
                            <p className="text-[11px] text-[#9CA3AF]">Total Amount (USD)</p>
                            <p className="mt-2 text-xl font-semibold text-[#003560]">
                                {selectedQuotation?.amount ||
                                    selectedQuotation?.total_amount ||
                                    "0.00"}
                            </p>
                        </div>
                        <div className="rounded-[18px] bg-[#F7FBFF] p-4">
                            <p className="mb-3 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                               <FiMaximize2 size={11} />
                                Size Range
                            </p>
                            <div className="space-y-2">
                                {sizeRange.map((item) => (
                                    <SummarySizeRow
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))} 
                            </div>
                        </div>

                        <div className="rounded-[18px] bg-[#DBEAFE] p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <FiList className="text-[#003560]" size={14} />
                                <p className="text-sm font-semibold text-[#111827]">
                                    Notes & Terms
                                </p>
                            </div>
                            <div className="space-y-3">
                                {terms.map((term) => (
                                    <div key={term} className="flex gap-3 text-sm text-[#4B5563]">
                                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#36A9F8]" />
                                        <p>{term}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {canCancelQuotation && (
                                <Button
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#003560] text-white hover:bg-[#002a49]"
                                    onClick={handleOpenCancelDialog}
                                >
                                    Cancel
                                </Button>
                            )}
                            {/* <Button
                                variant="default"
                                className="h-12 w-full rounded-lg border border-[#D7E3F4] bg-white text-[#111827] flex items-center justify-center gap-2"
                            >
                                <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center text-[#111827]">
                                    <FiFileText size={17} />
                                    <FiEdit2
                                        size={9}
                                        className="absolute -bottom-[1px] -right-[3px] rounded-full bg-white"
                                    />
                                </span>
                                Request Changes
                            </Button>
                            <button className="w-full text-center text-xs text-[#9CA3AF]">
                                Decline Quote
                            </button> */}
                        </div>
                    </div>
                </div>
                </div>

                <Dialog
                    isOpen={cancelDialogOpen}
                    onClose={handleCloseCancelDialog}
                    onRequestClose={handleCloseCancelDialog}
                    width={520}
                    contentClassName="p-0"
                >
                    <div className="rounded-[20px] bg-white p-6">
                        <div className="mb-5">
                            <h3 className="text-xl font-semibold text-[#111827]">
                                Cancel Quotation
                            </h3>
                            <p className="mt-2 text-sm text-[#6B7280]">
                                Please enter the reason for cancellation.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="cancel-reason"
                                className="mb-2 block text-sm font-medium text-[#374151]"
                            >
                                Reason
                            </label>
                            <textarea
                                id="cancel-reason"
                                value={cancelReason}
                                onChange={(event) => setCancelReason(event.target.value)}
                                placeholder="Enter cancellation reason"
                                className="min-h-[140px] w-full resize-none rounded-xl border border-[#D7E3F4] px-4 py-3 text-sm text-[#111827] outline-none transition-colors focus:border-[#1C4FA8]"
                            />
                            {cancelError && (
                                <p className="mt-2 text-sm text-[#DC2626]">{cancelError}</p>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button
                                variant="default"
                                className="h-11 rounded-lg border border-[#D7E3F4] bg-white px-5 text-[#475569]"
                                onClick={handleResetCancelReason}
                                disabled={cancelSubmitting}
                            >
                                Reset
                            </Button>
                            <Button
                                className="h-11 rounded-lg bg-[#003560] px-5 text-white hover:bg-[#002a49]"
                                onClick={handleCancelQuotation}
                                loading={cancelSubmitting}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 bg-[#F9FAFB]">
            <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F6FAFF] p-4 md:px-5 md:py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
                    <div className="w-full max-w-[102px] rounded-[16px] border border-[#B7D2F5] bg-[#F6FAFF] p-3">
                        <div className="mx-auto flex w-fit items-center justify-center rounded-[18px] border border-[#B7D2F5] bg-white p-1.5">
                            <Avatar
                                size={56}
                                icon={<CiUser />}
                                src={
                                    image ||
                                    profile?.profileImage ||
                                    profile?.profile_image ||
                                    profile?.avatar ||
                                    profile?.image ||
                                    ""
                                }
                                className="object-cover"
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-medium">
                            <button
                                type="button"
                                className="text-[#4F8FEF]"
                                onClick={() => fileRef.current?.click()}
                            >
                                Upload
                            </button>
                            <button
                                type="button"
                                className="text-[#EF4444]"
                                onClick={handleRemoveImage}
                            >
                                Remove
                            </button>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            className="hidden"
                            onChange={handleSelectImage}
                        />
                    </div>

                    <div className="relative flex-1 pr-0 md:pr-[110px]">
                        <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[10px] font-medium text-[#22C55E] md:absolute md:right-3 md:-top-2 md:mb-0 md:shadow-[0_0_0_6px_#F6FAFF]">
                            <HiCheckCircle size={12} />
                            Verified Account
                        </span>

                        <div className="rounded-[16px] border border-[#B7D2F5] bg-[#F6FAFF] p-4 md:w-[762px] md:min-h-[132px] md:px-5 md:py-4">
                            <div className="mb-5">
                                <h4 className="text-sm font-semibold text-[#1F2937]">
                                    Personal Details
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]">First Name</p>
                                    <p className="mt-1 text-xs font-medium text-[#1F2937]">
                                        {profile?.firstName || "John"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]">Last Name</p>
                                    <p className="mt-1 text-xs font-medium text-[#1F2937]">
                                        {profile?.lastName || "Doe"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]">Email Address</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <p className="text-xs font-medium text-[#1F2937] break-all">
                                            {profile?.email || "john@company.com"}
                                        </p>
                                        <HiCheckCircle size={12} className="shrink-0 text-[#22C55E]" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]">Phone Number</p>
                                    <p className="mt-1 text-xs font-medium text-[#1F2937]">
                                        {profile?.phone || "+81 90-234-5678"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]">Position</p>
                                    <p className="mt-1 text-xs font-medium text-[#1F2937]">
                                        {profile?.roleName || "Manager"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 pl-0 md:pl-[142px]">
                    <Button
                        size="sm"
                        icon={<FiEdit2 size={12} />}
                        className="h-7 whitespace-nowrap rounded-md border border-[#B7D2F5] px-3 text-[11px] font-medium leading-none text-[#475569]"
                        onClick={() => router.push("/profile/personal-information")}
                    >
                        Edit Profile
                    </Button>
                    <Button
                        size="sm"
                        icon={<FiLock size={12} />}
                        className="h-7 whitespace-nowrap rounded-md border border-[#B7D2F5]  px-3 text-[11px] font-medium leading-none text-[#475569]"
                        onClick={() => router.push("/profile/change-password")}
                    >
                        Change Password
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-[#8DB4E2] bg-white">
                <div className="flex items-center justify-between border-b border-[#E5EDF7] px-4 py-3">
                    <div>
                        <h4 className="text-sm font-semibold text-[#003560]">
                            Quotation Status
                        </h4>
                        <p className="mt-1 text-[11px] text-[#003560]">
                            {activeQuotation?.quotationNo ||
                                activeQuotation?.quotation_id ||
                                "RQ-2025-0194"}
                        </p>
                        <p className="text-[10px] text-[#000000]">
                            {formatDisplayDate(activeQuotation?.created_at)}
                        </p>
                    </div>

                    <Button className="rounded-md bg-[#003560] px-4 py-2 text-xs text-white hover:bg-[#002a49]">
                        View Design
                    </Button>
                </div>

                <div className="bg-white px-4 py-4 space-y-3">
                    {quotationLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner size={24} />
                        </div>
                    ) : quotationData.length ? (
                        quotationData.slice(0, 3).map((quotation, index) => (
                            <div
                                key={quotation?.quotation_id || quotation?.quotationNo || index}
                                className="flex items-center justify-between rounded-lg  bg-[#F8FBFF] px-4 py-4"
                            >
                                <p className="text-sm text-[#111827]">
                                    {quotation?.company_name || quotation?.companyName || "Quotation"}
                                </p>

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-1 text-[10px] font-medium text-[#4B5563]"
                                    onClick={() => handleQuotationPreview(quotation)}
                                    disabled={quotationDetailLoadingId === (quotation?.uuids || quotation?.uuid || quotation?.id || quotation?.quotation_id)}
                                >
                                    <FiFileText className="text-[#003560]" size={16} />
                                    {quotationDetailLoadingId === (quotation?.uuids || quotation?.uuid || quotation?.id || quotation?.quotation_id)
                                        ? "Loading..."
                                        : "View PDF"}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-lg bg-[#F8FBFF] px-4 py-6 text-center text-sm text-[#6B7280]">
                            No quotations found
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="overflow-hidden rounded-[10px] border border-[#E5EDF7] bg-white">
                    <div className="flex items-center justify-between px-4 py-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                            <FiBox size={14} />
                            Recent Orders
                        </h4>
                        <button
                            className="flex items-center gap-1 text-[11px] text-[#60A5FA]"
                            onClick={() => router.push("/profile/order-history")}
                        >
                            View All <GoArrowRight size={12} />
                        </button>
                    </div>

                    <div className="px-4 pb-4">

                        <div className="rounded-[10px] border border-[#EEF2F7] p-3">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-[#9CA3AF]">ORDER NUMBER</p>
                                    <p className="mt-1 text-xs font-semibold text-[#003560]">
                                        #ORD-10234
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#DCFCE7] px-2 py-1 text-[10px] text-[#22C55E]">
                                    Completed
                                </span>
                            </div>

                            <div className="mb-3 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-[#9CA3AF]">Date</p>
                                    <p className="mt-1 text-[11px] text-[#111827]">
                                        December 2025
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#9CA3AF]">Total Amount</p>
                                    <p className="mt-1 text-[11px] text-[#111827]">¥454.00</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    className="bg-[#1C4FA8] text-white hover:bg-[#1C4FA8]"
                                >
                                    View Details
                                </Button>
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="border border-[#D7E3F4] bg-white text-[#111827]"
                                >
                                    Track
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="mb-2 text-[11px] font-semibold text-[#4B5563]">
                                Linked Quotes & Orders
                            </p>
                            <div className="space-y-2">
                                {recentLinkedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-[10px] border border-[#EEF2F7] px-3 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-[#F9FAFB] p-2">
                                                <FiFileText className="text-[#94A3B8]" size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-[#111827]">
                                                    {item.id}
                                                </p>
                                                <p className="text-[10px] text-[#9CA3AF]">{item.sub}</p>
                                            </div>
                                        </div>
                                        <FiChevronRight className="text-[#94A3B8]" size={14} />
                                    </div>
                                ))}
                            </div>

                            <p
                                className="mt-4 cursor-pointer text-center text-[11px] text-[#4B5563]"
                                onClick={() => router.push("/profile/order-history")}
                            >
                                View All Linked Orders
                            </p>
                        </div>
                       
                    </div>
                </div>

                <div className="overflow-hidden rounded-[14px] border border-[#E5EDF7] bg-white">
                    <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-4">
                        <h4 className="flex items-center gap-2 text-[15px] font-semibold text-[#1F2A44]">
                            <FiFileText size={14} />
                            Recent Simulations
                        </h4>
                        <button
                            className="flex items-center gap-1 text-[12px] font-medium text-[#2D6CDF]"
                            onClick={() => router.push("/profile/simulation-history")}
                        >
                            View All <GoArrowRight size={12} />
                        </button>
                    </div>

                    <div className="px-5 pb-5 pt-4">
                        {simulationLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Spinner size={24} />
                            </div>
                        ) : recentSimulations.length > 0 ? (
                            <div className="space-y-0">
                                {visibleRecentSimulations.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="relative flex items-start justify-between gap-4 py-5"
                                    >
                                        <div className="flex min-w-0 gap-3">
                                            <div className="relative flex w-4 shrink-0 justify-center">
                                                <span className="mt-1.5 h-3 w-3 rounded-full border border-[#3B82F6] bg-white" />
                                                {index !== visibleRecentSimulations.length - 1 && (
                                                    <span className="absolute top-5 h-[82px] w-px bg-[#DCE7F5]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 space-y-2">
                                                <p className="truncate text-[12px] font-semibold leading-[18px] text-[#1F2A44]">
                                                    {item?.productName || "Untitled Simulation"}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] font-normal text-[#9CA3AF]">
                                                    <FiClock size={10} className="shrink-0" />
                                                    <span>{formatDisplayDate(item?.created_at)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1 text-[11px] font-medium text-[#2D6CDF] transition-colors hover:text-[#1C4FA8] disabled:cursor-not-allowed disabled:opacity-70"
                                                    onClick={() => handleSimulationPdfDownload(item?.id)}
                                                    disabled={pdfLoadingId === item?.id}
                                                >
                                                    <FiDownload size={12} className="shrink-0" />
                                                    {pdfLoadingId === item?.id
                                                        ? "Downloading..."
                                                        : "PDF Download"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-5 pt-0.5 text-right">
                                            <span
                                                className={`inline-flex min-w-[52px] justify-center rounded-[4px] px-2 py-1 text-[9px] font-semibold leading-none ${item?.isActive
                                                    ? "bg-[#E9F1FF] text-[#2D6CDF]"
                                                    : "bg-[#F1F5F9] text-[#94A3B8]"
                                                    }`}
                                            >
                                                {item?.isActive ? "OPEN" : "CLOSED"}
                                            </span>
                                            <button
                                                type="button"
                                                className="text-[11px] font-medium text-[#7C8AA5] transition-colors hover:text-[#1C4FA8]"
                                                onClick={() => handleSimulationRedirect(item?.id)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-[11px] text-[#9CA3AF]">
                                No recent simulations found
                            </div>
                        )}

                        <div className="mt-6 border-t border-[#D7E3F4] pt-6">
                            <Button
                                variant="default"
                                className="h-10 w-full justify-center rounded-[10px] border border-[#6D95D8] bg-[#F8FBFF] px-4 text-[13px] font-medium text-[#1F3F75] hover:bg-[#F3F8FF]"
                                onClick={() => router.push("/dashboards")}
                            >
                                Create New Simulation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
