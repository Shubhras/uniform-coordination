'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

if (typeof window !== 'undefined') {
  import('@google/model-viewer')
}
// import ColorPickerPopup from './ColorPickerPopup'
// const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
// const SAMPLE_MODEL = '/img/3dmodels/doctor_uniform.glb'
//const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
import Button from '@/components/ui/Button';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { RiTable2 } from 'react-icons/ri'
import { TbTable } from 'react-icons/tb'
import { IoIosArrowForward } from 'react-icons/io'
import { FiMinus, FiPlus } from "react-icons/fi";
import { apiModelInfoCreate, apiSaveDesign, apiSaveThemeDesign } from '@/services/SaveDesignService'
import { useSession } from 'next-auth/react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetProductDetailsById, apiGetSimulationCategories, apiGetSimulationOptions } from '@/services/ProductService'
import { apiGetSindleThemeDetails } from '@/services/HomeService'
/**
 * Uniform3DmoduleDegisn Component
 *
 * Handles the 3D table customization workflow, including product and theme
 * loading, design configuration, model creation, and design saving.
 */
const ATTRIBUTE_OPTIONS = {
  "Fabric": [
    { name: "Crushed Velvet", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "Damask Linen", img: "/img/table-form/tablecloth/fabric2.png" },
    { name: "Gingham Cotton", img: "/img/table-form/tablecloth/fabric3.png" },
    { name: "Raw Silk Dupioni", img: "/img/table-form/tablecloth/fabric4.png" },
  ],
  "Material": [
    { name: "Porcelain", img: "/img/table-form/tableware/porcelain.png" },
    { name: "Bone China", img: "/img/table-form/tableware/bone-china.png" },
    { name: "Glass", img: "/img/table-form/tableware/glass.png" },
    { name: "Crystal", img: "/img/table-form/tableware/crystal.png" },
    { name: "Silk", img: "/img/table-form/decor/silk.png" },
    { name: "Satin", img: "/img/table-form/decor/satin.png" },
    { name: "Lace", img: "/img/table-form/decor/lace.png" },
    { name: "Velvet", img: "/img/table-form/decor/velvet.png" },
  ],
  "Style": [
    { name: "Round", img: "/img/table-form/table-style/style-round.png" },
    { name: "Square", img: "/img/table-form/table-style/style-square.png" },
    { name: "Rectangle", img: "/img/table-form/table-style/style-rectangle.png" },
    { name: "Oval", img: "/img/table-form/table-style/style-oval.png" },
    { name: "Floral Arrangement", img: "/img/table-form/centre-pieces/style-floral-arrangement.png" },
    { name: "Candle Centerpiece", img: "/img/table-form/centre-pieces/style-candle-centerpiece.png" },
    { name: "Fruit Bowl", img: "/img/table-form/centre-pieces/style-fruit-bowl.png" },
    { name: "Modern Sculpture", img: "/img/table-form/centre-pieces/style-modern-sculpture.png" },
  ],
  "Item Type": [
    { name: "Chair Sash", img: "/img/table-form/decor/type-chair-sash.png" },
    { name: "Table Runner", img: "/img/table-form/decor/type-table-runner.png" },
    { name: "Place Cards", img: "/img/table-form/decor/type-place-cards.png" },
    { name: "Menu Cards", img: "/img/table-form/decor/type-menu-cards.png" },
  ],
  "Set Type": [
    { name: "Formal Dinner", img: "/img/table-form/tableware/set-formal-dinner.png" },
    { name: "Casual Dining", img: "/img/table-form/tableware/set-casual-dining.png" },
    { name: "Buffet Style", img: "/img/table-form/tableware/set-buffet-style.png" },
    { name: "Banquet", img: "/img/table-form/tableware/set-banquet.png" },
  ],
  "Fit Type": [
    { name: "Standard Fit", img: "/img/table-form/table-style/style-round.png" },
    { name: "Loose Drape", img: "/img/table-form/table-style/style-square.png" },
  ],
  "Stretch": [
    { name: "Yes", img: "/img/table-form/table-style/style-round.png" },
    { name: "No", img: "/img/table-form/table-style/style-square.png" },
  ],
  "Fold Style": [
    { name: "Classic Fold", img: "/img/table-form/table-style/style-round.png" },
    { name: "Pocket Fold", img: "/img/table-form/table-style/style-square.png" },
  ],
  "Color": [
    { name: "White", img: "/img/table-form/color-table/color-white.png" },
    { name: "Ivory", img: "/img/table-form/color-table/color-ivory.png" },
    { name: "Taupe", img: "/img/table-form/color-table/color-taupe.png" },
    { name: "Blush", img: "/img/table-form/color-table/color-blush.png" },
    { name: "Burgundy", img: "/img/table-form/color-table/color-burgundy.png" },
    { name: "Gold", img: "/img/table-form/centre-pieces/color-gold.png" },
    { name: "Silver", img: "/img/table-form/centre-pieces/color-silver.png" },
    { name: "Crystal", img: "/img/table-form/centre-pieces/color-crystal.png" },
    { name: "Rose Gold", img: "/img/table-form/centre-pieces/color-rose-gold.png" },
    { name: "Navy", img: "/img/table-form/decor/color-navy.png" },
    { name: "Champagne", img: "/img/table-form/napkins/color-champagne.png" },
    { name: "Dusty Rose", img: "/img/table-form/napkins/color-dusty-rose.png" },
    { name: "Peach", img: "/img/table-form/napkins/color-peach.png" },
    { name: "Coral", img: "/img/table-form/napkins/color-coral.png" },
    { name: "Beige", img: "/img/table-form/chair-cover/color-beige.png" },
  ],
  "Size": [
    { name: "Standard", img: "/img/table-form/table-style/style-round.png" },
    { name: "Large", img: "/img/table-form/table-style/style-square.png" },
    { name: "Oversized", img: "/img/table-form/table-style/style-rectangle.png" },
  ],
  "Pattern": [
    { name: "Plain", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "Striped", img: "/img/table-form/tablecloth/fabric2.png" },
    { name: "Damask", img: "/img/table-form/tablecloth/fabric3.png" },
  ],
  "Closure": [
    { name: "Bow Tie", img: "/img/table-form/chair-cover/color-white.png" },
    { name: "Spandex Band", img: "/img/table-form/chair-cover/color-ivory.png" },
    { name: "Knot", img: "/img/table-form/chair-cover/color-beige.png" },
  ],
  "Trim": [
    { name: "Lace Border", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "Satin Edge", img: "/img/table-form/tablecloth/fabric2.png" },
    { name: "No Trim", img: "/img/table-form/tablecloth/fabric3.png" },
  ],
  "Height": [
    { name: "Low Profile", img: "/img/table-form/centre-pieces/style-floral-arrangement.png" },
    { name: "Medium Height", img: "/img/table-form/centre-pieces/style-candle-centerpiece.png" },
    { name: "Tall & Elegant", img: "/img/table-form/centre-pieces/style-modern-sculpture.png" },
  ],
  "Flowers": [
    { name: "Roses", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "Lilies", img: "/img/table-form/tablecloth/fabric2.png" },
    { name: "Mixed Bouquet", img: "/img/table-form/tablecloth/fabric3.png" },
  ],
  "Base Type": [
    { name: "Glass Vase", img: "/img/table-form/centre-pieces/color-crystal.png" },
    { name: "Gold Pedestal", img: "/img/table-form/centre-pieces/color-gold.png" },
    { name: "Silver Stand", img: "/img/table-form/centre-pieces/color-silver.png" },
  ],
  "Finish": [
    { name: "Glossy", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "Matte", img: "/img/table-form/tablecloth/fabric2.png" },
  ],
  "Collection": [
    { name: "Classic Collection", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "Modern Collection", img: "/img/table-form/tablecloth/fabric2.png" },
  ],
  "Pieces": [
    { name: "3-Piece Set", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "5-Piece Set", img: "/img/table-form/tablecloth/fabric2.png" },
  ],
  "Placement": [
    { name: "Center Alignment", img: "/img/table-form/tablecloth/fabric1.png" },
    { name: "Side Alignment", img: "/img/table-form/tablecloth/fabric2.png" },
  ],
  "Table Centrepiece": [
    { name: "Beige", img: "/img/table-form/centre-piece/beige.png" },
    { name: "Navy", img: "/img/table-form/centre-piece/navy.png" },
    { name: "Green", img: "/img/table-form/centre-piece/green.png" },
  ],
};

const ATTRIBUTE_API_MAPPING = {
  "Fabric": "fabrics",
  "Color": "colors",
  "Style": "styles",
  "Size": "sizes"
};

const Uniform3DmoduleDegisn = () => {
  const searchParams = useSearchParams()
  // product id
  const { id } = useParams();
  // theme id
  const themeIdParam = searchParams.get('themeId')
  const [singleProductData, setSingleProductData] = useState(null)
  const { data: session } = useSession();
  const [tableSitting, setTableSitting] = useState(6)
  const [categoryView, setCategoryView] = useState("list"); // list | tablecloths
  const [simulationCategories, setSimulationCategories] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [categoryOptions, setCategoryOptions] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter()
  const [active, setActive] = useState('tableShape')
  const panelRef = useRef(null)
  const [fullView, setFullView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState({
    title: 'Loading Theme...',
    description: 'Please wait while we load the theme details.',
    gallery: ['/img/table-form/full-venue.png'],
    packageLabel: 'Items Included',
    packageValueLabel: 'Estimated Package Value',
    priceLabel: 'Price TBD',
    cardImage: '/img/table-form/full-venue.png',
    items: [
      { title: 'Table Setup', items: [] },
      { title: 'Floral & Decor', items: [] },
      { title: 'Seating', items: [] },
      { title: 'Additional Elements', items: [] }
    ]
  })
  const [tableShape, setTableShape] = useState("Circle");
  const [tableScale, setTableScale] = useState(300);



  function onIconClick(key) {
    setActive(prev => {
      if (prev === key) {
        return ''
      }
      return key
    })
  }

  useEffect(() => {
    const fetchSimulationCategories = async () => {
      try {
        const res = await apiGetSimulationCategories()
        if (res && res.status === true && Array.isArray(res.data)) {
          setSimulationCategories(res.data)
          
          // Pre-populate default selected options for attributes
          const initialOptions = {}
          res.data.forEach(cat => {
            initialOptions[cat.name] = {}
            cat.attributes.forEach(attr => {
              if (attr.enabled) {
                // Pick the first option by default
                const options = ATTRIBUTE_OPTIONS[attr.attribute] || [];
                if (options.length > 0) {
                  initialOptions[cat.name][attr.attribute] = options[0].name;
                }
              }
            })
          })
          setSelectedOptions(initialOptions)
        }
      } catch (error) {
        console.error("Error fetching simulation categories:", error)
      }
    }
    fetchSimulationCategories()
  }, [])

  // Fetch options dynamically when a category is selected or table shape changes
  useEffect(() => {
    if (categoryView && categoryView !== "list") {
      const fetchOptions = async () => {
        try {
          const res = await apiGetSimulationOptions(categoryView, tableShape);
          if (res && res.status === true && res.data) {
            setCategoryOptions(prev => ({
              ...prev,
              [categoryView]: res.data
            }));

            // Pre-populate selections for this category if not already present
            const selectedCat = simulationCategories.find(c => c.name === categoryView);
            if (selectedCat) {
              setSelectedOptions(prev => {
                const currentCatOptions = prev[categoryView] || {};
                let updated = false;

                selectedCat.attributes.forEach(attr => {
                  if (attr.enabled && !currentCatOptions[attr.attribute]) {
                    const attrKey = ATTRIBUTE_API_MAPPING[attr.attribute];
                    const dynamicOptions = res.data[attrKey] || [];
                    if (dynamicOptions.length > 0) {
                      currentCatOptions[attr.attribute] = dynamicOptions[0].label;
                      updated = true;
                    } else {
                      const staticOpts = ATTRIBUTE_OPTIONS[attr.attribute] || [];
                      if (staticOpts.length > 0) {
                        currentCatOptions[attr.attribute] = staticOpts[0].name;
                        updated = true;
                      }
                    }
                  }
                });

                if (updated) {
                  return {
                    ...prev,
                    [categoryView]: currentCatOptions
                  };
                }
                return prev;
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching options for category ${categoryView}:`, error);
        }
      };
      fetchOptions();
    }
  }, [categoryView, tableShape, simulationCategories]);

  useEffect(() => {
    import('@google/model-viewer').catch((err) => {
      console.error('Failed to load @google/model-viewer:', err)
    })
  }, [])

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        setSingleProductData(null)

        const res = await apiGetProductDetailsById(id)

        if (res?.status && res?.data) {
          setSingleProductData(res.data)
          setSelectedTheme((prev) => ({
            ...prev,
            cardImage: res.data?.ProductImage || prev.cardImage,
          }));
        } else {
          toast.push(
            <Notification title="Error!" type="danger">
              {res?.message || 'Product not found'}
            </Notification>
          )
        }
      } catch (err) {
        toast.push(
          <Notification title="Error!" type="danger">
            Failed to load product detail
          </Notification>
        )
        console.error("Failed to load product detail", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProductDetails()
  }, [id])

  /** Fetch theme details if themeId is provided in URL params */
  useEffect(() => {
    const fetchThemeDetails = async () => {
      if (!themeIdParam) return;
      try {
        const response = await apiGetSindleThemeDetails(themeIdParam);
        if (response?.status && response?.data) {
          const apiData = response.data;
          // const imageUrl = apiData.cover_images?.length > 0
          //   ? apiData.cover_images[0].image
          //   : (apiData.image || apiData.ProductImage);
          setSelectedTheme((prev) => ({
            ...prev,
            // ...apiData,
            cardImage: apiData?.image || prev.cardImage,
          }));
        }
      } catch (error) {
        console.error("Error fetching theme details:", error);
      }
    };
    if (themeIdParam) fetchThemeDetails();
  }, [themeIdParam])

  /** Initialize and submit 3D model info payload */
  const handleUniformDesignResult = async () => {
    if (!session?.accessToken) {
      toast.push(
        <Notification title="Login Required" type="warning">
          Please sign in first to continue.
        </Notification>
      );
      return;
    }

    setIsSubmitting(true);

    if (themeIdParam) {
      // Theme Simulation Mode
      const payload = {
        user: session?.user?.id,
        theme: parseInt(themeIdParam, 10),
        config_json: {
          table_shape: tableShape,
          table_scale: String(tableScale),
          table_sitting: String(tableSitting),
        },
        design_specifications: selectedOptions,
        isActive: true,
      };

      try {
        const response = await apiSaveThemeDesign(payload, session.accessToken);
        if (response?.status) {
          toast.push(
            <Notification title="Success!" type="success">
              Theme design saved successfully
            </Notification>
          );
          const customThemeId = response.data?.id;
          router.push(`/dashboards/theme-design-result/${customThemeId}`);
        } else {
          toast.push(
            <Notification title="Error!" type="danger">
              {response?.message || "Failed to save theme design"}
            </Notification>
          );
        }
      } catch (error) {
        console.error("Save Theme Design Error:", error);
        toast.push(
          <Notification title="Error!" type="danger">
            Something went wrong saving theme design.
          </Notification>
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Product Simulation Mode (original logic)
    let productId = id || "";
    const formData = new FormData();
    formData.append("product", productId);
    formData.append("theme_id", "");
    formData.append("model_file", "");
    formData.append("description", "School uniform 3D model");

    try {
      const response = await apiModelInfoCreate(formData, session?.accessToken);

      if (response?.status) {
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


  /** Save complete design specification payload and navigate to result page */
  const handleSaveDesign = async (modelId) => {
    if (!session?.accessToken) {
      toast.push(
        <Notification title="Login Required" type="warning">
          Please sign in first to continue.
        </Notification>
      );
      return;
    }
    setIsSaving(true);

    const payload = {
      user: session?.user?.id,
      model_info: modelId,
      config_json: {
        color: "grey",
        size: "M",
        material: "cotton",
      },
      design_specifications: {
        logo_position: "front",
        print_type: "embroidery",
        text: "My Brand",
        size: singleProductData?.size,
        table_shape: singleProductData?.table_shape,
        style: singleProductData?.style,
        fabric_details: singleProductData?.fabric_details,
        color_details: singleProductData?.color_details,
        category: singleProductData?.category,
        subcategory: singleProductData?.subcategory,
        parts: singleProductData?.parts,
      },
      json_file_path: "uploads/configs/user6_model3.json",
      isActive: true
    };

    try {
      const response = await apiSaveDesign(payload, session.accessToken);
      toast.push(
        <Notification title="Success!" type="success">
          Design saved successfully
        </Notification>
      );

      const id = response?.data?.id;  // custom update model id
      // Redirect to result page
      router.push(`/dashboards/design-result/${id}`);
      // router.push("/cart-summary");

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
  return (
    <section className="w-full mx-auto bg-white flex flex-col px-6 lg:px-4 py-4 gap-10 mt-15">
      <div className="flex gap-6">
        {/* Left Toolbar: Navigation Selector */}
        <div className="w-[80px] flex flex-col items-center gap-4 py-4">
          {[
            { key: "tableShape", label: "Table Shape", img: "/img/top-left-image/collar.png" },
            { key: "category", label: "Categories", img: "/img/top-left-image/sleeves.png" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => onIconClick(item.key)}
              className={`w-[75px] h-[100px] rounded-lg p-2 flex flex-col justify-center items-center transition ${active === item.key
                ? "border-l-[0px] border-b-[0px] border-t-[3.5px] border-r-[3.5px] border-[#A0522D]  shadow-md"
                : "bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
                }`}
            >
              <img src={item.img} className="w-8 h-8 object-contain mb-1" alt={item.label} />
              <span className={`text-xs font-medium text-center leading-tight ${active === item.key ? "font-semibold" : "text-gray-600"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Configuration Side Panel */}
        <div className="max-w-sm py-4">
          {/* Panel Option 1: Table Shape & Seating Options */}
          {active === "tableShape" && (
            <div
              ref={panelRef}
              className="w-full h-full bg-[#FFF5F1] border border-[#F3D3C8] rounded-2xl p-5 shadow-lg"
            >
              {/* Table Shape Selector */}
              <div className="mb-6">
                <p className="text-sm text-[#1C2C56] block mb-1">
                  Table Shape
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Circle", img: "/img/table-form/table-shape/round.png" },
                    { name: "Rectangle", img: "/img/table-form/table-shape/rectangle.png" },
                    { name: "Square", img: "/img/table-form/table-shape/square.png" },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setTableShape(item.name)}
                      className="relative"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className={`rounded-sm object-contain border p-2 w-full border-[#A0522D4D] h-[70px]
                          ${tableShape === item.name ? "bg-[#A0522D33] border-[#A0522D4D]" : "bg-white"}`}
                      />

                      {/* Selected Item Indicator */}
                      {tableShape === item.name && (
                        <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                          ✓
                        </span>
                      )}

                      <p className="text-[10px] mt-1 text-center">
                        {item.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Scale Adjustment */}
              <div className="mb-6">
                <label className="text-sm text-[#1C2C56] font-medium block mb-2">
                  Table Scale
                </label>
                <div className="relative w-full flex items-center h-6">
                  {/* Track Background */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-[#A0522D] rounded-full transition-all duration-75"
                      style={{ width: `${((tableScale - 100) / 400) * 100}%` }}
                    />
                  </div>
                  {/* Custom Circular Thumb */}
                  <div
                    className="absolute w-5 h-5 bg-white border-2 border-[#A0522D] rounded-full shadow-md pointer-events-none transition-all duration-75 -ml-2.5 top-1/2 -translate-y-1/2"
                    style={{ left: `${((tableScale - 100) / 400) * 100}%` }}
                  />
                  {/* Interactive Range Input */}
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={tableScale}
                    onChange={(e) => setTableScale(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>

              {/* Table Seating Count Control */}
              <div className="mb-6 flex justify-between items-center">
                <label className="text-sm text-[#1C2C56] block">
                  Table Sitting
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTableSitting((prev) => Math.max(2, prev - 1))
                    }
                    className="w-8 h-8 flex items-center justify-center border border-[#E6B8A2] rounded-md bg-white text-[#A0522D]"
                  >
                    <FiMinus size={14} />
                  </button>

                  <span className="text-sm font-medium text-[#1C2C56]">
                    {tableSitting}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setTableSitting((prev) => Math.min(8, prev + 1))
                    }
                    className="w-8 h-8 flex items-center justify-center border border-[#E6B8A2] rounded-md bg-white text-[#A0522D]"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              {/* Interactive Tip Banner */}
              <div className="bg-[#FFF] border border-[#F3D3C8] rounded-xl p-3 text-xs text-gray-600">
                <span className="font-medium text-[#A0522D]">💡 Tip:</span>
                <p className="mt-1 leading-relaxed">
                  Select an item on the table to edit its properties,
                  or drag items from the left sidebar onto the table.
                </p>
              </div>
            </div>
          )}

          {active === "category" && (
            <div
              ref={panelRef}
              className="min-w-sm h-[calc(100vh-178px)] overflow-y-auto overflow-x-hidden bg-[#FFF5F1] border border-[#F3D3C8] rounded-2xl p-5 shadow-lg custom-scroll"
            >
              <h4 className="text-sm font-semibold text-[#1C2C56] mb-4">
                Categories & Inventory
              </h4>

              {categoryView === "list" && (
                <div className="space-y-3 w-full">
                  {simulationCategories.map(item => (
                    <button
                      key={item.name}
                      onClick={() => setCategoryView(item.name)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img src={item.icon} className="w-6 h-6 object-contain" />
                        <span>{item.name}</span>
                      </div>
                      <IoIosArrowForward />
                    </button>
                  ))}
                </div>
              )}

              {categoryView !== "list" && (() => {
                const selectedCat = simulationCategories.find(c => c.name === categoryView);
                if (!selectedCat) return null;

                return (
                  <div className="space-y-6">
                    {/* HEADER */}
                    <button
                      onClick={() => setCategoryView("list")}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#A0522D] text-white text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <img src={selectedCat.icon} className="w-5 h-5 object-contain" />
                        <span>{selectedCat.name}</span>
                      </div>
                      <IoIosArrowForward />
                    </button>

                    {selectedCat.attributes
                      .filter(attr => attr.enabled)
                      .sort((a, b) => Number(a.order) - Number(b.order))
                      .map(attr => {
                        const attrName = attr.attribute;
                        const attrKey = ATTRIBUTE_API_MAPPING[attrName];
                        
                        // Extract dynamic options from the API response
                        const apiOptionsList = attrKey && categoryOptions[selectedCat.name]?.[attrKey]
                          ? categoryOptions[selectedCat.name][attrKey]
                          : [];

                        // Map options from API structure or fall back to static ATTRIBUTE_OPTIONS
                        const options = apiOptionsList.length > 0
                          ? apiOptionsList.map(opt => ({
                              name: opt.label,
                              img: opt.image || null,
                              colorCode: opt.colorCode || null
                            }))
                          : (ATTRIBUTE_OPTIONS[attrName] || []).map(opt => ({
                              name: opt.name,
                              img: opt.img || null,
                              colorCode: opt.colorCode || null
                            }));

                        return (
                          <div key={attrName}>
                            <p className="text-xs font-semibold text-[#1C2C56] mb-2">{attrName}</p>
                            <div className="grid grid-cols-3 gap-3">
                              {options.map(opt => {
                                const isSelected = selectedOptions[selectedCat.name]?.[attrName] === opt.name;
                                return (
                                  <button
                                    key={opt.name}
                                    onClick={() => {
                                      setSelectedOptions(prev => ({
                                        ...prev,
                                        [selectedCat.name]: {
                                          ...(prev[selectedCat.name] || {}),
                                          [attrName]: opt.name
                                        }
                                      }));
                                    }}
                                    className="relative flex flex-col items-center"
                                  >
                                    <div className="rounded-sm w-full h-[70px] overflow-hidden border flex items-center justify-center bg-white">
                                      {opt.colorCode ? (
                                        <div
                                          className="w-full h-full border border-gray-200"
                                          style={{ backgroundColor: opt.colorCode }}
                                        />
                                      ) : opt.img ? (
                                        <img
                                          src={opt.img}
                                          className="w-full h-full object-cover"
                                          alt={opt.name}
                                        />
                                      ) : (
                                        <div className="text-[10px] text-gray-400 text-center px-1">
                                          {opt.name}
                                        </div>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                                        ✓
                                      </span>
                                    )}
                                    <p className="text-[10px] mt-1 text-center font-medium text-gray-700">{opt.name}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* CENTER MODEL VIEWER */}
        <div className=" border-l pl-10 border-[#A0522D33] relative flex-1 flex flex-col gap-5 items-center justify-between mt-6">
          <div className="bg-white shadow-xl rounded-xl p-2 flex gap-1 max-w-xs w-full">

            {/* SINGLE TABLE */}
            <button
              onClick={() => setFullView(false)}
              className={` w-full flex items-center justify-center font-bold gap-2 px-4 py-2 rounded-lg text-sm transition-all
                                ${!fullView
                  ? 'bg-[#A0522D] hover:bg-[#A0522D shadow text-white '
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
                }`}
            >
              <TbTable className="text-lg" />
              Single Table
            </button>

            {/* FULL VENUE */}
            <button
              onClick={() => setFullView(true)}
              className={` w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                                ${fullView
                  ? 'bg-[#A0522D] hover:bg-[#A0522D] text-white shadow'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
                }`}
            >
              <RiTable2 className="text-lg" />
              Full Venue
            </button>
          </div>
          <div className="relative z-10  overflow-hidden 
                h-[620px] w-full flex items-center justify-center">
            {
              fullView ? <Image
                src={selectedTheme.cardImage || singleProductData?.ProductImage || '/img/table-form/full-venue.png'}
                alt={selectedTheme.title}
                width={700}
                height={500}
                className="object-contain "
                priority
                unoptimized
              /> : <Image
                src={singleProductData?.ProductImage || selectedTheme.cardImage || "/img/table-form/3dtable.png"}
                alt={selectedTheme.title}
                width={500}
                height={500}
                className="object-contain"
                priority
                unoptimized
              />
            }

          </div>

          <div className="flex items-center">

            <div className="z-20 mt-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl px-3 py-2 flex items-center gap-4">
              <button className="p-2 rounded-md">
                <img src="/img/top-left-image/cursor.png" className="w-5 h-5 invert" />
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button className="p-2">
                <img src="/img/top-left-image/hand.png" className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button className="p-2" >
                <img src="/img/top-left-image/undo.png" className="w-5 h-5" />
              </button>
              <button className="p-2" >
                <img src="/img/top-left-image/redo.png" className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button className="p-2">
                <span className="text-lg font-bold">+</span>
              </button>
              <button className="p-2">
                <span className="text-lg font-bold">−</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button className="p-2 flex items-center gap-1" >
                <img src="/img/top-left-image/rotate.png" className="w-5 h-5" />
                <span className="text-sm text-gray-700">90°</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button className="p-2 flex items-center gap-1">
                <img src="/img/top-left-image/Group.png" className="w-5 h-5" />
                <span className="text-sm text-gray-700">3D</span>
              </button>
            </div>
            <div>
              <Button
                type="submit"
                variant="solid"
                loading={isSubmitting || isSaving}
                className="ml-10 mt-7 bg-[#A0522D] hover:bg-[#A0522D] text-[16px] text-white py-1 px-5" onClick={handleUniformDesignResult}
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