"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  FiChevronRight,
  FiEye,
  FiLayers,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiTag,
  FiZoomIn,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useTranslations } from "next-intl";
import Spinner from "@/components/ui/Spinner";
import {
  apiGetSimulationOptions,
  apiGetSimulationStructure,
} from "@/services/SimulationService";
import { apiGetCategoryList } from "@/services/CategoryService";

const navItems = [
  { id: "table-shape", labelKey: "tableShape", icon: FiTag },
  { id: "categories", labelKey: "categories", icon: FiLayers },
];

const CircleTableIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="10" rx="10" ry="3.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M16 13.2V25" stroke="currentColor" strokeWidth="1.4" />
    <path d="M11 25H21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12.5 21H19.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const RectangleTableIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11L16 7L28 11L16 15L4 11Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M7 12.5L6 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M25 12.5L26 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M12 14L11 23.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M20 14L21 23.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const SquareTableIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L16 8.5L26 12L16 15.5L6 12Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M9 13.2L8.3 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M23 13.2L23.7 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const PreviewSimulation = () => {
  const t = useTranslations("simulationAssets.previewSimulation");

  const shapes = [
    { id: "circle", label: t("shapeCircle"), Icon: CircleTableIcon },
    { id: "rectangle", label: t("shapeRectangle"), Icon: RectangleTableIcon },
    { id: "square", label: t("shapeSquare"), Icon: SquareTableIcon },
  ];

  const DEFAULT_CATEGORIES = [
    { id: "Tablecloths", label: t("catTablecloths") },
    { id: "Chair Covers", label: t("catChairCovers") },
    { id: "Napkins", label: t("catNapkins") },
    { id: "Centerpieces", label: t("catCenterpieces") },
    { id: "Tableware", label: t("catTableware") },
    { id: "Additional Decor", label: t("catAdditionalDecor") },
  ];

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [categories, setCategories] = useState([]);
  const [activePanel, setActivePanel] = useState("table-shape");
  const [selectedShape, setSelectedShape] = useState("circle");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [options, setOptions] = useState({ fabrics: [], styles: [], colors: [], sizes: [] });
  const [structures, setStructures] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      if (!accessToken) return;
      try {
        const res = await apiGetCategoryList(accessToken, 1, 100);
        if (res?.status && res?.data && res.data.length > 0) {
          const formatted = res.data.map((cat) => ({
            id: cat.categoryName,
            label: cat.categoryName,
          }));
          setCategories(formatted);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error("Error loading categories", err);
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    loadCategories();
  }, [accessToken]);

  // Fetch simulation structures on mount
  useEffect(() => {
    const fetchStructures = async () => {
      if (!accessToken) return;
      try {
        const res = await apiGetSimulationStructure(accessToken);
        if (res?.status && res?.data) {
          setStructures(res.data);
        }
      } catch (err) {
        console.error("Error fetching structures", err);
      }
    };
    fetchStructures();
  }, [accessToken]);

  // Fetch options when category or shape changes
  useEffect(() => {
    const fetchOptions = async () => {
      if (!accessToken || !selectedCategory) return;
      try {
        setLoadingOptions(true);
        const res = await apiGetSimulationOptions(accessToken, selectedCategory, selectedShape);
        if (res?.status && res?.data) {
          setOptions(res.data);
          
          // Set initial selections
          if (res.data.fabrics?.length > 0) {
            setSelectedFabric(res.data.fabrics[0].id);
          }
          if (res.data.styles?.length > 0) {
            setSelectedStyle(res.data.styles[0].id);
          }
          if (res.data.colors?.length > 0) {
            setSelectedColor(res.data.colors[0].id);
          }
          if (res.data.sizes?.length > 0) {
            setSelectedSize(res.data.sizes[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching options", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [accessToken, selectedCategory, selectedShape]);

  // Extract and sort enabled attributes for the selected category
  const enabledAttributes = useMemo(() => {
    if (!selectedCategory || !structures[selectedCategory]) return [];
    
    return structures[selectedCategory]
      .filter((item) => item.enabled)
      .sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
  }, [selectedCategory, structures]);

  const renderAttributeSection = (attrName) => {
    const normalizedName = attrName.toLowerCase();
    
    // 1. Fabric/Material
    if (normalizedName.includes("fabric") || normalizedName.includes("material")) {
      return (
        <div className="mt-4" key={attrName}>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#6A5950]">
            <span>{attrName}</span>
            <span className="text-[#C27748]">*</span>
          </div>
          {options.fabrics.length > 0 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {options.fabrics.map((fabric) => (
                <button
                  key={fabric.id}
                  type="button"
                  onClick={() => setSelectedFabric(fabric.id)}
                  className={`rounded-[6px] border p-1 text-left transition ${
                    selectedFabric === fabric.id
                      ? "border-[#D58F67] bg-white shadow-sm"
                      : "border-[#E7D8CE] bg-white hover:border-[#D58F67]"
                  }`}
                >
                  <div className="relative h-10 overflow-hidden rounded-[4px]">
                    {fabric.image ? (
                      <Image src={fabric.image} alt={fabric.label} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#FAF6F3]" />
                    )}
                  </div>
                  <p className="mt-1 text-[7px] text-[#6A5950] font-medium truncate">{fabric.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[9px] text-gray-400 italic">No fabrics available</p>
          )}
        </div>
      );
    }

    // 2. Style/Fit Type/Fold Style/Closure
    if (
      normalizedName.includes("style") || 
      normalizedName.includes("fit") || 
      normalizedName.includes("fold") ||
      normalizedName.includes("closure")
    ) {
      return (
        <div className="mt-4" key={attrName}>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#6A5950]">
            <span>{attrName}</span>
            <span className="text-[#C27748]">*</span>
          </div>
          {options.styles.length > 0 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {options.styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`rounded-[6px] border p-1 text-left transition ${
                    selectedStyle === style.id
                      ? "border-[#D58F67] bg-white shadow-sm"
                      : "border-[#E7D8CE] bg-white hover:border-[#D58F67]"
                  }`}
                >
                  <div className="relative h-10 overflow-hidden rounded-[4px] bg-[#FAF6F3]">
                    <Image
                      src={style.image || "/img/others/table-image1.png"}
                      alt={style.label}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="mt-1 text-[7px] text-[#6A5950] font-medium truncate">{style.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[9px] text-gray-400 italic">No style options available</p>
          )}
        </div>
      );
    }

    // 3. Color
    if (normalizedName.includes("color")) {
      return (
        <div className="mt-4" key={attrName}>
          <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
          {options.colors.length > 0 ? (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {options.colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={`rounded-[6px] border p-1 text-left transition ${
                    selectedColor === color.id
                      ? "border-[#D58F67] bg-white shadow-sm"
                      : "border-[#E7D8CE] bg-white hover:border-[#D58F67]"
                  }`}
                >
                  <div className="relative h-8 overflow-hidden rounded-[4px] flex items-center justify-center bg-[#FAF6F3]">
                    {color.image ? (
                      <Image src={color.image} alt={color.label} fill className="object-cover" />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: color.colorCode || "#fff" }}
                      />
                    )}
                  </div>
                  <p className="mt-1 text-[7px] text-[#6A5950] font-medium truncate">{color.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[9px] text-gray-400 italic">No colors available</p>
          )}
        </div>
      );
    }

    // 4. Size/Height
    if (normalizedName.includes("size") || normalizedName.includes("height")) {
      return (
        <div className="mt-4" key={attrName}>
          <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
          {options.sizes.length > 0 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {options.sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSize(size.id)}
                  className={`rounded-[6px] border p-1 text-center py-2 transition text-[9px] font-semibold ${
                    selectedSize === size.id
                      ? "border-[#D58F67] bg-white text-[#A65D33]"
                      : "border-[#E7D8CE] bg-white text-[#6A5950] hover:border-[#D58F67]"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[9px] text-gray-400 italic">No sizes available</p>
          )}
        </div>
      );
    }

    // Fallback/Generic attribute renderer (simple grid buttons)
    return (
      <div className="mt-4" key={attrName}>
        <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-[6px] border p-2 text-center text-[9px] font-semibold bg-white border-[#D58F67] text-[#A65D33]"
          >
            {t("defaultOption")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-5">
      <h2 className="text-[16px] font-semibold text-[#2A211D]">
        {t("title")}
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        {t("sustitle")}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[72px_188px_minmax(0,1fr)]">
        <div className="flex gap-2 lg:flex-col">
          {navItems.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActivePanel(id);
                if (id === "categories") {
                  setSelectedCategory("");
                }
              }}
              className={`relative flex h-[100px] w-[60px] flex-col items-center justify-center gap-2 rounded-[10px] border border-[#EFE3DA] bg-white px-2 text-center shadow-[0_10px_22px_rgba(188,142,110,0.10)] transition ${
                activePanel === id
                  ? "border-r-[3px] border-r-[#C97946]"
                  : "border-r-[3px] border-r-transparent hover:bg-gray-50"
              }`}
            >
              <Icon
                size={22}
                className={activePanel === id ? "text-[#B56735]" : "text-[#8A7F76]"}
              />
              <span
                className={`text-[8px] font-medium leading-[1.15] ${
                  activePanel === id ? "text-[#3F3A37]" : "text-[#8A7F76]"
                }`}
              >
                {t(labelKey)}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-[8px] border border-[#F0DED3] bg-[#FFF9F6] p-3">
          {activePanel === "table-shape" ? (
            <>
              <h3 className="text-[12px] font-medium text-[#352A24]">
                {t("tableShape")}
              </h3>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {shapes.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedShape(id)}
                    className={`flex flex-col items-center gap-1.5 rounded-[6px] border px-2 py-2.5 text-[9px] transition ${
                      selectedShape === id
                        ? "border-transparent bg-[#F0DECE] text-[#A65D33]"
                        : "border-[#E7D8CE] bg-white text-[#7F736B] hover:border-[#D58F67]"
                    }`}
                  >
                    <Icon size={24} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-[10px] text-[#7F736B]">
                  {t("tableScale")}
                </p>
                <div className="mt-2 h-[4px] rounded-full bg-[#DDD4CF]">
                  <div className="h-[4px] w-[38%] rounded-full bg-[#C67747]" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] text-[#7F736B]">
                  {t("tableSitting")}
                </p>
                <div className="flex items-center gap-2 rounded-[4px] border border-[#E7D8CE] bg-white px-2 py-1 text-[10px] text-[#7F736B]">
                  <button type="button">
                    <FiMinus size={10} />
                  </button>
                  <span>2</span>
                  <button type="button">
                    <FiChevronRight size={10} />
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[6px] border border-[#E8B38F] bg-white px-3 py-3 text-[9px] leading-5 text-[#8D6D5A]">
                {t("tip")}
                <br />
                {t("tipText")}
              </div>
            </>
          ) : !selectedCategory ? (
            <>
              <h3 className="text-[12px] font-medium text-[#352A24]">
                {t("categoriesInventory")}
              </h3>

              <div className="mt-4 space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex w-full items-center justify-between rounded-[6px] border border-[#EEE3DB] bg-white px-3 py-2 text-[11px] text-[#4E423B] transition hover:border-[#D58F67] hover:text-[#A65D33]"
                  >
                    <span>{category.label}</span>
                    <FiChevronRight size={14} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="flex w-full items-center justify-between rounded-[6px] bg-[#A95E31] px-3 py-2 text-[11px] font-medium text-white transition hover:bg-[#904f27]"
              >
                <span>{selectedCategory}</span>
                <FiChevronRight size={14} />
              </button>

              {loadingOptions ? (
                <div className="py-12 flex justify-center">
                  <Spinner size={26} customColorClass="text-[#B56735]" />
                </div>
              ) : enabledAttributes.length > 0 ? (
                <div className="mt-2 max-h-[400px] overflow-y-auto pr-1">
                  {enabledAttributes.map((attr) => renderAttributeSection(attr.attribute))}
                </div>
              ) : (
                <p className="mt-6 text-[10px] text-center text-gray-500 italic">
                  {t("noAttributesEnabled")}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative flex min-h-[332px] w-full items-center justify-center overflow-hidden rounded-[18px] bg-white border border-[#EFE3DA]">
            {activePanel === "table-shape" ? (
              <>
                <div className="absolute left-[18%] top-[18%] z-10 w-[74px] rounded-[10px] border border-[#F1E4DA] bg-white p-2 shadow-[0_10px_24px_rgba(188,142,110,0.12)]">
                  <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-[8px]">
                    <Image
                      src="/img/others/table-image1.png"
                      alt={t("tablePreviewAlt")}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-[#4A3D36]">155k</p>
                  <p className="mt-1 text-[8px] text-[#B5A59A]">{t("totalOrder")}</p>
                  <p className="mt-2 inline-flex rounded-full bg-[#F7F2EE] px-1.5 py-0.5 text-[7px] text-[#9B8D82]">
                    {t("lastMonths")}
                  </p>
                </div>

                <div className="relative h-[250px] w-full max-w-[420px]">
                  <Image
                    src="/img/others/table-image1.png"
                    alt={t("simulationPreviewAlt")}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="absolute bottom-[62px] right-[13%] z-10 rounded-[10px] border border-[#F1E4DA] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(188,142,110,0.12)]">
                  <p className="text-[11px] font-semibold text-[#4A3D36]">8,458</p>
                  <p className="mt-1 text-[8px] text-[#B5A59A]">{t("newCustomers")}</p>
                </div>
              </>
            ) : (
              <div className="relative h-[300px] w-full max-w-[430px] overflow-hidden rounded-[22px] bg-[#FAF7F4]">
                <Image
                  src="/img/others/table-image.png"
                  alt={t("inventoryPreviewAlt")}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex w-full max-w-[320px] items-center justify-between rounded-[10px] border border-[#F0E4DB] bg-white px-4 py-3 text-[#4F433C] shadow-[0_10px_24px_rgba(188,142,110,0.12)]">
            <button type="button" className="rounded-[4px] bg-[#B56735] p-2 text-white transition hover:bg-[#a25628]">
              <FiTag size={14} />
            </button>
            <button type="button" className="hover:text-[#B56735] transition">
              <FiEye size={14} />
            </button>
            <button type="button" className="hover:text-[#B56735] transition">
              <FiRotateCcw size={14} />
            </button>
            <button type="button" className="hover:text-[#B56735] transition">
              <FiRotateCw size={14} />
            </button>
            <button type="button" className="hover:text-[#B56735] transition">
              <FiZoomIn size={14} />
            </button>
            <span className="text-[12px] font-medium">100%</span>
            <button type="button" className="text-[12px] font-semibold hover:text-[#B56735] transition">
              3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSimulation;
