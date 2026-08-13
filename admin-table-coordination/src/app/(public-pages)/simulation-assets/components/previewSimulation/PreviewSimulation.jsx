"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  FiChevronRight,
  FiEye,
  FiLayers,
  FiMinus,
  FiPlus,
  FiRotateCcw,
  FiRotateCw,
  FiTag,
  FiZoomIn,
  FiBox,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useTranslations } from "next-intl";
import Spinner from "@/components/ui/Spinner";
import {
  apiGetSimulationOptions,
  apiGetSimulationStructure,
} from "@/services/SimulationService";
import { apiGetCategoryList } from "@/services/CategoryService";
import { apiGetProductList } from "@/services/ProductService";

const navItems = [
  { id: "table-shape", labelKey: "tableShape", label: "Table Shape", icon: FiTag },
  { id: "categories", labelKey: "categories", label: "Categories", icon: FiLayers },
  { id: "simulation-products", labelKey: "simulationProducts", label: "Simulation Products", icon: FiBox },
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

const OvalTableIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="12" rx="11" ry="5.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 13.5L6.5 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M25 13.5L25.5 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const getShapeIcon = (label = "") => {
  const l = (label || "").toLowerCase();
  if (l.includes("oval") || l.includes("ellipse")) return OvalTableIcon;
  if (l.includes("rect")) return RectangleTableIcon;
  if (l.includes("square")) return SquareTableIcon;
  return CircleTableIcon;
};

const PreviewSimulation = () => {
  const t = useTranslations("simulationAssets.previewSimulation");

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
  const [tableScale, setTableScale] = useState(100);
  const [tableSitting, setTableSitting] = useState(2);

  const [options, setOptions] = useState({ fabrics: [], styles: [], colors: [], sizes: [], closures: [], patterns: [], table_shapes: [] });
  const [structures, setStructures] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedClosure, setSelectedClosure] = useState("");
  const [selectedPattern, setSelectedPattern] = useState("");

  const [simulationProducts, setSimulationProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
      if (!accessToken) return;
      try {
        setLoadingOptions(true);
        const res = await apiGetSimulationOptions(accessToken, selectedCategory, selectedShape);
        if (res?.status && res?.data) {
          setOptions(res.data);
          
          if (res.data.fabrics?.length > 0) setSelectedFabric(res.data.fabrics[0].id);
          if (res.data.styles?.length > 0) setSelectedStyle(res.data.styles[0].id);
          if (res.data.colors?.length > 0) setSelectedColor(res.data.colors[0].id);
          if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[0].id);
          if (res.data.closures?.length > 0) setSelectedClosure(res.data.closures[0].id);
          if (res.data.patterns?.length > 0) setSelectedPattern(res.data.patterns[0].id);
        }
      } catch (err) {
        console.error("Error fetching options", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [accessToken, selectedCategory, selectedShape]);

  // Fetch simulation products when active panel is simulation-products
  useEffect(() => {
    const fetchSimProducts = async () => {
      if (!accessToken || activePanel !== "simulation-products") return;
      try {
        setLoadingProducts(true);
        const res = await apiGetProductList(accessToken, 1, 50, "table", "&showInSimulation=true");
        if (res?.status && res?.data) {
          const filtered = res.data.filter(
            (p) => p.show !== false && p.show_in_simulation !== false
          );
          setSimulationProducts(filtered);
        }
      } catch (err) {
        console.error("Error fetching simulation products", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchSimProducts();
  }, [accessToken, activePanel]);

  // Admin-created table shapes
  const adminTableShapes = useMemo(() => {
    if (options.table_shapes && options.table_shapes.length > 0) {
      return options.table_shapes;
    }
    return [
      { id: "circle", label: t("shapeCircle") || "Circle", image: null, Icon: CircleTableIcon },
      { id: "rectangle", label: t("shapeRectangle") || "Rectangle", image: null, Icon: RectangleTableIcon },
      { id: "square", label: t("shapeSquare") || "Square", image: null, Icon: SquareTableIcon },
    ];
  }, [options.table_shapes, t]);

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
          {options.fabrics && options.fabrics.length > 0 ? (
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
                      <Image src={fabric.image} alt={fabric.label} fill className="object-cover" unoptimized />
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

    // 2. Closure
    if (normalizedName.includes("closure")) {
      return (
        <div className="mt-4" key={attrName}>
          <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
          {options.closures && options.closures.length > 0 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {options.closures.map((cl) => (
                <button
                  key={cl.id}
                  type="button"
                  onClick={() => setSelectedClosure(cl.id)}
                  className={`rounded-[6px] border p-1 text-left transition ${
                    selectedClosure === cl.id
                      ? "border-[#D58F67] bg-white shadow-sm"
                      : "border-[#E7D8CE] bg-white hover:border-[#D58F67]"
                  }`}
                >
                  <div className="relative h-10 overflow-hidden rounded-[4px] bg-[#FAF6F3]">
                    {cl.image ? (
                      <Image
                        src={cl.image}
                        alt={cl.label}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-[8px] font-medium text-[#6A5950] text-center">
                        {cl.label}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-[7px] text-[#6A5950] font-medium truncate">{cl.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[9px] text-gray-400 italic">No closures available</p>
          )}
        </div>
      );
    }

    // 3. Pattern
    if (normalizedName.includes("pattern")) {
      return (
        <div className="mt-4" key={attrName}>
          <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
          {options.patterns && options.patterns.length > 0 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {options.patterns.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setSelectedPattern(pt.id)}
                  className={`rounded-[6px] border p-1 text-left transition ${
                    selectedPattern === pt.id
                      ? "border-[#D58F67] bg-white shadow-sm"
                      : "border-[#E7D8CE] bg-white hover:border-[#D58F67]"
                  }`}
                >
                  <div className="relative h-10 overflow-hidden rounded-[4px] bg-[#FAF6F3]">
                    {pt.image ? (
                      <Image
                        src={pt.image}
                        alt={pt.label}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-[8px] font-medium text-[#6A5950] text-center">
                        {pt.label}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-[7px] text-[#6A5950] font-medium truncate">{pt.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[9px] text-gray-400 italic">No patterns available</p>
          )}
        </div>
      );
    }

    // 4. Style/Fit Type/Fold Style
    if (
      normalizedName.includes("style") || 
      normalizedName.includes("fit") || 
      normalizedName.includes("fold")
    ) {
      return (
        <div className="mt-4" key={attrName}>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#6A5950]">
            <span>{attrName}</span>
            <span className="text-[#C27748]">*</span>
          </div>
          {options.styles && options.styles.length > 0 ? (
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
                    {style.image ? (
                      <Image
                        src={style.image}
                        alt={style.label}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-[8px] font-medium text-[#6A5950] text-center">
                        {style.label}
                      </div>
                    )}
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

    // 5. Color - render colorCode hex swatch only, no images
    if (normalizedName.includes("color")) {
      return (
        <div className="mt-4" key={attrName}>
          <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
          {options.colors && options.colors.length > 0 ? (
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
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.colorCode || "#ffffff" }}
                    />
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

    // 6. Size/Height
    if (normalizedName.includes("size") || normalizedName.includes("height")) {
      return (
        <div className="mt-4" key={attrName}>
          <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
          {options.sizes && options.sizes.length > 0 ? (
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

    // 7. Table Shape
    if (normalizedName.includes("shape")) {
      return (
        <div className="mt-4" key={attrName}>
          <p className="text-[10px] font-semibold text-[#6A5950]">{attrName}</p>
          {adminTableShapes && adminTableShapes.length > 0 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {adminTableShapes.map((ts) => (
                <button
                  key={ts.id}
                  type="button"
                  onClick={() => setSelectedShape(ts.id)}
                  className={`rounded-[6px] border p-1 text-left transition ${
                    selectedShape === ts.id
                      ? "border-[#D58F67] bg-white shadow-sm"
                      : "border-[#E7D8CE] bg-white hover:border-[#D58F67]"
                  }`}
                >
                  <div className="relative h-10 overflow-hidden rounded-[4px] bg-[#FAF6F3] flex items-center justify-center">
                    {ts.image ? (
                      <Image src={ts.image} alt={ts.label} fill className="object-contain p-1" unoptimized />
                    ) : ts.Icon ? (
                      <ts.Icon size={20} />
                    ) : (
                      <span className="text-[8px] font-medium text-[#6A5950]">{ts.label}</span>
                    )}
                  </div>
                  <p className="mt-1 text-[7px] text-[#6A5950] font-medium truncate">{ts.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[9px] text-gray-400 italic">No table shapes available</p>
          )}
        </div>
      );
    }

    // Fallback/Generic attribute renderer
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

      <div className="mt-5 grid gap-4 lg:grid-cols-[72px_260px_minmax(0,1fr)]">
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
                {id === "simulation-products" ? "Simulation Products" : t(labelKey)}
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
                {adminTableShapes.map((shape) => {
                  const isSelected = selectedShape === shape.id || selectedShape === shape.label;
                  const ShapeIcon = shape.Icon || getShapeIcon(shape.label);
                  return (
                    <button
                      key={shape.id || shape.label}
                      type="button"
                      onClick={() => setSelectedShape(shape.id || shape.label)}
                      className={`flex flex-col items-center gap-1.5 rounded-[6px] border px-2 py-2.5 text-[9px] transition ${
                        isSelected
                          ? "border-transparent bg-[#F0DECE] text-[#A65D33] font-semibold shadow-sm"
                          : "border-[#E7D8CE] bg-white text-[#7F736B] hover:border-[#D58F67]"
                      }`}
                    >
                      <div className="relative h-6 w-6 flex items-center justify-center overflow-hidden">
                        {shape.image ? (
                          <Image src={shape.image} alt={shape.label} fill className="object-contain" unoptimized />
                        ) : (
                          <ShapeIcon size={24} />
                        )}
                      </div>
                      <span className="truncate max-w-full">{shape.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] text-[#7F736B]">
                  <span>{t("tableScale")}</span>
                  <span className="font-semibold text-[#A65D33]">{tableScale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={tableScale}
                  onChange={(e) => setTableScale(Number(e.target.value))}
                  className="mt-2 w-full h-1.5 rounded-full bg-[#DDD4CF] appearance-none cursor-pointer accent-[#C67747]"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] text-[#7F736B]">
                  {t("tableSitting")}
                </p>
                <div className="flex items-center gap-2 rounded-[4px] border border-[#E7D8CE] bg-white px-2.5 py-1 text-[10px] text-[#7F736B]">
                  <button
                    type="button"
                    onClick={() => setTableSitting((prev) => Math.max(1, prev - 1))}
                    className="hover:text-[#A65D33] transition p-0.5"
                  >
                    <FiMinus size={10} />
                  </button>
                  <span className="font-semibold text-[#352A24] min-w-[14px] text-center">{tableSitting}</span>
                  <button
                    type="button"
                    onClick={() => setTableSitting((prev) => prev + 1)}
                    className="hover:text-[#A65D33] transition p-0.5"
                  >
                    <FiPlus size={10} />
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[6px] border border-[#E8B38F] bg-white px-3 py-3 text-[9px] leading-5 text-[#8D6D5A]">
                {t("tip")}
                <br />
                {t("tipText")}
              </div>
            </>
          ) : activePanel === "categories" ? (
            !selectedCategory ? (
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
                  <div className="mt-2 max-h-[400px] overflow-y-auto pr-2">
                    {enabledAttributes.map((attr) => renderAttributeSection(attr.attribute))}
                  </div>
                ) : (
                  <p className="mt-6 text-[10px] text-center text-gray-500 italic">
                    {t("noAttributesEnabled")}
                  </p>
                )}
              </>
            )
          ) : (
            <>
              <h3 className="text-[12px] font-medium text-[#352A24]">
                Simulation Products
              </h3>

              {loadingProducts ? (
                <div className="py-12 flex justify-center">
                  <Spinner size={26} customColorClass="text-[#B56735]" />
                </div>
              ) : simulationProducts.length > 0 ? (
                <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {simulationProducts.map((prod) => {
                    const isSelected = selectedProduct?.id === prod.id;
                    const prodImage = prod.ProductImage || prod.productImage || prod.profile_image || prod.image || null;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setSelectedProduct(prod)}
                        className={`flex w-full items-center gap-2.5 rounded-[6px] border p-2 text-left transition ${
                          isSelected
                            ? "border-[#D58F67] bg-white shadow-sm ring-1 ring-[#D58F67]"
                            : "border-[#EEE3DB] bg-white hover:border-[#D58F67]"
                        }`}
                      >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[4px] bg-[#FAF6F3] flex items-center justify-center">
                          {prodImage ? (
                            <Image
                              src={prodImage}
                              alt={prod.productName || "Product"}
                              fill
                              className="object-contain p-0.5"
                              unoptimized
                            />
                          ) : (
                            <span className="text-[11px] font-bold text-[#B56735]">
                              {prod.productName ? prod.productName.charAt(0).toUpperCase() : "P"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold text-[#4E423B] truncate">
                            {prod.productName}
                          </p>
                          <p className="text-[8px] text-[#B29D8C] truncate">
                            {prod.category?.categoryName || prod.categoryName || "General"}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-medium text-emerald-600">
                          Simulation
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-6 text-[10px] text-center text-gray-500 italic">
                  No products currently marked for simulation.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative flex min-h-[332px] w-full items-center justify-center overflow-hidden rounded-[18px] bg-white border border-[#EFE3DA]">
            {activePanel === "table-shape" ? (
              <div className="relative flex flex-col items-center justify-center h-full w-full p-6 text-center">
                <div
                  className="relative flex flex-col items-center justify-center p-8 rounded-[16px] bg-[#FAF6F3] border border-[#F1E4DA] transition-transform duration-200 shadow-sm min-w-[220px] min-h-[180px]"
                  style={{ transform: `scale(${tableScale / 100})` }}
                >
                  <div className="relative h-16 w-16 mb-3 flex items-center justify-center text-[#B56735]">
                    {(() => {
                      const activeObj = adminTableShapes.find(
                        (s) => s.id === selectedShape || s.label === selectedShape
                      ) || adminTableShapes[0];

                      if (activeObj?.image) {
                        return (
                          <Image
                            src={activeObj.image}
                            alt={activeObj.label}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        );
                      }
                      const ActiveIcon = activeObj?.Icon || getShapeIcon(activeObj?.label);
                      return <ActiveIcon size={56} />;
                    })()}
                  </div>

                  <p className="text-[13px] font-bold text-[#4A3D36]">
                    {(
                      adminTableShapes.find(
                        (s) => s.id === selectedShape || s.label === selectedShape
                      ) || adminTableShapes[0]
                    )?.label || "Table Shape"}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F7F2EE] px-2.5 py-0.5 text-[9px] font-medium text-[#9B8D82]">
                    {tableSitting} Sitting Persons
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 rounded-[10px] border border-[#F1E4DA] bg-white px-3 py-1.5 shadow-sm text-right">
                  <p className="text-[10px] font-semibold text-[#4A3D36]">Scale: {tableScale}%</p>
                  <p className="text-[8px] text-[#B5A59A]">Sitting: {tableSitting}</p>
                </div>
              </div>
            ) : (
              <div className="relative h-[300px] w-full max-w-[430px] overflow-hidden rounded-[22px] bg-[#FAF7F4] flex items-center justify-center">
                {selectedProduct?.ProductImage || selectedProduct?.productImage || selectedProduct?.profile_image || selectedProduct?.image ? (
                  <Image
                    src={selectedProduct.ProductImage || selectedProduct.productImage || selectedProduct.profile_image || selectedProduct.image}
                    alt={selectedProduct?.productName || t("inventoryPreviewAlt")}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#8D6D5A]">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[22px] font-bold text-[#B56735] shadow-sm mb-2">
                      {selectedProduct?.productName ? selectedProduct.productName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <p className="text-[12px] font-semibold text-[#4A3D36]">
                      {selectedProduct?.productName || "Simulation Product"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#B29D8C]">
                      {selectedProduct?.category?.categoryName || selectedProduct?.categoryName || "Selected Item"}
                    </p>
                  </div>
                )}
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
