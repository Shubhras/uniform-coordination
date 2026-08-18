"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  FiSave,
  FiFileText,
  FiGrid,
  FiMaximize2,
  FiUsers,
  FiScissors,
  FiLayers,
  FiDroplet,
  FiFeather,
  FiCompass,
  FiShoppingCart,
} from "react-icons/fi";

import {
  apiExportThemeDesignPdf,
  apiGetThemeDesignById,
  apiUpdateThemeDesign,
} from "@/services/SaveDesignService";
import { apiAddToCart } from "@/services/CartSummaryService";
import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import Spinner from "@/components/ui/Spinner";

const iconMap = {
  "Table Shape": FiGrid,
  "Table Scale": FiMaximize2,
  "Seating Capacity": FiUsers,
  Fabric: FiFeather,
  Color: FiDroplet,
  Style: FiScissors,
  Type: FiLayers,
};

const SpecCard = ({ title, value }) => {
  const Icon = iconMap[title] || FiCompass;
  return (
    <div className="border border-[#E8E0D9] rounded-xl px-4 py-3 bg-white hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-2 mb-1">
        {Icon && <Icon size={16} className="text-[#A0522D] mt-[2px]" />}
        <p className="text-xs text-gray-500">{title}</p>
      </div>
      <p className="text-sm font-semibold text-[#2C1810] truncate">{value}</p>
    </div>
  );
};

const ThemeDesignResultPage = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [themeDesignData, setThemeDesignData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const id = params?.id;

  const handleAddToCart = async () => {
    if (!session?.accessToken) {
      toast.push(
        <Notification title="Warning!" type="warning">
          Please login first
        </Notification>,
      );
      return;
    }
    try {
      setIsAddingToCart(true);
      const res = await apiAddToCart(session.accessToken, null, 1, id);
      if (res?.status) {
        toast.push(
          <Notification title="Success!" type="success">
            All theme products added to cart!
          </Notification>,
        );
        router.push("/cart-summary");
      } else {
        toast.push(
          <Notification title="Error!" type="danger">
            {res?.message || "Failed to add theme products to cart"}
          </Notification>,
        );
      }
    } catch (err) {
      console.error("Theme Cart Error:", err);
      toast.push(
        <Notification title="Error!" type="danger">
          Failed to add theme products to cart
        </Notification>,
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    const fetchThemeDesign = async () => {
      try {
        setLoading(true);
        const res = await apiGetThemeDesignById(id, session?.accessToken);
        if (res?.status && res?.data) {
          setThemeDesignData(res.data);
        } else {
          toast.push(
            <Notification title="Error!" type="danger">
              {res?.message || "Failed to load theme design details"}
            </Notification>,
          );
        }
      } catch (err) {
        toast.push(
          <Notification title="Error!" type="danger">
            Failed to fetch theme design details
          </Notification>,
        );
        console.error("Fetch Theme Design Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && session?.accessToken) {
      fetchThemeDesign();
    }
  }, [id, session?.accessToken]);

  const handleSaveDesign = async () => {
    if (!session?.accessToken) return;
    setIsSaving(true);

    const payload = {
      theme: themeDesignData?.theme_id,
      config_json: themeDesignData?.config_json,
      design_specifications: themeDesignData?.design_specifications,
      isActive: true,
    };

    try {
      await apiUpdateThemeDesign(id, payload, session.accessToken);
      toast.push(
        <Notification title="Success!" type="success">
          Theme design saved successfully
        </Notification>,
      );
    } catch (error) {
      console.error("Save Theme Design Error:", error);
      toast.push(
        <Notification title="Error!" type="danger">
          Failed to save theme design changes
        </Notification>,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (!session?.accessToken) {
      toast.push(
        <Notification title="Warning!" type="warning">
          Please login first
        </Notification>,
      );
      return;
    }

    try {
      const response = await apiExportThemeDesignPdf(id, session.accessToken);
      const pdfUrl = response?.pdf_url;
      if (!pdfUrl) {
        throw new Error("PDF URL not found in response");
      }
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Export Theme PDF Error:", error);
      toast.push(
        <Notification title="Error!" type="danger">
          Failed to export PDF spec sheet
        </Notification>,
      );
    }
  };

  return (
    <section className="w-full bg-[#FAF8F5] flex flex-col lg:flex-row px-6 lg:px-8 py-10 gap-10 mt-15">
      <div className="w-full mx-auto">
        {/* Main Glassmorphic Container */}
        <div className="bg-white/80 backdrop-blur-md border border-[#E8E0D9]/60 rounded-3xl p-6 md:p-10 shadow-xl shadow-[#8B5A3C]/5">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest text-[#A0522D] uppercase bg-[#A0522D]/10 px-3 py-1 rounded-full">
              Simulation Result
            </span>
            <h2 className="text-[#2C1810] text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
              Theme Design Summary
            </h2>
            <div className="w-24 h-[3px] bg-[#A0522D] mx-auto mt-4 rounded-full" />
            {themeDesignData?.category?.name && (
              <p className="text-[#8B5A3C] mt-3 text-sm font-semibold tracking-wide uppercase">
                Theme Type: {themeDesignData.category.name}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 gap-4">
              <Spinner size={40} customColorClass="text-[#A0522D]" />
              <p className="text-[#8B5A3C] text-sm animate-pulse">
                Loading simulation specifications...
              </p>
            </div>
          ) : !themeDesignData ? (
            <div className="py-24 text-center">
              <p className="text-gray-400 font-medium">
                No theme design details could be found.
              </p>
              <button
                onClick={() => router.push("/dashboards/uniform-3d-design")}
                className="mt-4 px-6 py-2 bg-[#A0522D] text-white rounded-lg text-sm hover:bg-[#8B4513] transition"
              >
                Back to Canvas
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
                {/* Left Section: 3D/2D Theme Design Preview Image */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
                  <div className="relative group flex justify-center items-center h-[380px] md:h-[480px] w-full bg-gradient-to-tr from-[#FAF8F5] to-white border border-[#E8E0D9]/80 rounded-2xl overflow-hidden p-6 shadow-inner">
                    <Image
                      src={
                        themeDesignData?.ThemeImage ||
                        "/img/table-form/full-venue.png"
                      }
                      alt="Theme Custom Preview"
                      width={480}
                      height={480}
                      className="object-contain w-full h-full drop-shadow-lg group-hover:scale-105 transition-transform duration-500 ease-out"
                      priority
                      unoptimized
                    />
                    <div className="absolute bottom-4 right-4 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-gray-500 font-medium border border-gray-200">
                      Live Simulation Render
                    </div>
                  </div>
                </div>

                {/* Right Section: Specifications & Detailed Options */}
                <div className="lg:col-span-7 flex flex-col h-full justify-between">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-[#2C1810] mb-2">
                        {themeDesignData.themeName}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm text-justify">
                        {themeDesignData?.description ||
                          "Experience table coordination redefined. Explore fully interactive layouts tailored seamlessly to your venue aesthetics."}
                      </p>
                    </div>

                    {/* Table Configurations Block */}
                    <div className="bg-[#FAF8F5] border border-[#E8E0D9]/50 rounded-2xl p-5 mb-6">
                      <h4 className="text-sm font-bold text-[#A0522D] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FiGrid size={16} /> Table Layout Configurations
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SpecCard
                          title="Table Shape"
                          value={
                            themeDesignData?.config_json?.table_shape ||
                            "Circle"
                          }
                        />
                        <SpecCard
                          title="Table Scale"
                          value={`${themeDesignData?.config_json?.table_scale || "300"} cm`}
                        />
                        <SpecCard
                          title="Seating Capacity"
                          value={`${themeDesignData?.config_json?.table_sitting || "6"} Seats`}
                        />
                      </div>
                    </div>

                    {/* Custom Specifications Category Block */}
                    <div className="bg-white border border-[#E8E0D9]/70 rounded-2xl shadow-sm overflow-hidden mb-8">
                      <div className="px-5 py-4 bg-gradient-to-r from-[#FAF8F5] to-white border-b border-[#E8E0D9]/70">
                        <h4 className="text-sm font-bold text-[#2C1810] uppercase tracking-wider">
                          Custom Setup Selection
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
                        {Object.entries(
                          themeDesignData?.design_specifications || {},
                        ).length > 0 ? (
                          Object.entries(
                            themeDesignData?.design_specifications || {},
                          ).map(([category, options]) => (
                            <div
                              key={category}
                              className="px-5 py-3 hover:bg-[#FAF8F5]/40 transition flex justify-between items-start gap-4"
                            >
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
                                {category}
                              </span>
                              <div className="text-right">
                                {typeof options === "object" ? (
                                  Object.entries(options).map(
                                    ([optName, optVal]) => (
                                      <span
                                        key={optName}
                                        className="inline-block bg-white border border-[#E8E0D9] text-[#2C1810] text-[11px] font-semibold px-2.5 py-1 rounded-md ml-1.5 shadow-sm"
                                      >
                                        {optName}: {optVal}
                                      </span>
                                    ),
                                  )
                                ) : (
                                  <span className="inline-block bg-white border border-[#E8E0D9] text-[#2C1810] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                                    {String(options)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center py-6">
                            <p className="text-sm text-gray-400 font-medium">
                              No items selected
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full mt-auto">
                    <button
                      className="
                                            h-[50px] flex-1
                                            flex items-center justify-center
                                            gap-2 text-sm font-semibold
                                            border border-[#E8E0D9]
                                            rounded-xl bg-white
                                            text-[#7B3C1D] hover:bg-[#FAF8F5]
                                            hover:border-[#A0522D]
                                            transition-all duration-300
                                        "
                      onClick={handleSaveDesign}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Spinner size={16} customColorClass="text-[#A0522D]" />
                      ) : (
                        <FiSave size={16} />
                      )}
                      <span>
                        {isSaving ? "Saving..." : "Save Theme Design"}
                      </span>
                    </button>

                    <button
                      className="
                                            h-[50px] flex-1
                                            flex items-center justify-center
                                            gap-2 text-sm font-semibold
                                            border border-[#E8E0D9]
                                            rounded-xl bg-white
                                            text-[#7B3C1D] hover:bg-[#FAF8F5]
                                            hover:border-[#A0522D]
                                            transition-all duration-300
                                        "
                      onClick={handleExportPdf}
                    >
                      <FiFileText size={16} />
                      <span>Export Spec Sheet</span>
                    </button>

                    <button
                      className="
                                            h-[50px] flex-1
                                            flex items-center justify-center
                                            gap-2 text-sm font-semibold
                                            bg-[#A0522D] hover:bg-[#8B4513]
                                            text-white rounded-xl shadow-lg shadow-[#A0522D]/10
                                            transition-all duration-300
                                            disabled:opacity-50
                                        "
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <Spinner size={16} customColorClass="text-white" />
                      ) : (
                        <FiShoppingCart size={16} />
                      )}
                      <span>
                        {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Included Products Block */}
              {themeDesignData?.products &&
                themeDesignData.products.length > 0 && (
                  <div className="mt-12 border-t border-[#E8E0D9]/60 pt-10">
                    <h3 className="text-xl font-bold text-[#2C1810] mb-6 flex items-center gap-2">
                      <FiLayers className="text-[#A0522D]" /> Included Products
                      in Theme Setup
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {themeDesignData.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-white border border-[#E8E0D9]/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="relative h-48 bg-gradient-to-b from-[#FAF8F5] to-white flex items-center justify-center p-4">
                              {prod.image ? (
                                <Image
                                  src={prod.image}
                                  alt={prod.title}
                                  width={180}
                                  height={180}
                                  className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
                                  unoptimized
                                />
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">
                                  No Image Available
                                </span>
                              )}
                              {prod.section_display && (
                                <span className="absolute top-3 left-3 bg-[#A0522D]/10 text-[#A0522D] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {prod.section_display}
                                </span>
                              )}
                            </div>
                            <div className="p-4">
                              <h4
                                className="font-bold text-sm text-[#2C1810] line-clamp-1 mb-1"
                                title={prod.title}
                              >
                                {prod.title}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                                {prod.description ||
                                  "Beautifully coordinated theme accent piece."}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">
                              Rental Price
                            </span>
                            <span className="font-bold text-[#A0522D] text-sm">
                              $
                              {prod.price
                                ? Number(prod.price).toFixed(2)
                                : "0.00"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ThemeDesignResultPage;
