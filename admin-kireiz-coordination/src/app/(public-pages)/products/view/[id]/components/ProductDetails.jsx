"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiImage,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiGetProductById } from "@/services/ProductService";

/*
 * Product detail page, reached from Simulation Assets → Product Visibility.
 *
 * Source:
 *   product/get/<id>/ — the catalogue record
 */

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const Field = ({ label, children }) => (
  <div>
    <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
      {label}
    </p>
    <p className="text-sm text-[#1C2C56] mt-1">{children ?? "—"}</p>
  </div>
);

const StatTile = ({ label, value, tone = "default" }) => {
  const tones = {
    default: "bg-[#F8FAFC] text-[#1C2C56]",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className={`rounded-xl p-4 ${tones[tone]}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
};

const ProductDetails = () => {
  const t = useTranslations("productDetails");
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetProductById(id);
      if (res?.status && res.data) {
        setProduct(res.data);
      } else {
        setNotFound(true);
        return;
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      notify(t("errorTitle"), "danger", t("loadFailed"));
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-5 mt-6">
          <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
        <div className="border border-dashed border-[#CBD5E1] rounded-xl py-16 text-center">
          <p className="text-base font-medium text-[#1C2C56]">{t("notFound")}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 bg-[#1C4FA8] text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  const partCount = product.parts?.length || 0;

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
      {/* Header */}
      <p className="text-sm text-[#486284] mb-2">
        {t("breadcrumbDashboard")} / {t("breadcrumbProducts")} /{" "}
        <span className="text-[#1C2C56]">{t("breadcrumbCurrent")}</span>
      </p>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            title={t("back")}
            className="w-10 h-10 bg-white rounded-full shadow-sm border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC]"
          >
            <FiArrowLeft className="text-[#1C2C56]" size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
              {product.productName}
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              {product.category?.categoryName || "—"}
              {product.subcategory?.name ? ` · ${product.subcategory.name}` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/products")}
          className="bg-[#1C4FA8] text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {t("editProduct")}
        </button>
      </div>

      <div className="space-y-5 mt-6">
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC]">
          <div className="h-72 flex items-center justify-center">
            {product.ProductImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.ProductImage}
                alt={product.productName}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <FiImage className="text-[#CBD5E1]" size={48} />
            )}
          </div>
        </div>

        <div className="border border-[#E2E8F0] rounded-xl p-5">
          <p className="text-[14px] font-semibold text-[#64748B] uppercase tracking-wider mb-4">
            {t("sectionDetails")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <Field label={t("fieldCategory")}>
              {product.category?.categoryName}
            </Field>
            <Field label={t("fieldSubcategory")}>
              {product.subcategory?.name}
            </Field>
            <Field label={t("fieldType")}>{product.type}</Field>
            <Field label={t("fieldPrice")}>
              {product.price != null ? `$${product.price}` : null}
            </Field>
            <Field label={t("fieldDiscount")}>
              {product.discount ? `${product.discount}%` : "—"}
            </Field>
            <Field label={t("fieldStock")}>{product.total_quantity}</Field>
            <Field label={t("fieldAvailable")}>
              {product.available_quantity}
            </Field>
            <Field label={t("fieldCreated")}>
              {product.created_at
                ? new Date(product.created_at).toLocaleDateString()
                : "—"}
            </Field>
            <Field label={t("fieldStatus")}>
              <span
                className={`inline-flex items-center gap-1.5 ${product.isActive ? "text-green-700" : "text-[#64748B]"
                  }`}
              >
                {product.isActive ? (
                  <FiCheckCircle size={14} />
                ) : (
                  <FiXCircle size={14} />
                )}
                {product.isActive ? t("statActive") : t("statInactive")}
              </span>
            </Field>
          </div>

          {product.description && (
            <div className="mt-5 pt-5 border-t border-[#F1F5F9]">
              <Field label={t("fieldDescription")}>
                {product.description}
              </Field>
            </div>
          )}
        </div>

        {/* Simulation layers */}
        <div className="border border-[#E2E8F0] rounded-xl p-5">
          {/* Parts and Available summary tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatTile label={t("statParts")} value={partCount} />
            <StatTile
              label={t("fieldAvailable")}
              value={product.available_quantity ?? 0}
              tone={product.available_quantity ? "default" : "amber"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
