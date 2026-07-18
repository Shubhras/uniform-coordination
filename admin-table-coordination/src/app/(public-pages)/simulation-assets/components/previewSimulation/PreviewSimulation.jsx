"use client";

import { useMemo, useState } from "react";
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

const navItems = [
  { id: "table-shape", label: "Table Shape", icon: FiTag },
  { id: "categories", label: "Categories", icon: FiLayers },
];

// Simple line-art table icons to match the Figma reference
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

const shapes = [
  { id: "circle", label: "Circle", Icon: CircleTableIcon },
  { id: "rectangle", label: "Rectangle", Icon: RectangleTableIcon },
  { id: "square", label: "Square", Icon: SquareTableIcon },
];

const inventoryCategories = [
  { id: "Tablecloths", label: "Tablecloths" },
  { id: "Napkins", label: "Napkins" },
  { id: "Chair Covers", label: "Chair Covers" },
  { id: "Centre Pieces", label: "Centre Pieces" },
  { id: "Tableware", label: "Tableware" },
  { id: "Additional Decor", label: "Additional Decor" },
];

const categoryData = {
  Tablecloths: {
    fabrics: [
      { id: "crushed-velvet", label: "Crushed Velvet", image: "/img/top-left-image/fabric/image 72.png" },
      { id: "damask-linen", label: "Damask Linen", image: "/img/top-left-image/fabric/image 73.png" },
      { id: "gingham-cotton", label: "Gingham Cotton", image: "/img/top-left-image/fabric/image 74.png" },
      { id: "raw-silk-dupioni", label: "Raw Silk Dupioni", image: "/img/top-left-image/fabric/image 75.png" },
    ],
    styles: [
      { id: "round", label: "Round", image: "/img/others/table-image1.png" },
      { id: "square", label: "Square", image: "/img/others/table-image1.png" },
      { id: "rectangle", label: "Rectangle", image: "/img/others/table-image1.png" },
      { id: "oval", label: "Oval", image: "/img/others/table-image1.png" },
    ],
    colors: [
      { id: "white", label: "White", image: "/img/top-left-image/fabric/image 76.png" },
      { id: "ivory", label: "Ivory", image: "/img/top-left-image/fabric/image 77.png" },
      { id: "beige", label: "Beige", image: "/img/top-left-image/fabric/image 78.png" },
      { id: "taupe", label: "Taupe", image: "/img/top-left-image/fabric/image 79.png" },
      { id: "blush", label: "Blush", image: "/img/top-left-image/fabric/image 80.png" },
      { id: "dusty", label: "Dusty", image: "/img/top-left-image/fabric/image 81.png" },
      { id: "mauve", label: "Mauve", image: "/img/top-left-image/fabric/image 82.png" },
      { id: "burgundy", label: "Burgundy", image: "/img/top-left-image/fabric/image 83.png" },
      { id: "blush-2", label: "Blush", image: "/img/top-left-image/fabric/image 80.png" },
      { id: "dusty-2", label: "Dusty", image: "/img/top-left-image/fabric/image 81.png" },
      { id: "burgundy-2", label: "Burgundy", image: "/img/top-left-image/fabric/image 83.png" },
      { id: "eggplant", label: "Eggplant", image: "/img/top-left-image/fabric/image 87.png" },
    ],
  },
};

const PreviewSimulation = () => {
  const [activePanel, setActivePanel] = useState("table-shape");
  const [selectedShape, setSelectedShape] = useState("circle");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("damask-linen");
  const [selectedStyle, setSelectedStyle] = useState("round");
  const [selectedColor, setSelectedColor] = useState("ivory");

  const activeCategoryData = useMemo(
    () => categoryData[selectedCategory] ?? null,
    [selectedCategory]
  );

  return (
    <div className="mt-5">
      <h2 className="text-[16px] font-semibold text-[#2A211D]">
        Preview Simulation
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Choose which inventory items will be available in the simulation
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[72px_188px_minmax(0,1fr)]">
        <div className="flex gap-2 lg:flex-col">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActivePanel(id);
                if (id === "categories") {
                  setSelectedCategory("");
                }
              }}
              className={`relative flex h-[100px] w-[60px] flex-col items-center justify-center gap-2 rounded-[10px] border border-[#EFE3DA] bg-white px-2 text-center shadow-[0_10px_22px_rgba(188,142,110,0.10)] ${
                activePanel === id
                  ? "border-r-[3px] border-r-[#C97946]"
                  : "border-r-[3px] border-r-transparent"
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
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-[8px] border border-[#F0DED3] bg-[#FFF9F6] p-3">
          {activePanel === "table-shape" ? (
            <>
              <h3 className="text-[12px] font-medium text-[#352A24]">Table Shape</h3>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {shapes.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedShape(id)}
                    className={`flex flex-col items-center gap-1.5 rounded-[6px] border px-2 py-2.5 text-[9px] ${
                      selectedShape === id
                        ? "border-transparent bg-[#F0DECE] text-[#A65D33]"
                        : "border-[#E7D8CE] bg-white text-[#7F736B]"
                    }`}
                  >
                    <Icon size={24} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-[10px] text-[#7F736B]">Table Scale</p>
                <div className="mt-2 h-[4px] rounded-full bg-[#DDD4CF]">
                  <div className="h-[4px] w-[38%] rounded-full bg-[#C67747]" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] text-[#7F736B]">Table Sitting</p>
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
                Tip:
                <br />
                select an item on the table to edit its property, or drag items from the left sidebar onto the table.
              </div>
            </>
          ) : !selectedCategory ? (
            <>
              <h3 className="text-[12px] font-medium text-[#352A24]">
                Categories &amp; Inventory
              </h3>

              <div className="mt-4 space-y-2">
                {inventoryCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex w-full items-center justify-between rounded-[6px] border px-3 py-2 text-[11px] ${
                      category.id === "Tablecloths"
                        ? "border-[#D58F67] bg-white text-[#A65D33]"
                        : "border-[#EEE3DB] bg-white text-[#4E423B]"
                    }`}
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
                className="flex w-full items-center justify-between rounded-[6px] bg-[#A95E31] px-3 py-2 text-[11px] font-medium text-white"
              >
                <span>{selectedCategory}</span>
                <FiChevronRight size={14} />
              </button>

              {activeCategoryData ? (
                <>
                  <div className="mt-4">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-[#6A5950]">
                      <span>Fabric</span>
                      <span className="text-[#C27748]">*</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {activeCategoryData.fabrics.map((fabric) => (
                        <button
                          key={fabric.id}
                          type="button"
                          onClick={() => setSelectedFabric(fabric.id)}
                          className={`rounded-[6px] border p-1 text-left ${
                            selectedFabric === fabric.id
                              ? "border-[#D58F67] bg-white"
                              : "border-[#E7D8CE] bg-white"
                          }`}
                        >
                          <div className="relative h-10 overflow-hidden rounded-[4px]">
                            <Image src={fabric.image} alt={fabric.label} fill className="object-cover" />
                          </div>
                          <p className="mt-1 text-[7px] text-[#6A5950]">{fabric.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-[#6A5950]">
                      <span>Style</span>
                      <span className="text-[#C27748]">*</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {activeCategoryData.styles.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedStyle(style.id)}
                          className={`rounded-[6px] border p-1 text-left ${
                            selectedStyle === style.id
                              ? "border-[#D58F67] bg-white"
                              : "border-[#E7D8CE] bg-white"
                          }`}
                        >
                          <div className="relative h-10 overflow-hidden rounded-[4px] bg-[#FAF6F3]">
                            <Image src={style.image} alt={style.label} fill className="object-contain p-1" />
                          </div>
                          <p className="mt-1 text-[7px] text-[#6A5950]">{style.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-medium text-[#6A5950]">Color</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {activeCategoryData.colors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedColor(color.id)}
                          className={`rounded-[6px] border p-1 text-left ${
                            selectedColor === color.id
                              ? "border-[#D58F67] bg-white"
                              : "border-[#E7D8CE] bg-white"
                          }`}
                        >
                          <div className="relative h-8 overflow-hidden rounded-[4px]">
                            <Image src={color.image} alt={color.label} fill className="object-cover" />
                          </div>
                          <p className="mt-1 text-[7px] text-[#6A5950]">{color.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative flex min-h-[332px] w-full items-center justify-center overflow-hidden rounded-[18px] bg-white">
            {activePanel === "table-shape" ? (
              <>
                <div className="absolute left-[18%] top-[18%] z-10 w-[74px] rounded-[10px] border border-[#F1E4DA] bg-white p-2 shadow-[0_10px_24px_rgba(188,142,110,0.12)]">
                  <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-[8px]">
                    <Image
                      src="/img/others/table-image1.png"
                      alt="table preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-[#4A3D36]">155k</p>
                  <p className="mt-1 text-[8px] text-[#B5A59A]">Total Order</p>
                  <p className="mt-2 inline-flex rounded-full bg-[#F7F2EE] px-1.5 py-0.5 text-[7px] text-[#9B8D82]">
                    Last 4 Month
                  </p>
                </div>

                <div className="relative h-[250px] w-full max-w-[420px]">
                  <Image
                    src="/img/others/table-image1.png"
                    alt="Simulation preview"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="absolute bottom-[62px] right-[13%] z-10 rounded-[10px] border border-[#F1E4DA] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(188,142,110,0.12)]">
                  <p className="text-[11px] font-semibold text-[#4A3D36]">8,458</p>
                  <p className="mt-1 text-[8px] text-[#B5A59A]">New Customers</p>
                </div>
              </>
            ) : (
              <div className="relative h-[300px] w-full max-w-[430px] overflow-hidden rounded-[22px] bg-[#FAF7F4]">
                <Image
                  src="/img/others/table-image.png"
                  alt="Inventory preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex w-full max-w-[320px] items-center justify-between rounded-[10px] border border-[#F0E4DB] bg-white px-4 py-3 text-[#4F433C] shadow-[0_10px_24px_rgba(188,142,110,0.12)]">
            <button type="button" className="rounded-[4px] bg-[#B56735] p-2 text-white">
              <FiTag size={14} />
            </button>
            <button type="button">
              <FiEye size={14} />
            </button>
            <button type="button">
              <FiRotateCcw size={14} />
            </button>
            <button type="button">
              <FiRotateCw size={14} />
            </button>
            <button type="button">
              <FiZoomIn size={14} />
            </button>
            <span className="text-[12px]">100%</span>
            <button type="button" className="text-[12px]">
              3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSimulation;