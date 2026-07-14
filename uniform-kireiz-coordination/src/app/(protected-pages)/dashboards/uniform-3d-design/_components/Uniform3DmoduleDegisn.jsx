'use client'
import Image from 'next/image'
// import '@google/model-viewer'
import { useEffect, useRef, useState } from 'react'
import ColorPickerPopup from './ColorPickerPopup'
// const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
// const SAMPLE_MODEL = '/img/3dmodels/doctor_uniform.glb'
const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
import Button from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import UniformCanvas from './UniformCanvas'
import { controlsApi } from './UniformCanvas'
import { uniformState } from './uniformStore'
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { apiModelInfoCreate, apiSaveDesign } from '@/services/SaveDesignService'
import { useSession } from 'next-auth/react'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

const PANELS = {
  color: {
    title: "Color",
    type: "colors",
    data: ["#1A73E8", "#34A853", "#EA4335", "#FBBC05", "#FF7043", "#8E24AA", "#00ACC1", "#43A047", "#C2185B", "#6D4C41"]
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

const Uniform3DmoduleDegisn = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  //console.log("Current Product ID:", id);
  const [counts, setCounts] = useState({});
  const [designJSON, setDesignJSON] = useState({
    colors: {
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

  const COMMON_BUTTONS = ["color", "size"];
  const TOP_ONLY_BUTTONS = [
    "fabric",
    "top",
    "collar",
    "sleeves",
    "cap",
    "zipper",
    "cuff",
  ];
  // const BOTTOM_ONLY_BUTTONS = [
  //   "legy", "pants", "pocket", "aprons"
  // ];

  useEffect(() => {
    uniformState.active3dPart = "top";
  }, []);

  useEffect(() => {
    uniformState.active3dPart = position; // "top" or "bottom"
  }, [position]);


  const [showDropdown, setShowDropdown] = useState(false);
  const handleUniformDesignResult = async () => {
    console.log("FINAL DESIGN JSON:", designJSON);

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("product", id || "");
    formData.append("model_file", ""); // Send empty or file object
    formData.append("description", "School uniform 3D model");

    try {
      const response = await apiModelInfoCreate(formData, session?.accessToken);
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
    if (!session?.accessToken) return
    setIsSaving(true);

    const payload = {
      "user": session?.user?.id,
      "model_info": modelId,
      "config_json": {
        "color": "grey",
        "size": "M",
        "material": "cotton"
      },
      "design_specifications": {
        "logo_position": "front",
        "print_type": "embroidery",
        "text": "My Brand"
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
      // custum upadte id
      const id = response?.data?.id;
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


  return (
    <section className="w-full mx-auto bg-white flex flex-col px-6 lg:px-4 py-4 gap-10 mt-11 ">
      <div className="flex gap-6">
        <div className="w-[80px] flex flex-col items-center" >
          <div className="relative mb-2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-2 bg-[#1C4FA8] text-white rounded-lg shadow text-sm"
            >
              {position === "top" ? "Top" : "Bottom"}
              <span className="text-lg">
                {showDropdown ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            </button>


            {showDropdown && (
              <div className="absolute top-full left-0 w-full bg-white border border-[#1c2c56] rounded-lg shadow z-50 overflow-hidden">
                {["top", "bottom"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setPosition(opt);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100"
                  >
                    <span className="capitalize">{opt}</span>
                    {position === opt && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => onIconClick("color")}
              className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "color" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/color-wheel.png" className="w-12 h-12 mb-1" />
              <span className="text-xs text-gray-600">Color</span>
            </button>

            {position === "top" && (
              <button
                onClick={() => onIconClick("fabric")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "fabric" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/textile.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Fabric</span>
              </button>
            )}

            <button
              onClick={() => onIconClick("size")}
              className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "size" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/measuring-tape.png" className="w-12 h-12 mb-1" />
              <span className="text-xs text-gray-600">Size</span>
            </button>

            {/* {position === "bottom" && (
              <button
                onClick={() => onIconClick("legy")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "color" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/textile.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Legy</span>
              </button>
            )} */}

            {position === "bottom" && (
              <button
                onClick={() => onIconClick("pants")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "color" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/bottoms/pant1.png" className="w-8 object-contain h-12 mb-1" />
                <span className="text-xs text-gray-600">Pant</span>
              </button>
            )}

            {position === "bottom" && (
              <button
                onClick={() => onIconClick("pocket")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "color" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/bottoms/pocket.png" className="w-8 object-contain h-12 mb-1" />
                <span className="text-xs text-gray-600">Pocket</span>
              </button>
            )}

            {position === "bottom" && (
              <button
                onClick={() => onIconClick("aprons")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "color" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/bottoms/apron.png" className="w-10 h-12 object-contain  mb-1" />
                <span className="text-xs text-gray-600">Aprons</span>
              </button>
            )}

            {/* {position === "top" && (
              <button
                onClick={() => onIconClick("top")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "color" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/textile.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Top</span>
              </button>
            )} */}

            {position === "top" && (
              <button
                onClick={() => onIconClick("collar")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "collar" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/collar.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Collar</span>
              </button>
            )}



            {position === "top" && (
              <button
                onClick={() => onIconClick("sleeves")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "sleeves" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/sleeves.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Sleeves</span>
              </button>
            )}
            {position === "top" && (


              <button
                onClick={() => onIconClick("cap")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cap" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/cap.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Cap</span>
              </button>
            )}
            {position === "top" && (


              <button
                onClick={() => onIconClick("zipper")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "zipper" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/zipper.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Zipper</span>
              </button>
            )}
            {position === "top" && (


              <button
                onClick={() => onIconClick("cuff")}
                className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cuff" ? "ring-2 ring-blue-500" : ""
                  }`}
              >
                <img src="/img/top-left-image/cuff.png" className="w-12 h-12 mb-1" />
                <span className="text-xs text-gray-600">Cuff</span>
              </button>
            )}
          </div>
        </div>
        <div className="relative ">
          {PANELS[active] && (
            <div
              ref={panelRef}
              className="absolute top-0 left-0 z-30 w-[275px] bg-white shadow-xl rounded-xl p-3">
              {/* <h5 className="font-semibold text-gray-700 mb-2">
                {PANELS[active].title}
              </h5> */}
              {PANELS[active].type === "colors" && (
                <div className="grid grid-cols-5 gap-3 relative">
                  {/* <button
                    onClick={() => setShowColorPicker(true)}
                    className="w-10 h-10 rounded-full"
                  >
                    <img
                      src="/img/top-left-image/color-wheel.png"
                      className="w-12"
                    />
                  </button> */}

                  {PANELS[active].data.map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        applyBaseColorToModel(hex);
                        setColor(hex);

                        // ✅ Only Top & Bottom colors allowed
                        const jsonPart = uniformState.active3dPart;

                        setDesignJSON((prev) => ({
                          ...prev,
                          colors: {
                            ...prev.colors,
                            [jsonPart]: hex
                          }
                        }));
                      }}

                      className="w-10 h-10 rounded-full shadow border"
                      style={{ background: hex }}
                    />
                  ))}
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

              {PANELS[active].type === "textures" && (
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
                    {PANELS[active].data.map((tex, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDesignJSON((prev) => ({
                            ...prev,
                            fabric: tex
                          }));
                        }}

                        className="
                          w-[43px] h-[43px]
                          border border-gray-300
                          rounded-md
                          overflow-hidden
                          hover:border-blue-500
                          focus:border-blue-600
                          focus:ring-2 focus:ring-blue-300
                          transition
                        "
                      >
                        <img
                          src={tex}
                          alt="texture"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {PANELS[active].type === "options" && (
                <div className="grid grid-cols-3 gap-3">
                  {PANELS[active].data.map((opt, i) => (
                    <button key={i} onClick={() => {
                      setDesignJSON((prev) => ({
                        ...prev,
                        options: {
                          ...prev.options,
                          [active]: opt   // collar / pants / pocket / aprons
                        }
                      }));
                    }} className="p-2 rounded-lg shadow relative">
                      <img src={opt} className="w-full h-full object-cover" />

                      <p className="text-xs absolute bottom-1 left-1/2 -translate-x-1/2
                px-2 rounded-full bg-[#1C2C56] text-white">
                        {PANELS[active].title}
                      </p>
                    </button>

                  ))}
                </div>
              )}

              {PANELS[active].type === "size" && (
                <div className="flex flex-col items-center
                 gap-2">
                  {PANELS[active].data.map((size, i) => (
                    <div
                      key={size}
                      className=" shadow-md text-[#003560] rounded-md flex items-center justify-between gap-3 px-4 py-2 w-full"
                    >
                      {/* Size label */}
                      <span className="text-sm font-medium ">
                        {size}
                      </span>

                      {/* Counter */}
                      <div className="flex items-center gap-2 my-2">
                        <button
                          onClick={() => decrement(size)}
                          className="text-[#1C2C56] px-2 font-bold text-lg border-l border-gray-300"
                        >
                          −
                        </button>
                        <span className="text-sm text-center px-2 ">
                          {counts[size] || 0}
                        </span>
                        <button
                          onClick={() => increment(size)}
                          className="font-bold text-lg border-r border-gray-300 px-2"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {PANELS[active].type === "optionsLegy" && (
                <div className="grid grid-cols-3 gap-3">
                  {PANELS[active].data.map((opt, i) => (
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


              {PANELS[active].type === "optionsTops" && (
                <div className="grid grid-cols-3 gap-3">
                  {PANELS[active].data.map((opt, i) => (
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
          <div className="absolute top-30 w-[400px] h-[400px] bg-[#BEE0FF] rounded-full"></div>
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
          <div className="relative z-10 py-16">
            <Image
              src="/img/uniform/uniform.png"
              alt="Uniform"
              width={450}
              height={800}
              className="object-contain"
              priority
            />
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
              absolute 
              top-[75vh]
              flex
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

// 'use client'

// import { useState } from 'react'
// import { HexColorPicker } from 'react-colorful'
// import { uniformState } from './uniformStore'
// import UniformCanvas from './UniformCanvas'
// import Button from '@/components/ui/Button'
// import { useRouter } from 'next/navigation'

// const COLORS = [
//   '#1A73E8', '#34A853', '#EA4335',
//   '#FBBC05', '#FF7043', '#8E24AA',
//   '#00ACC1', '#43A047', '#C2185B', '#6D4C41'
// ]

// export default function Uniform3DmoduleDegisn() {
//   const router = useRouter()
//   const [color, setColor] = useState(uniformState.color)
//   const [showPicker, setShowPicker] = useState(false)

//   return (
//     <section className="w-full bg-white px-6 py-6">
//       <div className="flex gap-6">

//         {/* LEFT TOOLBAR */}
//         <div className="w-[80px] flex flex-col gap-3">
//           <button
//             onClick={() => setShowPicker(!showPicker)}
//             className="bg-white shadow rounded-lg p-2 text-xs"
//           >
//             🎨 Color
//           </button>
//         </div>

//         {/* COLOR PANEL */}
//         {showPicker && (
//           <div className="absolute z-30 bg-white shadow-xl rounded-xl p-3">
//             <HexColorPicker
//               color={color}
//               onChange={(c) => {
//                 setColor(c)
//                 uniformState.color = c
//               }}
//             />

//             <div className="grid grid-cols-5 gap-2 mt-3">
//               {COLORS.map((c) => (
//                 <button
//                   key={c}
//                   onClick={() => {
//                     setColor(c)
//                     uniformState.color = c
//                   }}
//                   className="w-8 h-8 rounded-full border"
//                   style={{ background: c }}
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* CENTER MODEL */}
//         <div className="relative flex-1 flex justify-center items-center">
//           <div className="absolute w-[360px] h-[360px] bg-[#BEE0FF] rounded-full"></div>

//           {/* 👇 HEIGHT IS MUST */}
//           <div className="relative z-10 w-[1000px] h-[650px]">
//             <UniformCanvas />
//           </div>

//           {/* BOTTOM BAR */}
//           <div className="absolute bottom-6 flex gap-4 items-center bg-white shadow-xl rounded-2xl px-4 py-2">
//             <button onClick={() => (uniformState.autoRotate = !uniformState.autoRotate)}>
//               🔄 Rotate
//             </button>

//             <Button
//               className="bg-[#1C2C56] text-white"
//               onClick={() => router.push('/dashboards/design-result')}
//             >
//               Confirm Design
//             </Button>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }


