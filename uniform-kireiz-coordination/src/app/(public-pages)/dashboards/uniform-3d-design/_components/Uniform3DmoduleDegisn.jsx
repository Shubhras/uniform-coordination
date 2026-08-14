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
import { apiGetSimulationOptions } from '@/services/SimulationService'
import { apiGetTemplateById } from '@/services/CategoryService'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'

const PANELS = {
  color: {
    title: "Color",
    type: "colors",
    data: ["#1A73E8", "#34A853", "#EA4335", "#FBBC05", "#FF7043", "#8E24AA", "#00ACC1", "#43A047", "#C2185B", "#6D4C41",]
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
  fabric: {
    title: "Fabric",
    type: "textures",
    data: [
      "/img/top-left-image/fabric/image 72.png",
      "/img/top-left-image/fabric/image 73.png",
      "/img/top-left-image/fabric/image 74.png",
      "/img/top-left-image/fabric/image 75.png",
      "/img/top-left-image/fabric/image 76.png",
      "/img/top-left-image/fabric/image 77.png",
      "/img/top-left-image/fabric/image 78.png",
      "/img/top-left-image/fabric/image 79.png",
      "/img/top-left-image/fabric/image 80.png",
      "/img/top-left-image/fabric/image 81.png",
      "/img/top-left-image/fabric/image 82.png",
      "/img/top-left-image/fabric/image 83.png",
      "/img/top-left-image/fabric/image 84.png",
      "/img/top-left-image/fabric/image 85.png",
      "/img/top-left-image/fabric/image 86.png",
      "/img/top-left-image/fabric/image 87.png",
      "/img/top-left-image/fabric/image 88.png",
      "/img/top-left-image/fabric/image 89.png",
      "/img/top-left-image/fabric/image 90.png",
      "/img/top-left-image/fabric/image 91.png",
      "/img/top-left-image/fabric/image 92.png",
      "/img/top-left-image/fabric/image 93.png",
      "/img/top-left-image/fabric/image 94.png",
      "/img/top-left-image/fabric/image 95.png",
      "/img/top-left-image/fabric/image 96.png",
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
    data: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
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

/*
 * Admin -> customer wiring for the customiser.
 *
 * Which tools appear in the left rail, and in what order, comes from
 * Admin -> Simulation Assets -> Simulation Structure for this product's category.
 * Colours come from the admin Colors table and fabrics from the admin Fabric table.
 * PANELS above stays as the fallback for attributes the admin has no data source for.
 */

// The admin types attribute names as free text, so match on substrings rather than
// exact strings — "Sleeve", "Sleeves" and "Sleeve Length" all mean the sleeve tool.
const ATTRIBUTE_TO_PANEL = [
  [["fabric", "material"], "fabric"],
  [["colour", "color"], "color"],
  // "part" before "pant": the two never overlap as substrings, but keeping them
  // adjacent makes it obvious they are different tools.
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

// Attributes the admin can enable that this customiser has no tool for — Style, Fit,
// Waist, Hem, Inner Mesh and anything else typed freehand. They are skipped rather
// than rendered as an empty panel, and reported in `unsupportedAttributes` so the gap
// is visible instead of silent.
const panelKeyFor = (attributeName) => {
  const n = (attributeName || "").toLowerCase();
  const hit = ATTRIBUTE_TO_PANEL.find(([needles]) => needles.some((x) => n.includes(x)));
  return hit ? hit[1] : null;
};

// A garment half is a property of the 3D model, not of the admin config: a collar tool
// makes no sense while the trousers are selected. Admin decides *whether* a tool is
// offered; this decides *when* it is reachable.
const PANEL_POSITIONS = {
  // Apply to any garment.
  color: ["top", "bottom"],
  size: ["top", "bottom"],
  fabric: ["top", "bottom"],
  pocket: ["top", "bottom"],
  parts: ["top", "bottom"],
  // Genuinely upper-body.
  top: ["top"],
  collar: ["top"],
  sleeves: ["top"],
  cap: ["top"],
  zipper: ["top"],
  cuff: ["top"],
  // Genuinely lower-body.
  pants: ["bottom"],
  aprons: ["bottom"],
  legy: ["bottom"],
};

// Stacked-layers glyph for the Parts tool. Drawn inline because there is no parts icon
// in /img/top-left-image, and the parts themselves are per-product so no fixed image
// would be right.
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
  const [counts, setCounts] = useState({});
  const [designJSON, setDesignJSON] = useState({
    colors: {
      top: "",
      bottom: ""
    },

    // Which admin colour row was picked per half. Kept alongside the hex because rows
    // can share a hex, so the value alone cannot identify the choice.
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

    sizes: {}   // ✅ quantity based sizes
  });


  const increment = (size) => {
    setCounts((prev) => ({
      ...prev,
      [size]: (prev[size] || 0) + 1
    }));

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
    uniformState.partColors[uniformState.active3dPart] = hex
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
  // Preset entries this product cannot offer, so the shopper is told rather than left to
  // wonder why the template looked different on the card.
  const [presetSkipped, setPresetSkipped] = useState([]);
  const [simLoading, setSimLoading] = useState(true);
  const [simBlocked, setSimBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAdminConfig = async () => {
      // No product in the URL: nothing to load, and leaving simLoading true would hold
      // the rail on its skeletons forever. The route without an id renders the product
      // picker instead, so this is only a safety net.
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

        // Which garment half this is, taken from the product rather than asked of the
        // shopper. A "set" covers both, so leave it on top and let the rail offer the
        // tools for either half.
        if (product.type === "bottom") setPosition("bottom");
        else setPosition("top");

        const categoryId = product.category?.id;
        if (!categoryId) return;

        const optionsRes = await apiGetSimulationOptions({ categoryId });
        if (cancelled || !optionsRes?.status) return;

        setSimAttributes(optionsRes.data?.attributes || []);
        setSimFabrics(optionsRes.data?.fabrics || []);
        setSimColors(optionsRes.data?.colors || []);
        setSimOptions(optionsRes.data?.attribute_options || {});

        // This product's own parts, with images and stacking order. product/get/ returns
        // parts without their images, so the layer data has to come from here.
        const row = (optionsRes.data?.products || []).find(
          (p) => String(p.id) === String(id),
        );
        setSimParts(row?.layers || []);
      } catch (err) {
        // Fall through to the static PANELS rather than leaving the customiser
        // with no tools at all.
        console.error("Failed to load admin simulation config:", err);
      } finally {
        if (!cancelled) setSimLoading(false);
      }
    };

    loadAdminConfig();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // PANELS, with colour and fabric swapped for the admin's own records. Attributes
  // the admin has no table for (Collar, Sleeves, Cap, ...) keep their static images —
  // the admin controls whether they appear, not what they contain.
  const panels = (() => {
    const merged = { ...PANELS };

    /*
     * Every colour the admin has, one swatch each — no deduping. Rows can share a hex
     * (two of the current ones are both #7e3e3e), and they are still separate admin
     * records, so hiding one would mean the customer sees fewer colours than the admin
     * configured.
     *
     * Each entry carries a stable `key`, and selection is tracked by that key rather
     * than by colour value. Comparing by hex made every row sharing a hex tick at once.
     */
    const adminColors = simColors
      .filter((c) => (c.code || "").trim())
      .map((c) => ({
        key: `c${c.id}`,
        code: (c.code || "").trim(),
        name: c.name,
      }));

    merged.color = {
      ...PANELS.color,
      data: adminColors.length
        ? adminColors
        : // Static fallback: same shape, so the renderer has one case to handle.
        PANELS.color.data.map((hex, i) => ({ key: `s${i}`, code: hex, name: hex })),
    };

    /*
     * Admin-managed choices per attribute. Where the admin has options for a tool they
     * replace the artwork bundled in PANELS above; where there are none, the static list
     * stays so the tool is never left empty.
     *
     * Size is a list of labels, the rest are pictures, so they render differently.
     */
    Object.entries(simOptions).forEach(([key, options]) => {
      if (!options?.length || !merged[key]) return;

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

    // Parts are per product, not a fixed list, so there is no static fallback for this
    // one — no parts configured means no Parts tool.
    if (simParts.length) {
      merged.parts = {
        title: "Parts",
        type: "parts",
        data: simParts,
      };
    }

    if (simFabrics.length) {
      merged.fabric = {
        title: "Fabric",
        // Distinct type: admin fabrics carry no swatch image (the Fabric model has no
        // image field), so they render as name + colour chip instead of a texture tile.
        type: "fabricRecords",
        data: simFabrics,
      };
    }

    return merged;
  })();

  // Tools the admin enabled for this category, in the admin's order, limited to the
  // ones that apply to the garment half currently selected.
  const railKeys = (() => {
    // Nothing until the admin config has landed. Rendering the fallback first would
    // flash a full set of tools and then drop to the admin's shorter list.
    if (simLoading) return [];

    const fromAdmin = simAttributes
      .map((a) => panelKeyFor(a.attribute))
      .filter(Boolean);

    // When the admin has configured this category, show exactly that — no extra
    // filtering by garment half. Simulation Structure is defined per category, and a
    // category holds both tops and bottoms, so the admin has no way to say "Collar for
    // tops only". Second-guessing the toggle here would make it look broken: the admin
    // ticks Collar, nothing appears, and nothing explains why.
    if (fromAdmin.length) {
      return [...new Set(fromAdmin)].filter((k) => panels[k]);
    }

    // No structure saved for this category — fall back to the built-in set, and here the
    // garment half is worth honouring since nobody has expressed an intent to respect.
    return ["color", "size", "fabric", "collar", "sleeves", "cap", "zipper", "cuff", "pants", "pocket", "aprons"]
      .filter(
        (k) =>
          panels[k] &&
          (simProduct?.type === "set" ||
            (PANEL_POSITIONS[k] || []).includes(position)),
      );
  })();

  const unsupportedAttributes = simAttributes
    .filter((a) => !panelKeyFor(a.attribute))
    .map((a) => a.attribute);

  // Keyed on a joined string because railKeys is rebuilt on every render.
  const railKey = railKeys.join(",");

  /*
   * Apply the template the shopper arrived with.
   *
   * Runs once the admin config has landed, because a preset is only applied when this
   * product actually offers that tool — the rail is built from the attributes the admin
   * enabled for the category, and a colour preset is pointless if Colour is not among
   * them. Anything dropped is collected in `presetSkipped` and shown, rather than the
   * shopper silently getting a different look from the one on the template card.
   */
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

      // Colour: stored per garment half, so it goes on the half this product is.
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

      // Fabric: admin fabrics are scoped per category, so a preset from elsewhere may
      // simply not be on offer here.
      if (tpl.preset_fabric) {
        const known = simFabrics.some((f) => f.id === tpl.preset_fabric);
        if (available.has("fabric") && known) {
          patch.fabric = tpl.presetFabricName;
        } else {
          skipped.push(`Fabric (${tpl.presetFabricName || "preset"})`);
        }
      }

      // Part: templates name a starting part, which only exists on some products.
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

    // The shopper's real choices. This used to send fixed sample values
    // (grey / M / cotton, "My Brand"), so everything picked in the customiser was
    // collected into designJSON and then thrown away — which left the Design Result
    // screen with nothing to render.
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


  // The admin can withdraw a product from the simulation. Reaching the customiser by
  // URL must not get around that, so this stops before any tool is rendered.
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
    <section className="w-full mx-auto bg-white flex flex-col px-6 lg:px-4 py-4 gap-10 mt-11 ">
      {/*
        Which template the shopper started from. The product's own image stays on the
        canvas — the template is a style, not a different garment — so this strip is what
        tells them the style was applied, and what could not be.
      */}
      {template && (
        <div className="w-full border border-[#C7D7F5] bg-[#F5F8FF] rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm font-medium text-[#1C2C56]">
            Using template: {template.templateName}
          </span>

          {presetSkipped.length > 0 && (
            <span className="text-xs text-amber-700">
              Not available on this uniform: {presetSkipped.join(", ")}
            </span>
          )}

          <button
            type="button"
            onClick={() => router.push(`/dashboards/uniform-3d-design/${id}`)}
            className="ml-auto text-xs text-[#1C4FA8] underline"
          >
            Clear template
          </button>
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-[80px] flex flex-col items-center" >
          {/*
            The Top / Bottom picker used to sit here. Removed: the product already
            records which half it is (Product.type = top | bottom | set), so `position`
            is derived from it instead of asked of the shopper.
          */}

          {/* Left rail: one tool per attribute the admin enabled, in the admin's order. */}
          <div className="flex flex-col gap-2 w-full">
            {railKeys.map((key) => {
              const meta = RAIL_META[key];
              if (!meta) return null;
              return (
                <button
                  key={key}
                  onClick={() => onIconClick(key)}
                  className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === key ? "ring-2 ring-blue-500" : ""
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
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-[70px] h-[70px] bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {!simLoading && railKeys.length === 0 && (
              <p className="w-[70px] text-[10px] leading-tight text-gray-500">
                No {position} options enabled for this category.
              </p>
            )}

            {/*
              Attributes the admin enabled that this customiser has no tool for.
              Shown rather than dropped silently, so the mismatch is visible to
              whoever is testing instead of looking like the admin toggle did nothing.
            */}
            {!simLoading && unsupportedAttributes.length > 0 && (
              <p className="w-[70px] text-[9px] leading-tight text-amber-700">
                No tool yet: {unsupportedAttributes.join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="relative ">
          {panels[active] && (
            <div
              ref={panelRef}
              className="absolute top-0 left-0 z-30 w-[275px] bg-white shadow-xl rounded-xl p-3">
              {/* <h5 className="font-semibold text-gray-700 mb-2">
                {panels[active].title}
              </h5> */}
              {panels[active].type === "colors" && (
                // <div className="grid grid-cols-5 gap-3 relative">
                <div className="grid grid-cols-4 gap-3 relative">
                  {/* <button
                    onClick={() => setShowColorPicker(true)}
                    className="w-10 h-10 rounded-full"
                  >
                    <img
                      src="/img/top-left-image/color-wheel.png"
                      className="w-12"
                    />
                  </button> */}

                  {panels[active].data.map((swatch) => {
                    // By key, not by colour value: several admin rows can hold the same
                    // hex, and comparing values ticked all of them together. Colour is
                    // chosen per garment half, so the key is read for the active half.
                    const selected = designJSON.colorKeys?.[position] === swatch.key;
                    return (
                      <button
                        key={swatch.key}
                        onClick={() => {
                          applyBaseColorToModel(swatch.code);
                          setColor(swatch.code);

                          // ✅ Only Top & Bottom colors allowed
                          const jsonPart = uniformState.active3dPart;

                          setDesignJSON((prev) => ({
                            ...prev,
                            colors: {
                              ...prev.colors,
                              [jsonPart]: swatch.code
                            },
                            colorKeys: {
                              ...prev.colorKeys,
                              [jsonPart]: swatch.key
                            }
                          }));
                        }}
                        title={swatch.name || swatch.code}
                        className={`relative w-10 h-10 rounded-full shadow flex items-center justify-center transition ${selected
                          ? "ring-2 ring-offset-2 ring-[#1C4FA8] border-0"
                          : "border"
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
              )}

              {showColorPicker && (
                <ColorPickerPopup
                  value={color}
                  onChange={(newColor) => {
                    setColor(newColor)
                    applyBaseColorToModel(newColor)
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
                            setDesignJSON((prev) => ({
                              ...prev,
                              fabric: tex
                            }));
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

              {/*
                The product's parts, as the admin built it under Simulation Assets.
                Shown top of the stack first so the list reads the way the garment is
                layered. Selecting one records it on the design.
              */}
              {panels[active].type === "parts" && (
                <div className="w-full max-h-[280px] overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {[...panels[active].data].reverse().map((part) => {
                      const selected = designJSON.part === part.name;
                      return (
                        <button
                          key={part.id}
                          onClick={() => {
                            setDesignJSON((prev) => ({
                              ...prev,
                              part: part.name,
                            }));
                          }}
                          className={`w-full flex items-center gap-3 rounded-md border p-2 text-left transition ${selected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-500"
                            }`}
                        >
                          <span className="w-11 h-11 flex-shrink-0 rounded bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                            {part.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={part.image}
                                alt={part.name}
                                className="w-full h-full object-contain"
                              />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-medium text-[#1C2A4A] truncate">
                              {part.name}
                            </span>
                            <span className="block text-[10px] text-gray-500 truncate">
                              {part.fabric || "—"}
                            </span>
                          </span>
                          {selected && (
                            <FiCheck size={16} className="text-[#1C4FA8] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/*
                Admin fabrics. The Fabric model has no image field, so there is no
                texture tile to show — name, material and the colour it records are all
                the admin actually stores. Painting an invented swatch would show the
                shopper something the catalogue does not contain.
              */}
              {panels[active].type === "fabricRecords" && (
                <div className="w-full max-h-[280px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    {panels[active].data.map((fabric) => {
                      const selected = designJSON.fabric === fabric.name;
                      return (
                        <button
                          key={fabric.id}
                          onClick={() => {
                            setDesignJSON((prev) => ({
                              ...prev,
                              fabric: fabric.name,
                            }));
                          }}
                          className={`flex items-center gap-2 rounded-md border p-2 text-left transition ${selected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-500"
                            }`}
                        >
                          <span
                            className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                            style={
                              fabric.swatch
                                ? { background: fabric.swatch }
                                : { background: "repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9 4px,#e2e8f0 4px,#e2e8f0 8px)" }
                            }
                            title={fabric.swatch ? fabric.color : `Colour recorded as "${fabric.color}"`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-medium text-[#1C2A4A] truncate">
                              {fabric.name}
                            </span>
                            <span className="block text-[10px] text-gray-500 capitalize truncate">
                              {fabric.material_type || "—"}
                            </span>
                          </span>
                          {selected && (
                            <FiCheck size={14} className="text-[#1C4FA8] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/*
                Admin-managed choices for this tool. Same tile layout as the bundled
                options, but each one carries a name the admin typed, so it is labelled
                rather than left as an unexplained picture.
              */}
              {panels[active].type === "adminOptions" && (
                <div className="w-full max-h-[300px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-3 gap-3">
                    {panels[active].data.map((opt) => {
                      const selected = designJSON.options?.[active] === opt.name;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setDesignJSON((prev) => ({
                              ...prev,
                              options: {
                                ...prev.options,
                                [active]: opt.name,
                              },
                            }));
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
                    const selected = designJSON.options?.[active] === opt;
                    return (
                      <button key={i} onClick={() => {
                        setDesignJSON((prev) => ({
                          ...prev,
                          options: {
                            ...prev.options,
                            [active]: opt   // collar / pants / pocket / aprons
                          }
                        }));
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
                <div className="grid grid-cols-4 gap-3">
                  {panels[active].data.map((size, i) => {
                    const isSelected = Boolean(counts[size]);
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
        <div className="relative flex-1 flex flex-col items-center mt-0">
          <div className="absolute top-30 w-[400px] h-[400px] rounded-full"></div>
          {/* {mounted && (
                        <model-viewer
                            ref={mvRef}
                            src={modelSrc}
                            alt="3D Uniform Model"
                            camera-controls
                            auto-rotate={autoRotate}
                            environment-image="neutral"
                            disable-tap
                            style={{
                                height: '650px',
                                background: 'transparent',
                            }}
                        />
                    )} */}

          {/* <UniformCanvas /> */}
          {/*
            The product's own catalogue image. The 3D canvas above is commented out, so
            this is what the shopper actually sees — it used to be a fixed doctor PNG,
            which showed the wrong garment for every product.

            `unoptimized` because these come from the API host at runtime; the Next image
            optimiser would need each host whitelisted in next.config.
          */}
          <div className="relative z-10 py-16">
            {/* Nothing stand-in while the product loads. Rendering the fallback image
                straight away flashed the old fixed doctor picture on every refresh
                before the real product arrived. */}
            {simLoading ? (
              <div className="w-[450px] max-w-full h-[500px] rounded-2xl bg-[#F5F8FF] animate-pulse" />
            ) : (
              <Image
                src={simProduct?.ProductImage || "/img/uniform/uniform.png"}
                alt={simProduct?.productName || "Uniform"}
                width={450}
                height={800}
                className="object-contain"
                unoptimized
                priority
              />
            )}
          </div>

          {/* <div className="absolute top-[-10] w-[360px] h-[360px] bg-[#BEE0FF] rounded-full"></div>
                    <div className="relative z-10">
                        <Image
                            src="/img/uniform/uniform.png"
                            alt="Uniform"
                            width={350}
                            height={500}
                            className="object-contain"
                            priority
                        />
                    </div> */}
          {/* BOTTOM TOOLBAR */}
          {/* <div className="absolute bottom-[100px] flex"> */}
          <div className="
              flex
              mt-6
              mb-10
            ">
            <div className="z-20 mt-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl px-3 py-2 flex items-center gap-4">
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
              <span className="text-sm font-semibold text-gray-700">
                {zoomPercent}%
              </span>
              <button className="p-1" onClick={zoomOut}>
                <span className="text-lg font-bold">−</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button className="p-1 flex items-center gap-1" onClick={rotate90}>
                <img src="/img/top-left-image/rotate.png" className="w-5 h-5" />
                <span className="text-sm text-gray-700">90°</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button className="p-1 flex items-center gap-1">
                <img src="/img/top-left-image/Group.png" className="w-5 h-5" />
                <span className="text-sm text-gray-700">3D</span>
              </button>
            </div>
            <div>
              <Button
                type="submit"
                variant="solid"
                loading={isSubmitting || isSaving}
                className="w-full h-10 ml-10 mt-8 bg-[#1C4FA8] hover:bg-[#1C4FA8] text-white py-2" onClick={handleUniformDesignResult}
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


