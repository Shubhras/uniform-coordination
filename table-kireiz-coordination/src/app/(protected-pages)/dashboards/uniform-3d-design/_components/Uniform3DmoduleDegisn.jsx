// 'use client'
// import Image from 'next/image'
// import '@google/model-viewer'
// import { useEffect, useRef, useState } from 'react'
// import ColorPickerPopup from './ColorPickerPopup'
// // const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
// const SAMPLE_MODEL = '/img/3dmodels/doctor_uniform.glb'
// const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
// import Button from '@/components/ui/Button';
// import { useRouter } from 'next/navigation';
// const PANELS = {
//     color: {
//         title: "Color",
//         type: "colors",
//         data: ["#1A73E8", "#34A853", "#EA4335", "#FBBC05", "#FF7043", "#8E24AA", "#00ACC1", "#43A047", "#C2185B", "#6D4C41"]
//     },

//     fabric: {
//         title: "Fabric",
//         type: "textures",
//         data: [
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//         ]
//     },

//     collar: {
//         title: "Collar",
//         type: "options",
//         data: [
//             "/img/top-left-image/collar/collar1.png",
//             "/img/top-left-image/collar/collar2.png",
//             "/img/top-left-image/collar/collar3.png",
//             "/img/top-left-image/collar/collar4.png",
//         ]
//     },

//     size: {
//         title: "Size",
//         type: "size",
//         data: ["XS", "S", "M", "L", "XL"]
//     },

//     sleeves: {
//         title: "Sleeves",
//         type: "options",
//         data: [
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//         ]
//     },

//     cap: {
//         title: "Cap",
//         type: "options",
//         data: [
//             "/img/top-left-image/cap/cap1.png",
//             "/img/top-left-image/cap/cap2.png",
//         ]
//     },

//     zipper: {
//         title: "Zipper",
//         type: "options",
//         data: [
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//         ]
//     },

//     cuff: {
//         title: "Cuff",
//         type: "options",
//         data: [
//             "/img/avatars/thumb-1.jpg",
//             "/img/avatars/thumb-1.jpg",
//         ]
//     }
// };



// const Uniform3DmoduleDegisn = () => {
//      const router = useRouter()
//     const mvRef = useRef(null)
//     const [modelSrc, setModelSrc] = useState(SAMPLE_MODEL)
//     const [active, setActive] = useState('')
//     const [autoRotate, setAutoRotate] = useState(true)
//     const [color, setColor] = useState('#7fc7ff')
//     const [showColorPicker, setShowColorPicker] = useState(false);
//     const [status, setStatus] = useState('loading')
//     const [fieldOfView, setFieldOfView] = useState(45); // zoom control
//     const [cameraHistory, setCameraHistory] = useState([]);
//     const [redoStack, setRedoStack] = useState([]);
//     const [mounted, setMounted] = useState(false)
//     const panelRef = useRef(null)

//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             import('@google/model-viewer')
//         }
//     }, [])
//     useEffect(() => {
//         setMounted(true)
//     }, [])
//     /** LOAD MODEL + APPLY COLOR */
//     useEffect(() => {
//         const mv = mvRef.current
//         if (!mv) return

//         function onError() {
//             if (modelSrc !== FALLBACK_MODEL) setModelSrc(FALLBACK_MODEL)
//         }

//         function onLoad() {
//             setStatus('loaded')
//             applyBaseColorToModel(color)
//         }

//         mv.addEventListener('error', onError)
//         mv.addEventListener('load', onLoad)

//         return () => {
//             mv.removeEventListener('error', onError)
//             mv.removeEventListener('load', onLoad)
//         }
//     }, [mvRef, modelSrc])

//     useEffect(() => {
//         function handleClickOutside(e) {
//             if (panelRef.current && !panelRef.current.contains(e.target)) {
//                 setActive('')
//                 setShowColorPicker(false)
//             }
//         }

//         document.addEventListener('mousedown', handleClickOutside)

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside)
//         }
//     }, [])

//     function getAllChildNodes(object, list = []) {
//         if (!object) return list;                 // safety check 1
//         if (!object.children) return list;         // safety check 2

//         if (object.name) list.push(object.name);   // add only valid names

//         object.children.forEach(child => {
//             if (child) getAllChildNodes(child, list); // safety check 3
//         });

//         return list;
//     }
//     async function applyBaseColorToModel(hex, targetPart = null) {
//         targetPart = "FABRIC 2_FRONT_24961"
//         const mv = mvRef.current;
//         if (!mv) return;

//         await mv.updateComplete;

//         const model = mv.model;
//         if (!model) return;

//         // HEX → RGB
//         const r = parseInt(hex.slice(1, 3), 16) / 255;
//         const g = parseInt(hex.slice(3, 5), 16) / 255;
//         const b = parseInt(hex.slice(5, 7), 16) / 255;

//         // 🟦 DEBUG: ALL MATERIALS
//         //console.log("Materials:");
//         // model.materials.forEach(mat => console.log(mat.name));
//         model.materials.forEach(mat => {
//             // console.log(mat.name)
//         }
//         );

//         // 🟥 DEBUG: ALL NODE NAMES
//         const nodes = getAllChildNodes(model.scene);
//         //console.log("Nodes:", nodes);

//         // Apply to all if no part selected
//         if (!targetPart) {
//             model.materials.forEach(mat => {
//                 mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
//             });
//             mv.invalidate?.();
//             return;
//         }

//         const key = targetPart.toLowerCase();

//         // 🟢 FIRST TRY — MATCH MATERIAL BY NAME
//         model.materials.forEach(mat => {
//             const name = mat.name?.toLowerCase() || "";
//             if (name.includes(key)) {
//                 //console.log("Matched MATERIAL:", mat.name);
//                 mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
//             }
//         });

//         mv.invalidate?.();
//     }
//     /** PRESET COLOR CLICK */
//     function onPresetColor(hex) {
//         setColor(hex)
//         applyBaseColorToModel(hex)

//         //applyBaseColorToModel(hex, active);  
//     }

//     /** ROTATION TOGGLE */
//     function onToggleAutoRotate() {
//         setAutoRotate(v => !v)
//         if (mvRef.current) mvRef.current.autoRotate = !autoRotate
//     }

//     /** RESET CAMERA */
//     function onResetView() {
//         const mv = mvRef.current
//         if (!mv) return
//         mv.cameraOrbit = '0deg 75deg 2.5m'
//         mv.jumpCameraToGoal()
//     }

//     /** LEFT ICON SELECT */
// function onIconClick(key) {
//     setActive(prev => {
//         if (prev === key) {
//             setShowColorPicker(false)
//             return ''
//         }
//         return key
//     })
// }

//     function saveCameraState() {
//         const mv = mvRef.current;
//         if (!mv) return;

//         const state = {
//             orbit: mv.getCameraOrbit(),
//             fov: mv.getFieldOfView(),
//         };

//         setCameraHistory((prev) => [...prev, state]);
//     }
//     function zoomIn() {
//         saveCameraState();
//         const mv = mvRef.current;
//         if (!mv) return;

//         let fov = mv.getFieldOfView();
//         fov = Math.max(10, fov - 5);   // min zoom

//         mv.fieldOfView = `${fov}deg`;
//         setFieldOfView(fov);           // UPDATE UI
//     }

//     function zoomOut() {
//         saveCameraState();
//         const mv = mvRef.current;
//         if (!mv) return;

//         let fov = mv.getFieldOfView();
//         fov = Math.min(120, fov + 5);  // max zoom

//         mv.fieldOfView = `${fov}deg`;
//         setFieldOfView(fov);           // UPDATE UI
//     }
//     const zoomPercent = Math.round(((120 - fieldOfView) / 110) * 100);

//     function rotate90() {
//         saveCameraState();

//         const mv = mvRef.current;
//         const orbit = mv.getCameraOrbit();

//         const newOrbit = {
//             theta: orbit.theta + 90,
//             phi: orbit.phi,
//             radius: orbit.radius
//         };

//         mv.cameraOrbit = `${newOrbit.theta}deg ${newOrbit.phi}deg ${newOrbit.radius}m`;
//     }
//     function undoCamera() {
//         if (cameraHistory.length === 0) return;

//         const mv = mvRef.current;

//         const last = cameraHistory[cameraHistory.length - 1];
//         setCameraHistory((prev) => prev.slice(0, -1));
//         setRedoStack((prev) => [...prev, last]);

//         mv.cameraOrbit = `${last.orbit.theta}deg ${last.orbit.phi}deg ${last.orbit.radius}m`;
//         mv.fieldOfView = `${last.fov}deg`;
//     }
//     function redoCamera() {
//         if (redoStack.length === 0) return;

//         const mv = mvRef.current;

//         const last = redoStack[redoStack.length - 1];
//         setRedoStack((prev) => prev.slice(0, -1));

//         mv.cameraOrbit = `${last.orbit.theta}deg ${last.orbit.phi}deg ${last.orbit.radius}m`;
//         mv.fieldOfView = `${last.fov}deg`;
//     }

//   const handleUniformDesignResult = () => {
//         router.push("/dashboards/design-result");
//     };
//     return (
//         <section className="w-full mx-auto bg-white flex flex-col px-6 lg:px-4 py-4 gap-10 mt-15 ">
//             <div className="flex gap-6">
//                 <div className="w-[80px] flex flex-col items-center">
//                     <div className="flex items-center gap-2 px-4 py-2 bg-[#1c2c56] text-white rounded-lg shadow text-sm mb-2">
//                         Top <span className="text-xs">›</span>
//                     </div>
//                     <div className="flex flex-col gap-2 w-full">
//                         <button
//                             onClick={() => onIconClick("color")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "color" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/color-wheel.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Color</span>
//                         </button>
//                         <button
//                             onClick={() => onIconClick("fabric")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "fabric" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/textile.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Fabric</span>
//                         </button>
//                         <button
//                             onClick={() => onIconClick("collar")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "collar" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/collar.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Collar</span>
//                         </button>
//                         <button
//                             onClick={() => onIconClick("size")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "size" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/measuring-tape.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Size</span>
//                         </button>
//                         <button
//                             onClick={() => onIconClick("sleeves")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "sleeves" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/sleeves.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Sleeves</span>
//                         </button>
//                         <button
//                             onClick={() => onIconClick("cap")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cap" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/cap.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Cap</span>
//                         </button>
//                         <button
//                             onClick={() => onIconClick("zipper")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "zipper" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/zipper.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Zipper</span>
//                         </button>
//                         <button
//                             onClick={() => onIconClick("cuff")}
//                             className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cuff" ? "ring-2 ring-blue-500" : ""
//                                 }`}
//                         >
//                             <img src="/img/top-left-image/cuff.png" className="w-12 h-12 mb-1" />
//                             <span className="text-xs text-gray-600">Cuff</span>
//                         </button>
//                     </div>
//                 </div>
//                 <div className="relative ">
//                     {PANELS[active] && (
//                         <div
//                             ref={panelRef}
//                             className="absolute top-0 left-0 z-30 w-[275px] bg-white shadow-xl rounded-xl p-3">
//                             <h5 className="font-semibold text-gray-700 mb-2">
//                                 {PANELS[active].title}
//                             </h5>
//                             {PANELS[active].type === "colors" && (
//                                 <div className="grid grid-cols-5 gap-3 relative">
//                                     <button
//                                         onClick={() => setShowColorPicker(true)}
//                                         className="w-10 h-10 rounded-full"
//                                     >
//                                         <img
//                                             src="/img/top-left-image/color-wheel.png"
//                                             className="w-12"
//                                         />
//                                     </button>

//                                     {PANELS[active].data.map((hex, i) => (
//                                         <button
//                                             key={i}
//                                             onClick={() => {
//                                                 applyBaseColorToModel(hex)
//                                                 setColor(hex)
//                                             }}
//                                             className="w-10 h-10 rounded-full shadow border"
//                                             style={{ background: hex }}
//                                         />
//                                     ))}
//                                 </div>
//                             )}

//                             {showColorPicker && (
//                                 <ColorPickerPopup
//                                     value={color}
//                                     onChange={(newColor) => {
//                                         setColor(newColor)
//                                         applyBaseColorToModel(newColor)
//                                     }}
//                                     onClose={() => setShowColorPicker(false)}
//                                 />
//                             )}

//                             {PANELS[active].type === "textures" && (
//                                 <div className="grid grid-cols-3 gap-3">
//                                     {PANELS[active].data.map((tex, i) => (
//                                         <button
//                                             key={i}
//                                             className="w-20 h-20 bg-cover bg-center rounded-md shadow border"
//                                             style={{ backgroundImage: `url(${tex})` }}
//                                         />
//                                     ))}
//                                 </div>
//                             )}

//                             {PANELS[active].type === "options" && (
//                                 <div className="grid grid-cols-3 gap-3">
//                                     {PANELS[active].data.map((opt, i) => (
//                                         <button key={i} className="p-2 border rounded-lg shadow">
//                                             <img src={opt} className="w-full" />
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}

//                             {PANELS[active].type === "size" && (
//                                 <div className="flex gap-2">
//                                     {PANELS[active].data.map((size, i) => (
//                                         <button
//                                             key={i}
//                                             className="px-3 py-2 border rounded-lg shadow text-sm"
//                                         >
//                                             {size}
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* CENTER MODEL VIEWER */}
//                 <div className="relative flex-1 flex flex-col items-center mt-6">
//                     {/* <div className="absolute top-10 w-[400px] h-[400px] bg-[#BEE0FF] rounded-full"></div>
//                     {mounted && (
//                         <model-viewer
//                             ref={mvRef}
//                             src={modelSrc}
//                             alt="3D Uniform Model"
//                             camera-controls
//                             auto-rotate={autoRotate}
//                             environment-image="neutral"
//                             disable-tap
//                             style={{
//                                 height: '650px',
//                                 background: 'transparent',
//                             }}
//                         />
//                     )} */}

//                     <div className="absolute top-[-10] w-[360px] h-[360px] bg-[#BEE0FF] rounded-full"></div>
//                     <div className="relative z-10">
//                         <Image
//                             src="/img/uniform/uniform.png"
//                             alt="Uniform"
//                             width={350}
//                             height={500}
//                             className="object-contain"
//                             priority
//                         />
//                     </div>
//                     {/* BOTTOM TOOLBAR */}
//                     <div className="absolute bottom-[30px] flex">
//                         <div className="z-20 mt-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl px-3 py-2 flex items-center gap-4">
//                             <button className="p-2 rounded-md">
//                                 <img src="/img/top-left-image/cursor.png" className="w-5 h-5 invert" />
//                             </button>
//                             <div className="w-px h-6 bg-gray-300"></div>
//                             <button className="p-2">
//                                 <img src="/img/top-left-image/hand.png" className="w-5 h-5" />
//                             </button>
//                             <div className="w-px h-6 bg-gray-300"></div>
//                             <button className="p-2" onClick={undoCamera}>
//                                 <img src="/img/top-left-image/undo.png" className="w-5 h-5" />
//                             </button>
//                             <button className="p-2" onClick={redoCamera}>
//                                 <img src="/img/top-left-image/redo.png" className="w-5 h-5" />
//                             </button>
//                             <div className="w-px h-6 bg-gray-300"></div>
//                             <button className="p-2" onClick={zoomIn}>
//                                 <span className="text-lg font-bold">+</span>
//                             </button>
//                             <span className="text-sm font-semibold text-gray-700">
//                                 {zoomPercent}%
//                             </span>
//                             <button className="p-2" onClick={zoomOut}>
//                                 <span className="text-lg font-bold">−</span>
//                             </button>
//                             <div className="w-px h-6 bg-gray-300"></div>
//                             <button className="p-2 flex items-center gap-1" onClick={rotate90}>
//                                 <img src="/img/top-left-image/rotate.png" className="w-5 h-5" />
//                                 <span className="text-sm text-gray-700">90°</span>
//                             </button>
//                             <div className="w-px h-6 bg-gray-300"></div>
//                             <button className="p-2 flex items-center gap-1">
//                                 <img src="/img/top-left-image/Group.png" className="w-5 h-5" />
//                                 <span className="text-sm text-gray-700">3D</span>
//                             </button>
//                         </div>
//                         <div>
//                             <Button
//                                 type="submit"
//                                 variant="solid"
//                                 className="w-full ml-10 mt-7 bg-[#1C2C56] hover:bg-[#1C2C56] text-white py-3" onClick={handleUniformDesignResult}
//                             >
//                                Confirm Design
//                             </Button>
//                         </div>

//                     </div>


//                 </div>
//             </div>

//         </section>
//     )
// }

// export default Uniform3DmoduleDegisn



'use client'
import Image from 'next/image'
import '@google/model-viewer'
import { useEffect, useRef, useState } from 'react'
import ColorPickerPopup from './ColorPickerPopup'
// const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
const SAMPLE_MODEL = '/img/3dmodels/doctor_uniform.glb'
const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { RiTable2 } from 'react-icons/ri'
import { TbTable } from 'react-icons/tb'
import { IoIosArrowForward } from 'react-icons/io'
import { FiMinus, FiPlus } from "react-icons/fi";

const Uniform3DmoduleDegisn = () => {
    const [shapeOpen, setShapeOpen] = useState(false)
    const [sittingOpen, setSittingOpen] = useState(false)

    // const [tableShape, setTableShape] = useState("Circle")
    const [tableSitting, setTableSitting] = useState(6)

    const [selectedCategory, setSelectedCategory] = useState("Tablecloths")
    const [categoryView, setCategoryView] = useState("list"); // list | tablecloths

    const [fabric, setFabric] = useState("Crushed Velvet");
    const [style, setStyle] = useState("Round");
    const [colorr, setColorr] = useState("Beige");
    const [chairColor, setChairColor] = useState(null)
    const [centrePiece, setCentrePiece] = useState(null)


    const router = useRouter()
    const mvRef = useRef(null)
    const [modelSrc, setModelSrc] = useState(SAMPLE_MODEL)
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


    const handleUniformDesignResult = () => {
        router.push("/cart-summary");
    };
    function onIconClick(key) {
        setActive(prev => {
            if (prev === key) {
                setShowColorPicker(false)
                return ''
            }
            return key
        })
    }
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
                                src="/img/table-form/themes/theme3.png"
                                alt="Uniform"
                                width={700}
                                height={500}
                                className="object-contain "
                                priority
                            /> : <Image
                                src="/img/table-form/3dtable.png"
                                alt="Uniform"
                                width={500}
                                height={500}
                                className="object-contain"
                                priority
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
