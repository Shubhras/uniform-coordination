"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiImage,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiGetProductById } from "@/services/ProductService";
import { apiGetSimulationProductLayers } from "@/services/SimulationAssetService";

/*
 * Product detail page, reached from Simulation Assets → Product Visibility.
 *
 * Two sources, on purpose:
 *   product/get/<id>/                  — the catalogue record
 *   simulation/product/<id>/layers/    — the layer stack the customer would render
 *
 * The layer call is the customer-facing endpoint, so what is shown here is what a
 * shopper would actually receive. It answers 404 when the product is hidden from the
 * simulation, which is treated as "no layers" rather than an error.
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
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [product, setProduct] = useState(null);
  const [layers, setLayers] = useState([]);
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken || !id) {
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

      // Separate try: a hidden product answers 404 here, which is expected and
      // must not blank out the page.
      try {
        const layerRes = await apiGetSimulationProductLayers(accessToken, id);
        if (layerRes?.status) {
          setLayers(layerRes.data?.layers || []);
          setMissing(layerRes.data?.parts_without_image || []);
        }
      } catch {
        setLayers([]);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      notify(t("errorTitle"), "danger", t("loadFailed"));
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [accessToken, id, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-xl animate-pulse" />
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
            className="w-10 h-10 bg-white rounded-lg shadow-sm border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC]"
          >
            <FiArrowLeft className="text-[#1C2C56]" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Left: image + fields */}
        <div className="lg:col-span-2 space-y-5">
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
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
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
                  className={`inline-flex items-center gap-1.5 ${
                    product.isActive ? "text-green-700" : "text-[#64748B]"
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
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
              {t("sectionLayers")}
            </p>

            {layers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#1C2C56]">{t("noLayers")}</p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  {t("noLayersHint")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Top of stack first, matching the Layer Order panel. */}
                {[...layers].reverse().map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center gap-3 border border-[#E2E8F0] rounded-lg p-3"
                  >
                    <div className="w-12 h-12 rounded bg-[#F1F5F9] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {layer.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={layer.image}
                          alt={layer.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FiImage className="text-[#CBD5E1]" size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#1C2C56] truncate">
                        {layer.name}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">
                        z {layer.z_index} · ({layer.offset_x}, {layer.offset_y})
                        {layer.fabric ? ` · ${layer.fabric}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {missing.length > 0 && (
              <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <FiAlertTriangle
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                  size={14}
                />
                <p className="text-xs text-amber-900">
                  {t("partsWithoutImage", { count: missing.length })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: summary */}
        <div className="border border-[#E2E8F0] rounded-xl p-5 h-fit">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
            {t("sectionSummary")}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label={t("statLayers")} value={layers.length} tone="green" />
            <StatTile label={t("statParts")} value={partCount} />
            <StatTile
              label={t("fieldStock")}
              value={product.total_quantity ?? 0}
            />
            <StatTile
              label={t("fieldAvailable")}
              value={product.available_quantity ?? 0}
              tone={product.available_quantity ? "default" : "amber"}
            />
          </div>

          <div className="mt-5 pt-5 border-t border-[#F1F5F9] space-y-4">
            <Field label={t("fieldSimulation")}>
              <span
                className={`inline-flex items-center gap-1.5 ${
                  product.show_in_simulation
                    ? "text-green-700"
                    : "text-[#64748B]"
                }`}
              >
                {product.show_in_simulation ? (
                  <FiCheckCircle size={14} />
                ) : (
                  <FiXCircle size={14} />
                )}
                {product.show_in_simulation ? t("statVisible") : t("statHidden")}
              </span>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
