'use client'
import Image from 'next/image'
import '@google/model-viewer'
import { useEffect, useRef, useState } from 'react'
import ColorPickerPopup from './ColorPickerPopup'
// const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
// const SAMPLE_MODEL = '/img/3dmodels/doctor_uniform.glb'
const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
import Button from '@/components/ui/Button';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { RiTable2 } from 'react-icons/ri'
import { TbTable } from 'react-icons/tb'
import { IoIosArrowForward } from 'react-icons/io'
import { FiMinus, FiPlus } from "react-icons/fi";
import { apiModelInfoCreate, apiSaveDesign } from '@/services/SaveDesignService'
import { useSession } from 'next-auth/react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetProductDetailsById } from '@/services/ProductService'
import { apiGetSindleThemeDetails } from '@/services/HomeService'
const Uniform3DmoduleDegisn = () => {
  const searchParams = useSearchParams()
  // product id
  const { id } = useParams();
  // theme id
  const themeIdParam = searchParams.get('themeId')

  console.log('ffffffffffffffffffffffffffffff======= id', id, '======= themeIdParam', themeIdParam);

  const [loading, setLoading] = useState(false)
  const [singleProductData, setSingleProductData] = useState(null)
  const [shapeOpen, setShapeOpen] = useState(false)
  const [sittingOpen, setSittingOpen] = useState(false)
  const { data: session } = useSession();
  // const [tableShape, setTableShape] = useState("Circle")
  const [tableSitting, setTableSitting] = useState(6)

  const [selectedCategory, setSelectedCategory] = useState("Tablecloths")
  const [categoryView, setCategoryView] = useState("list"); // list | tablecloths

  const [fabric, setFabric] = useState("Crushed Velvet");
  const [style, setStyle] = useState("Round");
  const [colorr, setColorr] = useState("Beige");
  const [chairColor, setChairColor] = useState(null)
  const [centrePiece, setCentrePiece] = useState(null)
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter()

  const mvRef = useRef(null)
  // const [modelSrc, setModelSrc] = useState(SAMPLE_MODEL)
  const [active, setActive] = useState('tableShape')
  const [autoRotate, setAutoRotate] = useState(true)
  const [color, setColor] = useState('#7fc7ff')
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [status, setStatus] = useState('loading')
  const [fieldOfView, setFieldOfView] = useState(45); // zoom control
  const [cameraHistory, setCameraHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef(null)
  const [fullView, setFullView] = useState(false);

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

  // Category-specific states
  const [tablecloth, setTablecloth] = useState({
    fabric: "Crushed Velvet",
    style: "Round",
    color: "Beige"
  });

  const [napkins, setNapkins] = useState({
    fabric: "Crushed Velvet",
    color: "White"
  });

  const [chairCovers, setChairCovers] = useState({
    fabric: "Crushed Velvet",
    color: null,
    centrePiece: null
  });

  const [centrePieces, setCentrePieces] = useState({
    fabric: "Crushed Velvet",
    style: "Round",
    color: "Beige"
  });

  const [tableware, setTableware] = useState({
    fabric: "Crushed Velvet",
    style: "Round",
    color: "Beige"
  });

  const [additionalDecor, setAdditionalDecor] = useState({
    fabric: "Crushed Velvet",
    style: "Round",
    color: "Beige"
  });

  function onIconClick(key) {
    setActive(prev => {
      if (prev === key) {
        setShowColorPicker(false)
        return ''
      }
      return key
    })
  }
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

          console.log('apiData?.image', apiData?.image);
        }
      } catch (error) {
        console.error("Error fetching theme details:", error);
      }
    };
    if (themeIdParam) fetchThemeDetails();
  }, [themeIdParam])

  const handleUniformDesignResult = async () => {

    let productId = "";
    if (id) {
      productId = id;
    } else {
      productId = "";
    }
    let themeId = "";
    if (themeIdParam) {
      themeId = themeIdParam;
    } else {
      themeId = "";
    }



    console.log(productId, '=================', themeId);


    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("product", productId);
    formData.append("theme_id", themeId);

    formData.append("model_file", ""); // Send empty or file object
    formData.append("description", "School uniform 3D model");

    try {
      const response = await apiModelInfoCreate(formData, session?.accessToken);
      // console.log("Design create Successfully:", response);

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
      "user": session?.user?.id,
      "model_info": modelId,
      "config_json": {
        "color": "grey",
        "size": "M",
        "material": "cotton",

      },
      "design_specifications": {
        "logo_position": "front",
        "print_type": "embroidery",
        "text": "My Brand",
        "size": singleProductData?.size,
        // "productType": singleProductData?.product_type,
        "table_shape": singleProductData?.table_shape,
        "style": singleProductData?.style,
        "fabric_details": singleProductData?.fabric_details,
        "color_details": singleProductData?.color_details,
        "category": singleProductData?.category,
        "subcategory": singleProductData?.subcategory,
        "parts": singleProductData?.parts,
      },
      "json_file_path": "uploads/configs/user6_model3.json",
      "isActive": true
    }

    try {
      const response = await apiSaveDesign(payload, session.accessToken);
      console.log("Design Saved Successfully:", response);
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
    <section className="w-full mx-auto bg-white flex flex-col px-6 lg:px-4 py-4 gap-10 mt-15 ">
      <div className="flex gap-6">
        <div className="w-[80px] flex flex-col items-center gap-4 py-4">
          {[
            { key: "tableShape", label: "Table Shape", img: "/img/top-left-image/collar.png" },
            { key: "category", label: "Categories", img: "/img/top-left-image/sleeves.png" },
            // { key: "theme", label: "Theme", img: "/img/top-left-image/measuring-tape.png" },
            // { key: "color", label: "Color Palette", img: "/img/top-left-image/color-wheel.png" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => onIconClick(item.key)}
              className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition
                ${active === item.key
                  ? "border-[#A0522D] ring-2 ring-blue-500 bg-[#FFF5F1] shadow-md"
                  : "bg-white shadow-sm hover:bg-gray-50"
                }`}
            >
              <img src={item.img} className="w-10" />
              <span className="text-xs text-gray-600">
                {item.label}
              </span>
            </button>
          ))}
        </div>
        <div className="max-w-sm py-4">
          {active === "tableShape" && (
            <div
              ref={panelRef}
              className="w-full h-full  bg-[#FFF5F1] border border-[#F3D3C8]
                       rounded-2xl p-5 shadow-lg"
            >
              {/* TABLE SHAPE */}
              <div className='mb-6'>
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

                      {/* CHECK ICON */}
                      {tableShape === item.name && (
                        <span
                          className="absolute top-1 right-1
            bg-[#A0522D] text-white
            text-[10px] w-4 h-4
            flex items-center justify-center
            rounded-sm shadow-md"
                        >
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
              {/* TABLE SCALE */}
              <div className="mb-6">
                <label className="text-sm text-[#1C2C56] block mb-1">
                  Table Scale
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="100"
                    max="500"
                    defaultValue="300"
                    className="w-full accent-[#A0522D]"
                  />
                  {/* <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                        <span>100</span>
                                        <span>300</span>
                                        <span>500</span>
                                    </div> */}
                </div>
              </div>

              {/* TABLE SITTING */}
              <div className="mb-6  flex justify-between items-center">
                <label className="text-sm text-[#1C2C56] block">
                  Table Sitting
                </label>

                <div className="flex items-center gap-2">
                  {/* MINUS */}
                  <button
                    type="button"
                    onClick={() =>
                      setTableSitting((prev) => Math.max(2, prev - 1))
                    }
                    className="w-8 h-8 flex items-center justify-center
      border border-[#E6B8A2] rounded-md bg-white text-[#A0522D]"
                  >
                    <FiMinus size={14} />
                  </button>

                  {/* VALUE */}
                  <span className="text-sm font-medium text-[#1C2C56]">
                    {tableSitting}
                  </span>

                  {/* PLUS */}
                  <button
                    type="button"
                    onClick={() =>
                      setTableSitting((prev) => Math.min(8, prev + 1))
                    }
                    className="w-8 h-8 flex items-center justify-center
      border border-[#E6B8A2] rounded-md bg-white text-[#A0522D]"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>


              {/* TIP BOX */}
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
                  {[
                    { name: "Tablecloths", icon: "/img/table-form/category/tablecloths.png" },
                    { name: "Napkins", icon: "/img/table-form/category/napkins.png" },
                    { name: "Chair Covers", icon: "/img/table-form/category/chair-cover.png" },
                    { name: "Centre Pieces", icon: "/img/table-form/category/centre-pieces.png" },
                    { name: "Tableware", icon: "/img/table-form/category/tableware.png" },
                    { name: "Additional Decor", icon: "/img/table-form/category/centre-pieces.png" },
                  ].map(item => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.name === "Tablecloths") setCategoryView("tablecloths")
                        if (item.name === "Napkins") setCategoryView("napkins")
                        if (item.name === "Chair Covers") setCategoryView("chairCovers")
                        if (item.name === "Centre Pieces") setCategoryView("centrePieces")
                        if (item.name === "Tableware") setCategoryView("tableware")
                        if (item.name === "Additional Decor") setCategoryView("additionalDecor")
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img src={item.icon} className="w-6 h-6" />
                        <span>{item.name}</span>
                      </div>
                      <IoIosArrowForward />
                    </button>
                  ))}
                </div>
              )}

              {/* TABLECLOTHS DETAIL - Updated */}
              {categoryView === "tablecloths" && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <button
                    onClick={() => setCategoryView("list")}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#A0522D] text-white text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img src="/img/table-form/category/tablecloths.png" className="w-5 h-5" />
                      <span>Tablecloths</span>
                    </div>
                    <IoIosArrowForward />
                  </button>

                  {/* FABRIC */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Fabric</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Crushed Velvet", img: "/img/table-form/tablecloth/fabric1.png" },
                        { name: "Damask Linen", img: "/img/table-form/tablecloth/fabric2.png" },
                        { name: "Gingham Cotton", img: "/img/table-form/tablecloth/fabric3.png" },
                        { name: "Raw Silk Dupioni", img: "/img/table-form/tablecloth/fabric4.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setTablecloth(prev => ({ ...prev, fabric: item.name }))}
                          className="relative"
                        >
                          <img
                            src={item.img}
                            className="rounded-sm object-cover border w-full h-[70px]"
                          />
                          {tablecloth.fabric === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STYLE */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Style</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Round", "Square", "Rectangle", "Oval"].map(s => (
                        <button
                          key={s}
                          onClick={() => setTablecloth(prev => ({ ...prev, style: s }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/table-style/style-${s.toLowerCase()}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={s}
                            />
                          </div>
                          {tablecloth.style === s && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{s}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Color</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["White", "Ivory", "Taupe", "Blush", "Burgundy"].map((c, i) => (
                        <button
                          key={`${c}-${i}`}
                          onClick={() => setTablecloth(prev => ({ ...prev, color: c }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/color-table/color-${c.toLowerCase()}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={c}
                            />
                          </div>
                          {tablecloth.color === c && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{c}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NAPKINS DETAIL - Updated */}
              {categoryView === "napkins" && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <button
                    onClick={() => setCategoryView("list")}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#A0522D] text-white text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img src="/img/table-form/category/napkins.png" className="w-5 h-5" />
                      <span>Napkins</span>
                    </div>
                    <IoIosArrowForward />
                  </button>

                  {/* FABRIC */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Fabric</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Crushed Velvet", img: "/img/table-form/tablecloth/fabric1.png" },
                        { name: "Damask Linen", img: "/img/table-form/tablecloth/fabric2.png" },
                        { name: "Gingham Cotton", img: "/img/table-form/tablecloth/fabric3.png" },
                        { name: "Raw Silk Dupioni", img: "/img/table-form/tablecloth/fabric4.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setNapkins(prev => ({ ...prev, fabric: item.name }))}
                          className="relative"
                        >
                          <img src={item.img} className="rounded-sm object-cover border w-full h-[70px]" />
                          {napkins.fabric === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Color</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["White", "Ivory", "Champagne", "Gold", "Blush", "Dusty Rose", "Peach", "Coral"].map((c, i) => (
                        <button
                          key={`${c}-${i}`}
                          onClick={() => setNapkins(prev => ({ ...prev, color: c }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/napkins/color-${c.toLowerCase().replace(" ", "-")}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={c}
                            />
                          </div>
                          {napkins.color === c && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{c}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CENTRE PIECES DETAIL */}
              {categoryView === "centrePieces" && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <button
                    onClick={() => setCategoryView("list")}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#A0522D] text-white text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img src="/img/table-form/category/centre-pieces.png" className="w-5 h-5" />
                      <span>Centre Pieces</span>
                    </div>
                    <IoIosArrowForward />
                  </button>

                  {/* FABRIC */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Fabric</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Crushed Velvet", img: "/img/table-form/tablecloth/fabric1.png" },
                        { name: "Damask Linen", img: "/img/table-form/tablecloth/fabric2.png" },
                        { name: "Gingham Cotton", img: "/img/table-form/tablecloth/fabric3.png" },
                        { name: "Raw Silk Dupioni", img: "/img/table-form/tablecloth/fabric4.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setCentrePieces(prev => ({ ...prev, fabric: item.name }))}
                          className="relative"
                        >
                          <img src={item.img} className="rounded-sm object-cover border w-full h-[70px]" />
                          {centrePieces.fabric === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STYLE */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Style</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Floral Arrangement", "Candle Centerpiece", "Fruit Bowl", "Modern Sculpture"].map(s => (
                        <button
                          key={s}
                          onClick={() => setCentrePieces(prev => ({ ...prev, style: s }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/centre-pieces/style-${s.toLowerCase().replace(" ", "-")}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={s}
                            />
                          </div>
                          {centrePieces.style === s && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{s}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Color</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Gold", "Silver", "Crystal", "White", "Ivory", "Rose Gold"].map((c, i) => (
                        <button
                          key={`${c}-${i}`}
                          onClick={() => setCentrePieces(prev => ({ ...prev, color: c }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/centre-pieces/color-${c.toLowerCase()}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={c}
                            />
                          </div>
                          {centrePieces.color === c && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{c}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TABLEWARE DETAIL */}
              {categoryView === "tableware" && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <button
                    onClick={() => setCategoryView("list")}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#A0522D] text-white text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img src="/img/table-form/category/tableware.png" className="w-5 h-5" />
                      <span>Tableware</span>
                    </div>
                    <IoIosArrowForward />
                  </button>

                  {/* FABRIC - Actually for tableware this should be "Material" */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Material</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Porcelain", img: "/img/table-form/tableware/porcelain.png" },
                        { name: "Bone China", img: "/img/table-form/tableware/bone-china.png" },
                        { name: "Glass", img: "/img/table-form/tableware/glass.png" },
                        { name: "Crystal", img: "/img/table-form/tableware/crystal.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setTableware(prev => ({ ...prev, fabric: item.name }))}
                          className="relative"
                        >
                          <img src={item.img} className="rounded-sm object-cover border w-full h-[70px]" />
                          {tableware.fabric === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STYLE - For tableware, this could be "Set Type" */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Set Type</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Formal Dinner", "Casual Dining", "Buffet Style", "Banquet"].map(s => (
                        <button
                          key={s}
                          onClick={() => setTableware(prev => ({ ...prev, style: s }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/tableware/set-${s.toLowerCase().replace(" ", "-")}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={s}
                            />
                          </div>
                          {tableware.style === s && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{s}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Color</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["White", "Ivory", "Gold Trim", "Silver Trim", "Platinum", "Champagne"].map((c, i) => (
                        <button
                          key={`${c}-${i}`}
                          onClick={() => setTableware(prev => ({ ...prev, color: c }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/tableware/color-${c.toLowerCase().replace(" ", "-")}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={c}
                            />
                          </div>
                          {tableware.color === c && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{c}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ADDITIONAL DECOR DETAIL */}
              {categoryView === "additionalDecor" && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <button
                    onClick={() => setCategoryView("list")}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#A0522D] text-white text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img src="/img/table-form/category/centre-pieces.png" className="w-5 h-5" />
                      <span>Additional Decor</span>
                    </div>
                    <IoIosArrowForward />
                  </button>

                  {/* FABRIC - For decor, this could be "Material" */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Material</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Silk", img: "/img/table-form/decor/silk.png" },
                        { name: "Satin", img: "/img/table-form/decor/satin.png" },
                        { name: "Lace", img: "/img/table-form/decor/lace.png" },
                        { name: "Velvet", img: "/img/table-form/decor/velvet.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setAdditionalDecor(prev => ({ ...prev, fabric: item.name }))}
                          className="relative"
                        >
                          <img src={item.img} className="rounded-sm object-cover border w-full h-[70px]" />
                          {additionalDecor.fabric === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STYLE - For decor, this could be "Item Type" */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Item Type</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Chair Sash", "Table Runner", "Place Cards", "Menu Cards"].map(s => (
                        <button
                          key={s}
                          onClick={() => setAdditionalDecor(prev => ({ ...prev, style: s }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/decor/type-${s.toLowerCase().replace(" ", "-")}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={s}
                            />
                          </div>
                          {additionalDecor.style === s && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{s}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Color</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Gold", "Silver", "White", "Ivory", "Blush", "Navy"].map((c, i) => (
                        <button
                          key={`${c}-${i}`}
                          onClick={() => setAdditionalDecor(prev => ({ ...prev, color: c }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="rounded-sm w-full h-[60px] overflow-hidden border flex items-center justify-center">
                            <img
                              src={`/img/table-form/decor/color-${c.toLowerCase()}.png`}
                              className="w-full h-full object-cover object-center"
                              alt={c}
                            />
                          </div>
                          {additionalDecor.color === c && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{c}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CHAIR COVERS DETAIL - Updated */}
              {categoryView === "chairCovers" && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <button
                    onClick={() => setCategoryView("list")}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#A0522D] text-white text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img src="/img/table-form/category/chair-cover.png" className="w-5 h-5" />
                      <span>Chair Covers</span>
                    </div>
                    <IoIosArrowForward />
                  </button>

                  {/* FABRIC */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Fabric</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Crushed Velvet", img: "/img/table-form/tablecloth/fabric1.png" },
                        { name: "Damask Linen", img: "/img/table-form/tablecloth/fabric2.png" },
                        { name: "Gingham Cotton", img: "/img/table-form/tablecloth/fabric3.png" },
                        { name: "Raw Silk Dupioni", img: "/img/table-form/tablecloth/fabric4.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setChairCovers(prev => ({ ...prev, fabric: item.name }))}
                          className="relative"
                        >
                          <img src={item.img} className="rounded-sm object-cover border w-full h-[70px]" />
                          {chairCovers.fabric === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Chair Cover Rentals</p>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: "White", img: "/img/table-form/chair-cover/color-white.png" },
                        { name: "Ivory", img: "/img/table-form/chair-cover/color-ivory.png" },
                        { name: "Beige", img: "/img/table-form/chair-cover/color-beige.png" },
                        { name: "Gold", img: "/img/table-form/chair-cover/color-gold.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setChairCovers(prev => ({ ...prev, color: item.name }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="w-full h-[80px] rounded-sm overflow-hidden border">
                            <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                          </div>
                          {chairCovers.color === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TABLE CENTREPIECE */}
                  <div>
                    <p className="text-xs font-semibold text-[#1C2C56] mb-2">Table Centrepiece</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Beige", img: "/img/centre-piece/beige.png" },
                        { name: "Navy", img: "/img/centre-piece/navy.png" },
                        { name: "Green", img: "/img/centre-piece/green.png" },
                      ].map(item => (
                        <button
                          key={item.name}
                          onClick={() => setChairCovers(prev => ({ ...prev, centrePiece: item.name }))}
                          className="relative flex flex-col items-center"
                        >
                          <div className="w-full h-[70px] rounded-sm overflow-hidden border">
                            <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                          </div>
                          {chairCovers.centrePiece === item.name && (
                            <span className="absolute top-1 right-1 bg-[#A0522D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-sm shadow-md">
                              ✓
                            </span>
                          )}
                          <p className="text-[10px] mt-1 text-center uppercase">{item.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                alt="Uniform"
                width={700}
                height={500}
                className="object-contain "
                priority
                unoptimized
              /> : <Image
                src={singleProductData?.ProductImage || selectedTheme.cardImage || "/img/table-form/3dtable.png"}
                alt="Uniform"
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
              <button className="p-2" >
                <span className="text-lg font-bold">+</span>
              </button>
              <span className="text-sm font-semibold text-gray-700">
                {/* {zoomPercent}% */}
              </span>
              <button className="p-2" >
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
                className="w-full ml-10 mt-7 bg-[#A0522D] hover:bg-[#A0522D] text-white py-3" onClick={handleUniformDesignResult}
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