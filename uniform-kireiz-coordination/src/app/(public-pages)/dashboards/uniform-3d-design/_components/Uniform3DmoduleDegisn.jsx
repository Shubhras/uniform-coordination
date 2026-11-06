'use client'
import Image from 'next/image'
// import '@google/model-viewer'
import { useEffect, useRef, useState } from 'react'
import ColorPickerPopup from './ColorPickerPopup'
// const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
// const SAMPLE_MODEL = '/img/3dmodels/doctor_uniform.glb'
const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
import Button from '@/components/ui/Button';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import UniformCanvas from './UniformCanvas'
import { controlsApi } from './UniformCanvas'
import { uniformState } from './uniformStore'
import { FiCheck } from "react-icons/fi";
import { apiModelInfoCreate, apiSaveDesign } from '@/services/SaveDesignService'
import { apiGetProductDetailsById } from '@/services/ProductService'
import { apiGetSimulationOptions, apiGetSimulationStructure } from '@/services/SimulationService'
import { apiGetTemplateById } from '@/services/CategoryService'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'

const PART_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "collar", label: "Collar" },
  { value: "sleeve", label: "Sleeve" },
  { value: "zipper", label: "Zipper" },
  { value: "cuff", label: "Cuff" },
  { value: "waist", label: "Waist" },
  { value: "hem", label: "Hem" },
  { value: "inner_mesh", label: "Inner Mesh" },
  { value: "cap", label: "Cap" },
  { value: "apron", label: "Apron" },
  { value: "pocket", label: "Pocket" },
  { value: "pant", label: "Pant" },
  { value: "top", label: "Top" },
  { value: "other", label: "Other" },
];

const PANELS = {
  color: {
    title: "Color",
    type: "colors",
  },
  legy: {
    title: "Legy",
    type: "optionsLegy",
    data: [
      "/img/top-left-image/lagy/lagy.png",
      "/img/top-left-image/lagy/lagy.png",
    ]
  },
  top: {
    title: "Top",
    type: "optionsTops",
    data: [
      "/img/top-left-image/top/top.png",
      "/img/top-left-image/top/top.png",
    ]
  },
  collar: {
    title: "Collar",
    type: "options",
    data: [
      "/img/top-left-image/collar/collar1.png",
      "/img/top-left-image/collar/collar2.png",
      "/img/top-left-image/collar/collar3.png",
      "/img/top-left-image/collar/collar4.png",
    ]
  },

  size: {
    title: "Size",
    type: "size",
  },

  sleeves: {
    title: "Sleeves",
    type: "options",
    data: [
      "/img/3dmodels/sleves1.png",
      "/img/3dmodels/sleves2.png",
    ]
  },

  cap: {
    title: "Cap",
    type: "options",
    data: [
      "/img/top-left-image/cap/cap1.png",
      "/img/top-left-image/cap/cap2.png",
    ]
  },

  zipper: {
    title: "Zipper",
    type: "options",
    data: [
      "/img/top-left-image/zipper.png",
      "/img/top-left-image/zipper.png",
    ]
  },

  cuff: {
    title: "Cuff",
    type: "options",
    data: [
      "/img/3dmodels/cuff1.png",
      "/img/3dmodels/cuff2.png",
      "/img/3dmodels/cuff3.png",
      "/img/3dmodels/cuff4.png",
      "/img/3dmodels/cuff5.png",
    ]
  },

  pants: {
    title: "Pants",
    type: "options",
    data: [
      "/img/top-left-image/bottoms/pant1.png",
      "/img/top-left-image/bottoms/pant2.png",
      "/img/top-left-image/bottoms/pant3.png",
      "/img/top-left-image/bottoms/pant4.png",
      "/img/top-left-image/bottoms/pant5.png",
    ]
  },

  pocket: {
    title: "Pocket",
    type: "options",
    data: [
      "/img/top-left-image/bottoms/pocket.png",
      "/img/top-left-image/bottoms/pocket.png",
    ]
  },

  aprons: {
    title: "Aprons",
    type: "options",
    data: [
      "/img/top-left-image/bottoms/apron.png",
      "/img/top-left-image/bottoms/apron.png",

    ]
  },
};

// Left-rail tools + order come from Admin -> Simulation Assets -> Simulation
// Structure for this product's category. PANELS is the fallback for attributes
// with no admin data source.

// Matched by substring since admins type attribute names freely — "Sleeve",
// "Sleeves", "Sleeve Length" all mean the sleeve tool.
const ATTRIBUTE_TO_PANEL = [
  [["fabric", "material"], "fabric"],
  [["colour", "color"], "color"],
  [["part"], "parts"],
  [["size"], "size"],
  [["collar"], "collar"],
  [["sleeve"], "sleeves"],
  [["cap"], "cap"],
  [["cuff"], "cuff"],
  [["pocket"], "pocket"],
  [["apron"], "aprons"],
  [["zip", "closure"], "zipper"],
  [["pant", "trouser", "bottom"], "pants"],
  [["top"], "top"],
  [["leg"], "legy"],
];

// Admin attributes with no matching tool (Style, Fit, Waist, ...) are skipped,
// not rendered empty, and surfaced via `unsupportedAttributes`.
const panelKeyFor = (attributeName) => {
  const n = (attributeName || "").toLowerCase();
  const hit = ATTRIBUTE_TO_PANEL.find(([needles]) => needles.some((x) => n.includes(x)));
  return hit ? hit[1] : null;
};

// Which garment half each tool applies to. Admin decides *whether* a tool is
// offered; this decides *when* it's reachable (e.g. no collar tool on trousers).
const PANEL_POSITIONS = {
  color: ["top", "bottom"],
  size: ["top", "bottom"],
  fabric: ["top", "bottom"],
  pocket: ["top", "bottom"],
  parts: ["top", "bottom"],
  top: ["top"],
  collar: ["top"],
  sleeves: ["top"],
  cap: ["top"],
  zipper: ["top"],
  cuff: ["top"],
  pants: ["bottom"],
  aprons: ["bottom"],
  legy: ["bottom"],
};

// Inline Parts icon — no static asset for it since parts are per-product.
const PartsIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="mb-1">
    <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" stroke="#1C2A4A" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M4.5 11.2L12 15L19.5 11.2" stroke="#1C2A4A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 15.2L12 19L19.5 15.2" stroke="#1C2A4A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RAIL_META = {
  color: { label: "Color", icon: "/img/top-left-image/color-wheel.png", cls: "w-12 h-12" },
  parts: { label: "Parts", Svg: PartsIcon },
  fabric: { label: "Fabric", icon: "/img/top-left-image/textile.png", cls: "w-12 h-12" },
  size: { label: "Size", icon: "/img/top-left-image/measuring-tape.png", cls: "w-12 h-12" },
  collar: { label: "Collar", icon: "/img/top-left-image/collar.png", cls: "w-12 h-12" },
  sleeves: { label: "Sleeves", icon: "/img/top-left-image/sleeves.png", cls: "w-12 h-12" },
  cap: { label: "Cap", icon: "/img/top-left-image/cap.png", cls: "w-12 h-12" },
  zipper: { label: "Zipper", icon: "/img/top-left-image/zipper.png", cls: "w-12 h-12" },
  cuff: { label: "Cuff", icon: "/img/top-left-image/cuff.png", cls: "w-12 h-12" },
  top: { label: "Top", icon: "/img/top-left-image/textile.png", cls: "w-12 h-12" },
  legy: { label: "Legy", icon: "/img/top-left-image/textile.png", cls: "w-12 h-12" },
  pants: { label: "Pant", icon: "/img/top-left-image/bottoms/pant1.png", cls: "w-8 h-12 object-contain" },
  pocket: { label: "Pocket", icon: "/img/top-left-image/bottoms/pocket.png", cls: "w-8 h-12 object-contain" },
  aprons: { label: "Aprons", icon: "/img/top-left-image/bottoms/apron.png", cls: "w-10 h-12 object-contain" },
};

const Uniform3DmoduleDegisn = () => {
  // 
  const { id } = useParams();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const { session } = useCurrentSession();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  //console.log("Current Product ID:", id);
  const [designJSON, setDesignJSON] = useState({
    colors: {
      top: "",
      bottom: ""
    },

    // Colour row picked per half — kept since rows can share a hex.
    colorKeys: {
      top: "",
      bottom: ""
    },

    fabric: "",

    options: {
      collar: "",
      sleeves: "",
      cap: "",
      zipper: "",
      cuff: "",
      pants: "",
      pocket: "",
      aprons: ""
    },

    optionKeys: {
      collar: "",
      sleeves: "",
      cap: "",
      zipper: "",
      cuff: "",
      pants: "",
      pocket: "",
      aprons: ""
    },

    sizes: {}   // ✅ quantity based sizes
  });


  const increment = (size) => {
    setDesignJSON((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: (prev.sizes[size] || 0) + 1
      }
    }));
  };

  const decrement = (size) => {
    setDesignJSON((prev) => {
      const updatedSizes = { ...prev.sizes };

      if (!updatedSizes[size]) return prev;

      updatedSizes[size] -= 1;

      if (updatedSizes[size] <= 0) {
        delete updatedSizes[size]; // ✅ remove key
      }

      return {
        ...prev,
        sizes: updatedSizes
      };
    });
  };

  const router = useRouter()
  // const mvRef = useRef(null)
  // const [modelSrc, setModelSrc] = useState(SAMPLE_MODEL)
  const [active, setActive] = useState('')
  const [active3dPart, setActive3dPart] = useState('')

  const [autoRotate, setAutoRotate] = useState(true)
  const [color, setColor] = useState('#7fc7ff')
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [status, setStatus] = useState('loading')
  const [fieldOfView, setFieldOfView] = useState(45); // zoom control
  // const [cameraHistory, setCameraHistory] = useState([]);
  // const [redoStack, setRedoStack] = useState([]);
  // // const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const [imgSrc, setImgSrc] = useState('/img/uniform/uniform.png');
  const [fabricFilter, setFabricFilter] = useState('All');
  const [partFilter, setPartFilter] = useState('all');
  const panelRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setActive('')
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function applyBaseColorToModel(hex) {
    uniformState.color = hex
    const activeHalf = position === 'bottom' ? 'bottom' : 'top'
    uniformState.partColors[activeHalf] = hex
    if (uniformState.active3dPart) {
      uniformState.partColors[uniformState.active3dPart] = hex
    }
  }

  /** LEFT ICON SELECT */
  function onIconClick(key) {
    setActive(prev => {
      if (prev === key) {
        setShowColorPicker(false)
        return ''
      }
      return key
    })
  }
  function onActive3dPartClick(key) {
    // uniformState.color = ""
    setActive3dPart(key);
    uniformState.active3dPart = key;
    if (key === 'top' || key === 'bottom') {
      setPosition(key);
    }
  }


  const zoomPercent = Math.round(((120 - fieldOfView) / 110) * 100);



  function zoomIn() {
    controlsApi.zoomIn()
  }

  function zoomOut() {
    controlsApi.zoomOut()
  }

  function rotate90() {
    controlsApi.rotate90()
  }

  function undoCamera() {
    controlsApi.undo()
  }

  function redoCamera() {
    controlsApi.redo()
  }

  const [position, setPosition] = useState("top"); // top | bottom

  // --- Admin-driven simulation config ---------------------------------------
  const [simProduct, setSimProduct] = useState(null);
  const [simAttributes, setSimAttributes] = useState([]);
  const [simFabrics, setSimFabrics] = useState([]);
  const [simColors, setSimColors] = useState([]);
  const [simParts, setSimParts] = useState([]);
  // Per-attribute choices from Product & Specification -> Options, keyed by tool.
  const [simOptions, setSimOptions] = useState({});
  const [template, setTemplate] = useState(null);
  // Preset entries this product can't offer, shown to the shopper rather than silently dropped.
  const [presetSkipped, setPresetSkipped] = useState([]);
  const [simLoading, setSimLoading] = useState(true);
  const [simBlocked, setSimBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAdminConfig = async () => {
      // No id: nothing to load. Safety net — the id-less route renders the product picker instead.
      if (!id) {
        setSimLoading(false);
        return;
      }
      try {
        setSimLoading(true);

        const productRes = await apiGetProductDetailsById(id);
        const product = productRes?.status ? productRes.data : null;
        if (cancelled) return;

        if (!product) {
          setSimBlocked(true);
          return;
        }
        setSimProduct(product);
        if (product.ProductImage) {
          setImgSrc(product.ProductImage);
        } else {
          setImgSrc('/img/uniform/uniform.png');
        }

        // Garment half comes from the product, not the shopper. "set" covers both, so default to top.
        if (product.type === "bottom") setPosition("bottom");
        else setPosition("top");

        const queryCategoryId = searchParams.get('category_id') || searchParams.get('category');
        const categoryId = queryCategoryId || product.category?.id;
        const categoryName = product.category?.categoryName || "";

        // Fetch category-specific options, admin simulation structure for all categories, and global options
        const [optionsRes, structureRes, globalOptionsRes] = await Promise.all([
          categoryId ? apiGetSimulationOptions({ categoryId }).catch(() => null) : Promise.resolve(null),
          apiGetSimulationStructure().catch(() => null),
          apiGetSimulationOptions().catch(() => null),
        ]);
        if (cancelled) return;

        // 1. Resolve simulation structure for the selected product's category
        const allStructures = structureRes?.status ? structureRes.data : null;
        let categoryAttributes = [];

        if (allStructures && categoryName) {
          const matchKey = Object.keys(allStructures).find(
            (k) => k.trim().toLowerCase() === categoryName.trim().toLowerCase()
          );
          if (matchKey && Array.isArray(allStructures[matchKey]) && allStructures[matchKey].length > 0) {
            categoryAttributes = allStructures[matchKey];
          }
        }

        // Fall back to optionsRes.data.attributes if category structure was not found in structure endpoint
        if (categoryAttributes.length === 0 && optionsRes?.data?.attributes?.length > 0) {
          categoryAttributes = optionsRes.data.attributes;
        }

        // If category has no admin-saved structure yet, fall back to standard admin attributes:
        // Parts, Color, Size, Fabric
        if (categoryAttributes.length === 0) {
          categoryAttributes = [
            { attribute: "Parts", enabled: true, order: "1" },
            { attribute: "Color", enabled: true, order: "2" },
            { attribute: "Size", enabled: true, order: "3" },
            { attribute: "Fabric", enabled: true, order: "4" },
          ];
        }

        setSimAttributes(categoryAttributes);

        // 2. Fabrics: category-specific; if none in category, empty (no global fallback)
        const fabricsList = categoryId
          ? (optionsRes?.data?.fabrics || [])
          : (optionsRes?.data?.fabrics || globalOptionsRes?.data?.fabrics || []);
        setSimFabrics(fabricsList);

        if (fabricsList && fabricsList.length > 0) {
          setDesignJSON((prev) => {
            if (!prev.fabric) {
              return { ...prev, fabric: fabricsList[0].name };
            }
            return prev;
          });
        }

        // 3. Colors: category-specific or fallback to global colors
        const colorsList =
          (optionsRes?.data?.colors && optionsRes.data.colors.length > 0)
            ? optionsRes.data.colors
            : (globalOptionsRes?.data?.colors || []);
        setSimColors(colorsList);

        // 4. Attribute options (e.g. sizes): category-specific (no global fallback)
        const attrOptions = categoryId
          ? (optionsRes?.data?.attribute_options || {})
          : {
            ...(globalOptionsRes?.data?.attribute_options || {}),
            ...(optionsRes?.data?.attribute_options || {}),
          };
        setSimOptions(attrOptions);

        // 5. Parts: from simulation options api (optionsRes.data.parts), or product.layers, or product.parts
        const allProducts = categoryId
          ? (optionsRes?.data?.products || [])
          : [
            ...(optionsRes?.data?.products || []),
            ...(globalOptionsRes?.data?.products || []),
          ];
        const row = allProducts.find((p) => String(p.id) === String(id));
        const layers = row?.layers || [];

        const apiParts = categoryId
          ? (optionsRes?.data?.parts || [])
          : (optionsRes?.data?.parts || globalOptionsRes?.data?.parts || []);

        let finalParts = [];
        if (apiParts && apiParts.length > 0) {
          finalParts = apiParts.map((p) => ({
            id: p.id,
            name: p.name || p.part_name || `Part ${p.id}`,
            part_name: p.part_name || p.name || `Part ${p.id}`,
            part_type: p.part_type || "",
            image: p.image || null,
            fabric: typeof p.fabric === "object" ? (p.fabric?.name || p.fabric?.fabricName) : (p.fabric || null),
            z_index: p.z_index || p.zIndex || 0,
            offset_x: p.offset_x || p.offsetX || 0,
            offset_y: p.offset_y || p.offsetY || 0,
            category_id: p.category_id,
          }));
        } else if (layers.length > 0) {
          finalParts = layers;
        } else if (product.parts && product.parts.length > 0) {
          finalParts = product.parts.map((p) => ({
            id: p.id,
            name: p.partName || p.name || `Part ${p.id}`,
            part_name: p.partName || p.name || `Part ${p.id}`,
            part_type: p.part_type || p.partType || "",
            image: p.partImage || p.image || null,
            fabric: p.fabric?.fabricName || p.fabric || null,
            z_index: p.zIndex || 0,
            offset_x: p.offsetX || 0,
            offset_y: p.offsetY || 0,
          }));
        }
        setSimParts(finalParts);

        if (finalParts && finalParts.length > 0) {
          setDesignJSON((prev) => {
            if (!prev.part) {
              return { ...prev, part: finalParts[0].name };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Failed to load admin simulation config:", err);
      } finally {
        if (!cancelled) setSimLoading(false);
      }
    };

    loadAdminConfig();
    return () => {
      cancelled = true;
    };
  }, [id, searchParams]);

  // Color, Fabric, Size and Parts come from admin data
  const panels = (() => {
    const merged = { ...PANELS };
    delete merged.fabric;
    delete merged.color;
    delete merged.size;

    // One swatch per admin colour, no deduping — two records can share a hex.
    const adminColors = simColors
      .filter((c) => (c.code || "").trim())
      .map((c, idx) => ({
        key: c.id ? `c${c.id}` : (c._id ? `c${c._id}` : `c_${idx}`),
        code: (c.code || "").trim(),
        name: c.name || c.colorName || (c.code || "").trim(),
      }));

    if (adminColors.length) {
      merged.color = { ...PANELS.color, data: adminColors };
    } else {
      merged.color = {
        ...PANELS.color,
        data: [
          { key: "c1", code: "#1C4FA8", name: "Royal Blue" },
          { key: "c2", code: "#FFFFFF", name: "White" },
          { key: "c3", code: "#000000", name: "Black" },
        ],
      };
    }

    // Admin options replace the static PANELS artwork per attribute
    Object.entries(simOptions).forEach(([key, options]) => {
      if (!options?.length || !PANELS[key]) return;

      if (key === "size") {
        merged.size = { ...PANELS.size, data: options.map((o) => o.name) };
        return;
      }

      merged[key] = {
        title: PANELS[key]?.title || key,
        type: "adminOptions",
        data: options,
      };
    });

    if (!merged.size) {
      merged.size = {
        ...PANELS.size,
        data: [],
      };
    }

    // Parts panel — always defined so clicking the sidebar tool opens parts
    merged.parts = {
      title: "Parts",
      type: "parts",
      data: simParts || [],
    };

    merged.fabric = {
      title: "Fabric",
      type: "fabricRecords",
      data: simFabrics || [],
    };

    return merged;
  })();

  // Tools the admin enabled for this category, in the admin's order
  const railKeys = (() => {
    // Wait for admin config, else the fallback tools flash before the real list.
    if (simLoading) return [];

    const enabledAttributes = (simAttributes || [])
      .filter((a) => a.enabled !== false)
      .sort((a, b) => {
        const orderA = Number(a.order) || 0;
        const orderB = Number(b.order) || 0;
        return orderA - orderB;
      });

    const fromAdmin = enabledAttributes
      .map((a) => panelKeyFor(a.attribute))
      .filter(Boolean);

    // Admin-configured category: show in admin-specified order!
    if (fromAdmin.length) {
      const keys = [...new Set(fromAdmin)].filter((k) => panels[k]);
      // Color is always shown by default
      if (!keys.includes("color") && panels.color) {
        const partsIdx = keys.indexOf("parts");
        if (partsIdx !== -1) {
          keys.splice(partsIdx + 1, 0, "color");
        } else {
          keys.unshift("color");
        }
      }
      return keys;
    }


    // return ["parts", "color", "size", "fabric", "collar", "sleeves", "cap", "zipper", "cuff", "pants", "pocket", "aprons"]
    // Default fallback: parts, color, size, fabric
    return ["parts", "color", "size", "fabric"]
      .filter((k) => panels[k]);
  })();

  const unsupportedAttributes = simAttributes
    .filter((a) => !panelKeyFor(a.attribute))
    .map((a) => a.attribute);

  // Keyed on a joined string because railKeys is rebuilt on every render.
  const railKey = railKeys.join(",");

  // Apply the template's presets once admin config has landed — only for tools the
  // rail actually offers. Anything dropped is recorded in `presetSkipped` and shown.
  useEffect(() => {
    let cancelled = false;

    const applyTemplate = async () => {
      if (!templateId || simLoading) return;

      let tpl = template;
      if (!tpl) {
        try {
          const res = await apiGetTemplateById(templateId);
          if (cancelled || !res?.status) return;
          tpl = res.data;
          setTemplate(tpl);
        } catch (err) {
          console.error("Failed to load the template:", err);
          return;
        }
      }
      if (cancelled || !tpl) return;

      const available = new Set(railKeys);
      const skipped = [];
      const patch = {};

      // Colour is stored per garment half.
      if (tpl.preset_color) {
        const key = `c${tpl.preset_color}`;
        const known = (panels.color?.data || []).some((c) => c.key === key);
        if (available.has("color") && known) {
          const half = simProduct?.type === "bottom" ? "bottom" : "top";
          patch.colors = { ...designJSON.colors, [half]: tpl.presetColorCode };
          patch.colorKeys = { ...designJSON.colorKeys, [half]: key };
        } else {
          skipped.push(`Colour (${tpl.presetColorName || "preset"})`);
        }
      }

      // Fabrics are scoped per category — a preset from elsewhere may not be offered here.
      if (tpl.preset_fabric) {
        const known = simFabrics.some((f) => f.id === tpl.preset_fabric);
        if (available.has("fabric") && known) {
          patch.fabric = tpl.presetFabricName;
        } else {
          skipped.push(`Fabric (${tpl.presetFabricName || "preset"})`);
        }
      }

      // Preset part names only exist on some products.
      if (tpl.presetPartName) {
        const known = simParts.some((prt) => prt.name === tpl.presetPartName);
        if (available.has("parts") && known) {
          patch.part = tpl.presetPartName;
        } else {
          skipped.push(`Part (${tpl.presetPartName})`);
        }
      }

      if (Object.keys(patch).length) {
        setDesignJSON((prev) => ({ ...prev, ...patch }));
        if (patch.colors) applyBaseColorToModel(tpl.presetColorCode);
      }
      setPresetSkipped(skipped);
    };

    applyTemplate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, simLoading, railKey]);

  // A tool can disappear when the garment half changes; don't leave its panel open.
  useEffect(() => {
    if (active && !railKeys.includes(active)) setActive("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [railKey, active]);

  useEffect(() => {
    uniformState.active3dPart = "top";
  }, []);

  useEffect(() => {
    uniformState.active3dPart = position; // "top" or "bottom"
  }, [position]);



  const handleUniformDesignResult = async () => {

    console.log("FINAL DESIGN JSON:", session);
    if (!session?.user?.email) {
      toast.push(
        <Notification title="Login Required" type="warning">
          Please sign in first to continue.
        </Notification>
      );
      //router.push(`/sign-in?${REDIRECT_URL_KEY}=${pathname}`);
      return;
    }
    console.log("FINAL DESIGN JSON:", designJSON);

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("product", id || "");
    formData.append("model_file", ""); // Send empty or file object
    formData.append("description", "School uniform 3D model");

    try {
      const response = await apiModelInfoCreate(formData, session?.user?.accessToken);
      // console.log("Design create Successfully:", response);

      if (response?.status) {
        // toast.push(
        //   <Notification title="Success!" type="success">
        //     {response.message || "3D model information created successfully"}
        //   </Notification>
        // );
        handleSaveDesign(response.data?.id);
      } else {
        toast.push(
          <Notification title="Error!" type="danger">
            {response?.message || "Failed to save design"}
          </Notification>
        );
      }

    } catch (error) {
      console.error("Save Design Error:", error);
      toast.push(
        <Notification title="Error!" type="danger">
          Something went wrong.
        </Notification>
      );
    } finally {
      setIsSubmitting(false);
    }

  };



  const handleSaveDesign = async (modelId) => {
    // if (!session?.user?.accessToken) {
    //   toast.push(
    //     <Notification title="Login Required" type="warning">
    //       Please sign in first to continue.
    //     </Notification>
    //   );
    //   return;
    // }
    setIsSaving(true);

    // The shopper's actual choices, not fixed sample values.
    const payload = {
      "user": session?.user?.id,
      "model_info": modelId,
      "config_json": {
        "product_id": id,
        "colors": designJSON.colors,
        "color_keys": designJSON.colorKeys,
        "fabric": designJSON.fabric,
        "part": designJSON.part || "",
        "options": designJSON.options,
        "option_keys": designJSON.optionKeys,
        "sizes": designJSON.sizes,
      },
      "isActive": true
    }

    try {
      const response = await apiSaveDesign(payload, session.user.accessToken);
      console.log("Design Saved Successfully:", response);
      toast.push(
        <Notification title="Success!" type="success">
          Design saved successfully
        </Notification>
      );

      const id = response?.data?.id;  // custom update model id
      // Redirect to result page
      router.push(`/dashboards/design-result/${id}`);

    } catch (error) {
      console.error("Save Design Error:", error);
      toast.push(
        <Notification title="Error!" type="danger">
          Failed to save design
        </Notification>
      );
    } finally {
      setIsSaving(false);
    }
  };


  // No matching product for this id.
  if (simBlocked) {
    return (
      <section className="w-full mx-auto bg-white px-6 lg:px-4 py-20 mt-11">
        <div className="max-w-md mx-auto text-center border border-dashed border-gray-300 rounded-xl py-12 px-6">
          <h2 className="text-lg font-semibold text-[#1C2A4A]">
            This uniform is not available to customise
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {simProduct
              ? "It has been withdrawn from the design tool. Please pick another uniform."
              : "We could not find this uniform."}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 bg-[#1C4FA8] text-white px-5 py-2 rounded-md text-sm font-medium"
          >
            Go back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white flex flex-col px-4 sm:px-6 py-4 gap-6 mt-11">
      {/* Shows the applied template style */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative w-full flex-1 min-w-0">
        <div className="w-full md:w-[80px] flex-shrink-0 flex md:flex-col items-center">
          {/* Left rail: on mobile horizontal row at TOP, on desktop (md+) vertical column on LEFT */}
          <div className="flex md:flex-col gap-2 w-full overflow-x-auto md:overflow-visible py-1 px-1">
            {railKeys.map((key) => {
              const meta = RAIL_META[key];
              if (!meta) return null;
              return (
                <button
                  key={key}
                  onClick={() => onIconClick(key)}
                  className={`w-[64px] min-w-[64px] md:w-[70px] md:min-w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === key ? "ring-2 ring-blue-500" : ""
                    }`}
                >
                  {meta.Svg ? (
                    <meta.Svg />
                  ) : (
                    <img src={meta.icon} className={`${meta.cls} mb-1`} alt={meta.label} />
                  )}
                  <span className="text-xs text-gray-600">{meta.label}</span>
                </button>
              );
            })}

            {simLoading && (
              <div className="flex md:flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-[64px] min-w-[64px] h-[64px] md:w-[70px] md:h-[70px] bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {!simLoading && railKeys.length === 0 && (
              <p className="w-full md:w-[70px] text-[10px] leading-tight text-gray-500 text-center md:text-left">
                No {position} options enabled for this category.
              </p>
            )}
          </div>
        </div>
        <div className="relative">
          {panels[active] && (
            <div
              ref={panelRef}
              className={`absolute top-full md:top-0 left-0 md:left-2 z-30 ${
                active === "fabric" || active === "parts" ? "w-[360px] md:w-[410px]" : "w-[285px]"
              } max-w-[calc(100vw-32px)] bg-white shadow-xl rounded-xl p-3 border border-gray-100`}>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                <h5 className="font-semibold text-xs text-gray-700 tracking-wide uppercase">
                  {panels[active].title}
                </h5>
                <button
                  type="button"
                  onClick={() => {
                    setActive("");
                    setShowColorPicker(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xs px-1 font-bold"
                >
                  ✕
                </button>
              </div>
              {panels[active].type === "colors" && (
                <div className="space-y-3">
                  {simProduct?.type === "set" && (
                    <div className="flex gap-2 pb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPosition("top");
                          uniformState.active3dPart = "top";
                        }}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md border transition ${position === "top"
                          ? "bg-[#1C4FA8] text-white border-[#1C4FA8] shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPosition("bottom");
                          uniformState.active3dPart = "bottom";
                        }}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md border transition ${position === "bottom"
                          ? "bg-[#1C4FA8] text-white border-[#1C4FA8] shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        Bottom
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3 relative">
                    {panels[active].data.map((swatch, idx) => {
                      const activeHalf = position === "bottom" ? "bottom" : "top";
                      const selected =
                        designJSON.colorKeys?.[activeHalf] === swatch.key ||
                        (!designJSON.colorKeys?.[activeHalf] &&
                          designJSON.colors?.[activeHalf]?.toLowerCase() === swatch.code?.toLowerCase());

                      return (
                        <button
                          key={swatch.key || idx}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              applyBaseColorToModel("#ffffff");
                              setColor("#ffffff");
                              setDesignJSON((prev) => ({
                                ...prev,
                                colors: {
                                  ...prev.colors,
                                  [activeHalf]: "",
                                },
                                colorKeys: {
                                  ...prev.colorKeys,
                                  [activeHalf]: "",
                                },
                              }));
                            } else {
                              applyBaseColorToModel(swatch.code);
                              setColor(swatch.code);

                              setDesignJSON((prev) => ({
                                ...prev,
                                colors: {
                                  ...prev.colors,
                                  [activeHalf]: swatch.code,
                                },
                                colorKeys: {
                                  ...prev.colorKeys,
                                  [activeHalf]: swatch.key,
                                },
                              }));
                            }
                          }}
                          title={swatch.name || swatch.code}
                          className={`relative w-10 h-10 rounded-full shadow flex items-center justify-center transition cursor-pointer hover:scale-105 ${selected
                            ? "ring-2 ring-offset-2 ring-[#1C4FA8] border-0"
                            : "border border-gray-200"
                            }`}
                          style={{ background: swatch.code }}
                        >
                          {selected && (
                            <FiCheck
                              size={18}
                              className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {showColorPicker && (
                <ColorPickerPopup
                  value={color}
                  onChange={(newColor) => {
                    const activeHalf = position === "bottom" ? "bottom" : "top";
                    setColor(newColor);
                    applyBaseColorToModel(newColor);
                    setDesignJSON((prev) => ({
                      ...prev,
                      colors: {
                        ...prev.colors,
                        [activeHalf]: newColor,
                      },
                      colorKeys: {
                        ...prev.colorKeys,
                        [activeHalf]: `custom_${newColor}`,
                      },
                    }));
                  }}
                  onClose={() => setShowColorPicker(false)}
                />
              )}



              {panels[active].type === "textures" && (
                <div className="w-full">
                  {/* HEADER */}
                  <div className="grid grid-cols-5 text-center mb-4 text-sm font-medium text-[#1C2A4A]">
                    <span>Cotton</span>
                    <span>Poplin</span>
                    <span>Twill</span>
                    <span>Rayon</span>
                    <span>Silk</span>
                  </div>

                  {/* TEXTURE GRID */}
                  <div className="grid grid-cols-5 gap-2">
                    {panels[active].data.map((tex, i) => {
                      const selected = designJSON.fabric === tex;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (selected) {
                              setDesignJSON((prev) => ({
                                ...prev,
                                fabric: ""
                              }));
                            } else {
                              setDesignJSON((prev) => ({
                                ...prev,
                                fabric: tex
                              }));
                            }
                          }}
                          className={`relative w-[43px] h-[43px] rounded-md overflow-hidden transition ${selected
                            ? "ring-2 ring-[#1C4FA8] border-0"
                            : "border border-gray-300 hover:border-blue-500"
                            }`}
                        >
                          <img
                            src={tex}
                            alt="texture"
                            className="w-full h-full object-cover"
                          />
                          {selected && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <FiCheck size={16} className="text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parts with static PART_TYPE_OPTIONS filter pills and 2-column cards (like fabric) */}
              {panels[active].type === "parts" && (() => {
                const allParts = panels[active].data || [];

                const normalize = (str) =>
                  (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

                const visibleParts =
                  partFilter.toLowerCase() === "all"
                    ? allParts
                    : allParts.filter((part) => {
                        const target = normalize(partFilter);
                        const pt = normalize(part.part_type);
                        if (pt) {
                          return pt === target || pt.includes(target) || target.includes(pt);
                        }
                        if (target === "other") return true;
                        const nameNorm = normalize(part.name || part.part_name);
                        return nameNorm.includes(target);
                      });

                return (
                  <div className="w-full space-y-3">
                    {/* FILTER PILLS */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar max-w-full">
                      {PART_TYPE_OPTIONS.map((opt) => {
                        const isActive = (partFilter || "all").toLowerCase() === opt.value.toLowerCase();
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              if (isActive && opt.value !== "all") {
                                setPartFilter("all");
                              } else {
                                setPartFilter(opt.value);
                              }
                            }}
                            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer select-none ${
                              isActive
                                ? "bg-[#1C4FA8] text-white shadow-xs"
                                : "bg-[#F1F5F9] text-[#486284] hover:bg-[#E2E8F0]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* PARTS CARDS GRID */}
                    <div className="w-full max-h-[320px] overflow-y-auto pr-1">
                      {allParts.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs">
                          No parts configured for this uniform.
                        </div>
                      ) : visibleParts.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs">
                          <p className="font-medium text-gray-600">
                            No parts found for &quot;{PART_TYPE_OPTIONS.find((o) => o.value.toLowerCase() === (partFilter || "all").toLowerCase())?.label || partFilter}&quot;.
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Check other part types or view all parts.
                          </p>
                          <button
                            type="button"
                            onClick={() => setPartFilter("all")}
                            className="mt-2 text-[#1C4FA8] hover:underline font-semibold text-xs cursor-pointer"
                          >
                            View All Parts
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                          {visibleParts.map((part) => {
                            const isSelected = designJSON.part === part.name;

                            return (
                              <div
                                key={part.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setDesignJSON((prev) => ({
                                      ...prev,
                                      part: "",
                                    }));
                                    onActive3dPartClick("");
                                  } else {
                                    setDesignJSON((prev) => ({
                                      ...prev,
                                      part: part.name,
                                    }));
                                    onActive3dPartClick(part.name);
                                  }
                                }}
                                className={`relative bg-white rounded-xl border p-2.5 flex flex-col justify-between transition shadow-xs cursor-pointer select-none ${
                                  isSelected
                                    ? "border-[#1C4FA8] ring-2 ring-[#1C4FA8] bg-blue-50/25 shadow-sm"
                                    : "border-gray-200 hover:border-[#1C4FA8]/50 hover:shadow-sm"
                                }`}
                              >
                                {/* Top right checkmark badge when selected */}
                                {isSelected && (
                                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1C4FA8] text-white flex items-center justify-center shadow-xs z-10">
                                    <FiCheck size={12} strokeWidth={3} />
                                  </span>
                                )}

                                {/* TOP ROW: Image + Text Details */}
                                <div className="flex items-start gap-2">
                                  {/* Part image preview */}
                                  <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-50 flex items-center justify-center p-0.5">
                                    {part.image ? (
                                      <img
                                        src={part.image}
                                        alt={part.name}
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <PartsIcon />
                                    )}
                                  </div>

                                  {/* Info: Name, fabric, part_type */}
                                  <div className="min-w-0 flex-1 pr-4">
                                    <h6
                                      className="font-bold text-[11px] text-[#1C2C56] truncate leading-tight"
                                      title={part.name}
                                    >
                                      {part.name}
                                    </h6>
                                    {part.fabric && (
                                      <p
                                        className="text-[9px] text-gray-500 truncate mt-0.5"
                                        title={part.fabric}
                                      >
                                        Fabric: {part.fabric}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      {part.part_type && (
                                        <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-blue-50 text-[#1C4FA8] border border-blue-100">
                                          {part.part_type}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* BOTTOM ROW: Full-width Apply/Applied button */}
                                <div className="mt-2.5 pt-1.5 border-t border-gray-100">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        setDesignJSON((prev) => ({
                                          ...prev,
                                          part: "",
                                        }));
                                        onActive3dPartClick("");
                                      } else {
                                        setDesignJSON((prev) => ({
                                          ...prev,
                                          part: part.name,
                                        }));
                                        onActive3dPartClick(part.name);
                                      }
                                    }}
                                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                      isSelected
                                        ? "bg-[#1C4FA8] text-white shadow-xs"
                                        : "bg-[#F0F5FF] text-[#1C4FA8] hover:bg-[#E1EDFF]"
                                    }`}
                                  >
                                    {isSelected && <FiCheck size={12} strokeWidth={3} className="text-white" />}
                                    <span>{isSelected ? "Applied" : "Apply"}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Admin fabrics panel with functional type filter and rich cards */}
              {panels[active].type === "fabricRecords" && (() => {
                const allFabrics = panels[active].data || [];

                const normalize = (str) =>
                  (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

                const getFabricFunctionalType = (f) =>
                  f.functional_type || f.functionalType || f.functional_type_name || "";

                // The 4 functional types requested, always present alongside 'All'
                const filterPills = (() => {
                  const defaults = [
                    "All",
                    "Antibacterial",
                    "Stain-resistant",
                    "Moisture-wicking",
                    "Breathable",
                  ];
                  allFabrics.forEach((f) => {
                    const raw = getFabricFunctionalType(f).trim();
                    if (raw) {
                      const formatted = raw
                        .split(/[-_\s]+/)
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join("-");
                      const exists = defaults.some(
                        (d) => normalize(d) === normalize(formatted)
                      );
                      if (!exists) {
                        defaults.push(formatted);
                      }
                    }
                  });
                  return defaults;
                })();

                const visibleFabrics =
                  fabricFilter === "All"
                    ? allFabrics
                    : allFabrics.filter((f) => {
                        const ft = normalize(getFabricFunctionalType(f));
                        const target = normalize(fabricFilter);
                        return ft && (ft.includes(target) || target.includes(ft));
                      });

                return (
                  <div className="w-full space-y-3">
                    {/* FILTER PILLS */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-1 max-w-full">
                      {filterPills.map((pill) => {
                        const isActive = fabricFilter === pill;
                        return (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => {
                              if (isActive && pill !== "All") {
                                setFabricFilter("All");
                              } else {
                                setFabricFilter(pill);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer select-none ${
                              isActive
                                ? "bg-[#1C4FA8] text-white shadow-xs"
                                : "bg-[#F1F5F9] text-[#486284] hover:bg-[#E2E8F0]"
                            }`}
                          >
                            {pill}
                          </button>
                        );
                      })}
                    </div>

                    {/* FABRIC CARDS GRID */}
                    <div className="w-full max-h-[320px] overflow-y-auto pr-1">
                      {allFabrics.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs">
                          No fabrics available for this category.
                        </div>
                      ) : visibleFabrics.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs">
                          <p className="font-medium text-gray-600">
                            No {fabricFilter.toLowerCase()} fabrics found.
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Check other functional types or view all fabrics.
                          </p>
                          <button
                            type="button"
                            onClick={() => setFabricFilter("All")}
                            className="mt-2 text-[#1C4FA8] hover:underline font-semibold text-xs cursor-pointer"
                          >
                            View All Fabrics
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                          {visibleFabrics.map((fabric) => {
                            const isSelected = designJSON.fabric === fabric.name;

                            return (
                              <div
                                key={fabric.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setDesignJSON((prev) => ({
                                      ...prev,
                                      fabric: "",
                                    }));
                                  } else {
                                    setDesignJSON((prev) => ({
                                      ...prev,
                                      fabric: fabric.name,
                                    }));
                                  }
                                }}
                                className={`relative bg-white rounded-xl border p-2.5 flex flex-col justify-between transition shadow-xs cursor-pointer select-none ${
                                  isSelected
                                    ? "border-[#1C4FA8] ring-2 ring-[#1C4FA8] bg-blue-50/25 shadow-sm"
                                    : "border-gray-200 hover:border-[#1C4FA8]/50 hover:shadow-sm"
                                }`}
                              >
                                {/* Top right checkmark badge when selected */}
                                {isSelected && (
                                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1C4FA8] text-white flex items-center justify-center shadow-xs z-10">
                                    <FiCheck size={12} strokeWidth={3} />
                                  </span>
                                )}

                                {/* TOP ROW: Image + Text Details */}
                                <div className="flex items-start gap-2">
                                  {/* Texture / Swatch preview */}
                                  <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-50">
                                    {fabric.texture_image ? (
                                      <img
                                        src={fabric.texture_image}
                                        alt={fabric.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div
                                        className="w-full h-full"
                                        style={{
                                          backgroundColor:
                                            fabric.swatch || fabric.color || "#CBD5E1",
                                        }}
                                      />
                                    )}

                                    {/* Color dot in bottom-right corner */}
                                    {(fabric.color || fabric.swatch) && (
                                      <span
                                        className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border border-white shadow-xs"
                                        style={{
                                          backgroundColor:
                                            fabric.color || fabric.swatch,
                                        }}
                                        title={fabric.color || fabric.swatch}
                                      />
                                    )}
                                  </div>

                                  {/* Info: Name, composition, weave, weight */}
                                  <div className="min-w-0 flex-1 pr-4">
                                    <h6
                                      className="font-bold text-[11px] text-[#1C2C56] truncate leading-tight"
                                      title={fabric.name}
                                    >
                                      {fabric.name}
                                    </h6>
                                    <p
                                      className="text-[9px] text-gray-500 truncate mt-0.5"
                                      title={fabric.composition || fabric.material_type}
                                    >
                                      {fabric.composition || fabric.material_type || "—"}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      {fabric.weave && (
                                        <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-blue-50 text-[#1C4FA8] border border-blue-100">
                                          {fabric.weave}
                                        </span>
                                      )}
                                      {fabric.weight && (
                                        <span className="text-[8px] text-gray-400 font-medium">
                                          {fabric.weight} GSM
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* BOTTOM ROW: Full-width Apply/Applied button */}
                                <div className="mt-2.5 pt-1.5 border-t border-gray-100">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        setDesignJSON((prev) => ({
                                          ...prev,
                                          fabric: "",
                                        }));
                                      } else {
                                        setDesignJSON((prev) => ({
                                          ...prev,
                                          fabric: fabric.name,
                                        }));
                                      }
                                    }}
                                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                      isSelected
                                        ? "bg-[#1C4FA8] text-white shadow-xs"
                                        : "bg-[#F0F5FF] text-[#1C4FA8] hover:bg-[#E1EDFF]"
                                    }`}
                                  >
                                    {isSelected && <FiCheck size={12} strokeWidth={3} className="text-white" />}
                                    <span>{isSelected ? "Applied" : "Apply"}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Admin-managed choices, labelled with the name the admin typed. */}
              {panels[active].type === "adminOptions" && (
                <div className="w-full max-h-[300px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-3 gap-3">
                    {panels[active].data.map((opt) => {
                      const selected =
                        designJSON.optionKeys?.[active] !== undefined &&
                          designJSON.optionKeys?.[active] !== ""
                          ? designJSON.optionKeys[active] === String(opt.id)
                          : designJSON.options?.[active] === opt.name;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (selected) {
                              setDesignJSON((prev) => ({
                                ...prev,
                                options: {
                                  ...prev.options,
                                  [active]: "",
                                },
                                optionKeys: {
                                  ...prev.optionKeys,
                                  [active]: "",
                                },
                              }));
                            } else {
                              setDesignJSON((prev) => ({
                                ...prev,
                                options: {
                                  ...prev.options,
                                  [active]: opt.name,
                                },
                                optionKeys: {
                                  ...prev.optionKeys,
                                  [active]: String(opt.id),
                                },
                              }));
                            }
                          }}
                          title={opt.name}
                          className={`relative p-1.5 rounded-lg shadow transition ${selected ? "ring-2 ring-[#1C4FA8]" : "hover:shadow-md"
                            }`}
                        >
                          <span className="block w-full h-[52px] rounded overflow-hidden bg-gray-50">
                            {opt.image && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={opt.image}
                                alt={opt.name}
                                className="w-full h-full object-contain"
                              />
                            )}
                          </span>

                          <span className="block mt-1 text-[9px] leading-tight text-gray-600 truncate">
                            {opt.name}
                          </span>

                          {selected && (
                            <span className="absolute top-1 right-1 bg-[#1C4FA8] rounded-full p-0.5">
                              <FiCheck size={10} className="text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {panels[active].type === "options" && (
                <div className="grid grid-cols-3 gap-3">
                  {panels[active].data.map((opt, i) => {
                    const optKey = String(i);
                    const selected =
                      designJSON.optionKeys?.[active] !== undefined &&
                        designJSON.optionKeys?.[active] !== ""
                        ? designJSON.optionKeys[active] === optKey
                        : designJSON.options?.[active] === opt;
                    return (
                      <button key={i} onClick={() => {
                        if (selected) {
                          setDesignJSON((prev) => ({
                            ...prev,
                            options: {
                              ...prev.options,
                              [active]: ""
                            },
                            optionKeys: {
                              ...prev.optionKeys,
                              [active]: ""
                            }
                          }));
                        } else {
                          setDesignJSON((prev) => ({
                            ...prev,
                            options: {
                              ...prev.options,
                              [active]: opt   // collar / pants / pocket / aprons
                            },
                            optionKeys: {
                              ...prev.optionKeys,
                              [active]: optKey
                            }
                          }));
                        }
                      }} className={`p-2 rounded-lg shadow relative transition ${selected ? "ring-2 ring-[#1C4FA8]" : ""
                        }`}>
                        <img src={opt} className="w-full h-full object-cover" />

                        {selected && (
                          <span className="absolute top-1 right-1 bg-[#1C4FA8] rounded-full p-0.5">
                            <FiCheck size={11} className="text-white" />
                          </span>
                        )}

                        <p className="text-xs absolute bottom-1 left-1/2 -translate-x-1/2
                px-2 rounded-full bg-[#1C2C56] text-white">
                          {panels[active].title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {panels[active].type === "size" && (
                (!panels[active].data || panels[active].data.length === 0) ? (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    No size options available for this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {panels[active].data.map((size, i) => {
                      const isSelected = Boolean(designJSON.sizes[size]);
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            if (isSelected) {
                              decrement(size);
                            } else {
                              increment(size);
                            }
                          }}
                          className={`bg-white shadow-md rounded-xl px-3 py-3 flex items-center justify-center text-sm font-medium text-[#003560] hover:shadow-lg transition ${isSelected ? "ring-2 ring-blue-500" : ""
                            }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )
              )}

              {panels[active].type === "optionsLegy" && (
                <div className="grid grid-cols-3 gap-3">
                  {panels[active].data.map((opt, i) => (
                    <button
                      key={i}
                      className="p-2 border rounded-lg shadow"
                      onClick={() => onActive3dPartClick("bottom")}
                    >
                      <img src={opt} className="w-full" />
                    </button>
                  ))}
                </div>
              )}


              {panels[active].type === "optionsTops" && (
                <div className="grid grid-cols-3 gap-3">
                  {panels[active].data.map((opt, i) => (
                    <button key={i} className="p-2 border rounded-lg shadow" onClick={() => onActive3dPartClick("top")}
                    >
                      <img src={opt} className="w-full" />
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* CENTER MODEL VIEWER */}
        <div className="relative flex-1 flex flex-col items-center mt-0 w-full min-w-0">
          <div
            className="absolute top-28 w-[380px] h-[380px] rounded-full transition-colors duration-500 opacity-20 blur-3xl pointer-events-none"
          />

          {/* Product image (3D canvas is commented out). `unoptimized`: host isn't whitelisted in next.config. */}
          <div className="relative z-10 py-6 sm:py-10 md:py-12 flex justify-center items-center w-full max-w-[450px]">
            {/* Skeleton while loading, so the old fixed image doesn't flash on refresh. */}
            {simLoading ? (
              <div className="w-[300px] sm:w-[400px] md:w-[450px] max-w-full h-[380px] sm:h-[460px] md:h-[500px] rounded-2xl bg-[#F5F8FF] animate-pulse" />
            ) : (
              <Image
                src={imgSrc || "/img/uniform/uniform.png"}
                alt={simProduct?.productName || "Uniform"}
                width={450}
                height={800}
                className="w-auto h-auto max-h-[380px] sm:max-h-[460px] md:max-h-[520px] max-w-full object-contain mx-auto"
                unoptimized
                priority
                onError={() => setImgSrc("/img/uniform/uniform.png")}
              />
            )}
          </div>

          {(designJSON.colors.top || designJSON.colors.bottom) && (
            <div className="flex items-center gap-4 bg-white/95 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 text-xs text-gray-700 mb-2">
              {designJSON.colors.top && (
                <span className="flex items-center gap-1.5 font-medium">
                  <span>Top:</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-xs"
                    style={{ backgroundColor: designJSON.colors.top }}
                  />
                  <span className="text-[11px] text-gray-500 uppercase">{designJSON.colors.top}</span>
                </span>
              )}
              {designJSON.colors.bottom && (
                <span className="flex items-center gap-1.5 font-medium">
                  <span>Bottom:</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-xs"
                    style={{ backgroundColor: designJSON.colors.bottom }}
                  />
                  <span className="text-[11px] text-gray-500 uppercase">{designJSON.colors.bottom}</span>
                </span>
              )}
            </div>
          )}

          {/* BOTTOM TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 mb-8 w-full max-w-full px-2">
            <div className="z-20 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl px-3 py-2 flex items-center gap-2 sm:gap-3 md:gap-4 max-w-full overflow-x-auto whitespace-nowrap">
              <button className="p-1 rounded-md">
                <img src="/img/top-left-image/cursor.png" className="w-5 h-5 invert" />
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button className="p-1">
                <img src="/img/top-left-image/hand.png" className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button className="p-1" onClick={undoCamera}>
                <img src="/img/top-left-image/undo.png" className="w-5 h-5" />
              </button>
              <button className="p-1" onClick={redoCamera}>
                <img src="/img/top-left-image/redo.png" className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button className="p-1" onClick={zoomIn}>
                <span className="text-lg font-bold">+</span>
              </button>
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {zoomPercent}%
              </span>
              <button className="p-1" onClick={zoomOut}>
                <span className="text-lg font-bold">−</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button className="p-1 flex items-center gap-1 whitespace-nowrap" onClick={rotate90}>
                <img src="/img/top-left-image/rotate.png" className="w-5 h-5" />
                <span className="text-sm text-gray-700">90°</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button className="p-1 flex items-center gap-1 whitespace-nowrap">
                <img src="/img/top-left-image/Group.png" className="w-5 h-5" />
                <span className="text-sm text-gray-700">3D</span>
              </button>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center">
              <Button
                type="submit"
                variant="solid"
                loading={isSubmitting || isSaving}
                className="w-full sm:w-auto h-10 px-6 bg-[#1C4FA8] hover:bg-[#163f86] text-white py-2 rounded-xl whitespace-nowrap shadow-sm"
                onClick={handleUniformDesignResult}
              >
                Confirm Design
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Uniform3DmoduleDegisn

