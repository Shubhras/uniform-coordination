
// 'use client'

// import '@google/model-viewer'
// import { useEffect, useRef, useState } from 'react'
// import Card from '@/components/ui/Card'
// import Button from '@/components/ui/Button'
// import Link from 'next/link'
// import { BiReset } from 'react-icons/bi'
// import { FiPause, FiPlay } from 'react-icons/fi'

// const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
// const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

// const icons = [
//   { key: 'fabric', label: 'Fabric' },
//   { key: 'collar', label: 'Collar' },
//   { key: 'size', label: 'Size' },
//   { key: 'sleeves', label: 'Sleeves' },
//   { key: 'cap', label: 'Cap' },
//   { key: 'zipper', label: 'Zipper' },
//   { key: 'cuff', label: 'Cuff' },
// ]

// export default function Uniforms3DmoduleRender() {
//   const mvRef = useRef(null)
//   const [modelSrc, setModelSrc] = useState(SAMPLE_MODEL)
//   const [active, setActive] = useState('collar')
//   const [autoRotate, setAutoRotate] = useState(true)
//   const [color, setColor] = useState('#7fc7ff')
//   const [status, setStatus] = useState('loading')
//   const [fieldOfView, setFieldOfView] = useState(45); // zoom control
//   const [cameraHistory, setCameraHistory] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);

//   /** LOAD MODEL + APPLY COLOR */
//   useEffect(() => {
//     const mv = mvRef.current
//     if (!mv) return

//     function onError() {
//       if (modelSrc !== FALLBACK_MODEL) setModelSrc(FALLBACK_MODEL)
//     }

//     function onLoad() {
//       setStatus('loaded')
//       applyBaseColorToModel(color)
//     }

//     mv.addEventListener('error', onError)
//     mv.addEventListener('load', onLoad)

//     return () => {
//       mv.removeEventListener('error', onError)
//       mv.removeEventListener('load', onLoad)
//     }
//   }, [mvRef, modelSrc])

//   /** APPLY COLOR TO GLB MATERIAL */
//   async function applyBaseColorToModel(hex) {
//     const mv = mvRef.current
//     if (!mv) return

//     try {
//       await mv.updateComplete
//     } catch { }

//     try {
//       const model = mv.model
//       if (!model) return

//       const mats = model.materials || []
//       if (mats.length === 0) return

//       const r = parseInt(hex.slice(1, 3), 16) / 255
//       const g = parseInt(hex.slice(3, 5), 16) / 255
//       const b = parseInt(hex.slice(5, 7), 16) / 255

//       for (const m of mats) {
//         if (m?.pbrMetallicRoughness?.setBaseColorFactor) {
//           m.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1])
//         }
//       }

//       mv.invalidate?.()
//     } catch (e) {
//       console.log('Color update error:', e)
//     }
//   }

//   /** PRESET COLOR CLICK */
//   function onPresetColor(hex) {
//     setColor(hex)
//     applyBaseColorToModel(hex)
//   }

//   /** ROTATION TOGGLE */
//   function onToggleAutoRotate() {
//     setAutoRotate(v => !v)
//     if (mvRef.current) mvRef.current.autoRotate = !autoRotate
//   }

//   /** RESET CAMERA */
//   function onResetView() {
//     const mv = mvRef.current
//     if (!mv) return
//     mv.cameraOrbit = '0deg 75deg 2.5m'
//     mv.jumpCameraToGoal()
//   }

//   /** LEFT ICON SELECT */
//   function onIconClick(key) {
//     setActive(key)
//   }

//   function saveCameraState() {
//     const mv = mvRef.current;
//     if (!mv) return;

//     const state = {
//       orbit: mv.getCameraOrbit(),
//       fov: mv.getFieldOfView(),
//     };

//     setCameraHistory((prev) => [...prev, state]);
//   }
//   function zoomIn() {
//     saveCameraState();

//     const mv = mvRef.current;
//     let fov = mv.getFieldOfView();
//     fov = Math.max(10, fov - 5); // limit zoom
//     mv.fieldOfView = `${fov}deg`;
//   }

//   function zoomOut() {
//     saveCameraState();

//     const mv = mvRef.current;
//     let fov = mv.getFieldOfView();
//     fov = Math.min(120, fov + 5);
//     mv.fieldOfView = `${fov}deg`;
//   }
//   function rotate90() {
//     saveCameraState();

//     const mv = mvRef.current;
//     const orbit = mv.getCameraOrbit();

//     const newOrbit = {
//       theta: orbit.theta + 90,
//       phi: orbit.phi,
//       radius: orbit.radius
//     };

//     mv.cameraOrbit = `${newOrbit.theta}deg ${newOrbit.phi}deg ${newOrbit.radius}m`;
//   }
//   function undoCamera() {
//     if (cameraHistory.length === 0) return;

//     const mv = mvRef.current;

//     const last = cameraHistory[cameraHistory.length - 1];
//     setCameraHistory((prev) => prev.slice(0, -1));
//     setRedoStack((prev) => [...prev, last]);

//     mv.cameraOrbit = `${last.orbit.theta}deg ${last.orbit.phi}deg ${last.orbit.radius}m`;
//     mv.fieldOfView = `${last.fov}deg`;
//   }
//   function redoCamera() {
//     if (redoStack.length === 0) return;

//     const mv = mvRef.current;

//     const last = redoStack[redoStack.length - 1];
//     setRedoStack((prev) => prev.slice(0, -1));

//     mv.cameraOrbit = `${last.orbit.theta}deg ${last.orbit.phi}deg ${last.orbit.radius}m`;
//     mv.fieldOfView = `${last.fov}deg`;
//   }


//   return (
//     <Card className="relative overflow-visible p-6 bg-[#F4F7FB]">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h4 className="text-lg font-semibold">3D Uniform Configurator</h4>
//       </div>

//       <div className="mt-6 flex gap-6">

//         {/* LEFT TOOLBAR */}
//         <div className="w-[80px] flex flex-col items-center">

//           {/* TOP BUTTON */}
//           <div className="flex items-center gap-2 px-4 py-2 bg-[#2F62FF] text-white rounded-lg shadow text-sm mb-4">
//             Top <span className="text-xs">›</span>
//           </div>

//           {/* ICON LIST */}
//           <div className="flex flex-col gap-5 w-full">

//             {/* Fabric icon */}
//             <button
//               onClick={() => onIconClick("collar")}
//               className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "collar" ? "ring-2 ring-blue-500" : ""
//                 }`}
//             >
//               <img src="/img/top-left-image/color-wheel.png" className="w-12 h-12 mb-1" />
//               <span className="text-sm text-gray-600">Collar</span>
//             </button>
//             {/* COLOR WHEEL ICON */}
//             <button
//               onClick={() => onIconClick("fabric")}
//               className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "fabric" ? "ring-2 ring-blue-500" : ""
//                 }`}
//             >
//               <img src="/img/top-left-image/textile.png" className="w-12 h-12 mb-1" />
//               <span className="text-sm text-gray-600">Fabric</span>
//             </button>
//             {/* Size icon */}
//             <button
//               onClick={() => onIconClick("size")}
//               className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "size" ? "ring-2 ring-blue-500" : ""
//                 }`}
//             >
//               <img src="/img/top-left-image/measuring-tape.png" className="w-12 h-12 mb-1" />
//               <span className="text-sm text-gray-600">Size</span>
//             </button>

//             {/* Sleeves */}
//             <button
//               onClick={() => onIconClick("sleeves")}
//               className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "sleeves" ? "ring-2 ring-blue-500" : ""
//                 }`}
//             >
//               <img src="/img/top-left-image/sleeves.png" className="w-12 h-12 mb-1" />
//               <span className="text-sm text-gray-600">Sleeves</span>
//             </button>

//             {/* Cap */}
//             <button
//               onClick={() => onIconClick("cap")}
//               className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cap" ? "ring-2 ring-blue-500" : ""
//                 }`}
//             >
//               <img src="/img/top-left-image/cap.png" className="w-12 h-12 mb-1" />
//               <span className="text-sm text-gray-600">Cap</span>
//             </button>

//             {/* Zipper */}
//             <button
//               onClick={() => onIconClick("zipper")}
//               className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "zipper" ? "ring-2 ring-blue-500" : ""
//                 }`}
//             >
//               <img src="/img/top-left-image/zipper.png" className="w-12 h-12 mb-1" />
//               <span className="text-sm text-gray-600">Zipper</span>
//             </button>

//             {/* Cuff */}
//             <button
//               onClick={() => onIconClick("cuff")}
//               className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cuff" ? "ring-2 ring-blue-500" : ""
//                 }`}
//             >
//               <img src="/img/top-left-image/cuff.png" className="w-12 h-12 mb-1" />
//               <span className="text-sm text-gray-600">Cuff</span>
//             </button>
//           </div>

//         </div>

//         {/* CENTER MODEL VIEWER */}
//         <div className="relative flex-1 flex flex-col items-center">

//           {/* Blue Circle */}
//           <div className="absolute top-10 w-[500px] h-[500px] bg-[#BEE0FF] rounded-full"></div>

//           {/* MODEL VIEWER */}
//           <model-viewer
//             ref={mvRef}
//             src={modelSrc}
//             alt="3D Uniform Model"
//             camera-controls
//             auto-rotate={autoRotate}
//             environment-image="neutral"
//             disable-tap
//             style={{
//               width: "480px",
//               height: "600px",
//               zIndex: 10,
//               background: "transparent",
//             }}
//           />

//           {/* BOTTOM TOOLBAR */}
//           {/* <div className="relative z-20 mt-4 bg-white shadow-xl rounded-xl px-6 py-3 flex gap-6 items-center">
//             <button onClick={onToggleAutoRotate}>
//               {autoRotate ? <FiPause size={18} /> : <FiPlay size={18} />}
//             </button>
//             <button onClick={onResetView}>
//               <BiReset size={20} />
//             </button>
//           </div> */}
//           <div className="relative z-20 mt-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl px-6 py-3 flex items-center gap-4">

//             {/* Cursor */}
//             <button className="p-2 bg-[#202A57] rounded-md">
//               <img src="/img/top-left-image/cursor.png" className="w-5 h-5 invert" />
//             </button>

//             <div className="w-px h-6 bg-gray-300"></div>

//             {/* Hand */}
//             <button className="p-2">
//               <img src="/img/top-left-image/hand.png" className="w-5 h-5" />
//             </button>

//             <div className="w-px h-6 bg-gray-300"></div>

//             {/* Undo */}
//             <button className="p-2" onClick={undoCamera}>
//               <img src="/img/top-left-image/undo.png" className="w-5 h-5" />
//             </button>

//             {/* Redo */}
//             <button className="p-2" onClick={redoCamera}>
//               <img src="/img/top-left-image/redo.png" className="w-5 h-5" />
//             </button>

//             <div className="w-px h-6 bg-gray-300"></div>

//             {/* Zoom In */}
//             <button className="p-2" onClick={zoomIn}>
//               <span className="text-lg font-bold">+</span>
//             </button>

//             <span className="text-sm font-semibold text-gray-700">
//               {Math.round(fieldOfView)}%
//             </span>

//             {/* Zoom Out */}
//             <button className="p-2" onClick={zoomOut}>
//               <span className="text-lg font-bold">−</span>
//             </button>

//             <div className="w-px h-6 bg-gray-300"></div>

//             {/* Rotate */}
//             <button className="p-2 flex items-center gap-1" onClick={rotate90}>
//               <img src="/img/top-left-image/rotate.svg" className="w-5 h-5" />
//               <span className="text-sm text-gray-700">90°</span>
//             </button>

//             <div className="w-px h-6 bg-gray-300"></div>

//             {/* 3D View Toggle (optional) */}
//             <button className="p-2 flex items-center gap-1">
//               <img src="/img/top-left-image/Group.png" className="w-5 h-5" />
//               <span className="text-sm text-gray-700">3D</span>
//             </button>

//           </div>
//         </div>

//         {/* RIGHT PANEL (FABRIC SETTINGS) */}
//         <div className="w-[275px]">

//           {/* FABRIC COLOR PANEL */}
//           {active === "collar" && (
//             <div className="bg-white shadow-xl rounded-xl p-4">

//               <h3 className="font-semibold text-gray-700 mb-3">Fabric Colors</h3>

//               {/* Color Swatches */}
//               <div className="grid grid-cols-5 gap-3 mb-4">
//                 {[
//                   "#1A73E8", "#34A853", "#EA4335", "#FBBC05", "#FF7043",
//                   "#8E24AA", "#00ACC1", "#43A047", "#C2185B", "#6D4C41"
//                 ].map((hex, i) => (
//                   <button
//                     key={i}
//                     onClick={() => onPresetColor(hex)}
//                     className="w-10 h-10 rounded-full shadow border"
//                     style={{ background: hex }}
//                   />
//                 ))}
//               </div>

//               {/* Texture Title */}
//               {/* <h4 className="font-medium text-gray-600 mb-2">Textures</h4> */}

//               {/* Fabric Texture Grid */}
//               {/* <div className="grid grid-cols-3 gap-3">
//                 {[
//                   "/img/avatars/thumb-1.jpg",
//                   "/img/avatars/thumb-2.jpg",
//                   "/img/avatars/thumb-3.jpg",
//                   "/img/avatars/thumb-4.jpg",
//                   "/img/avatars/thumb-5.jpg",
//                   "/img/avatars/thumb-6.jpg",
//                 ].map((tex, i) => (
//                   <button
//                     key={i}
//                     className="w-20 h-20 bg-cover bg-center rounded-md shadow border"
//                     style={{ backgroundImage: `url(${tex})` }}
//                     onClick={() => console.log("Texture:", tex)}
//                   />
//                 ))}
//               </div> */}

//             </div>
//           )}

//         </div>
//       </div>
//     </Card>
//   )
// }


'use client'

import '@google/model-viewer'
import { useEffect, useRef, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { BiReset } from 'react-icons/bi'
import { FiPause, FiPlay } from 'react-icons/fi'
import ColorPickerPopup from './ColorPickerPopup'

// const SAMPLE_MODEL = '/img/3dmodels/Astronaut.glb'
const SAMPLE_MODEL = '/img/3dmodels/doctor_uniform.glb'
const FALLBACK_MODEL = '' //'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

const PANELS = {
  color: {
    title: "Color",
    type: "colors",
    data: ["#1A73E8", "#34A853", "#EA4335", "#FBBC05", "#FF7043", "#8E24AA", "#00ACC1", "#43A047", "#C2185B", "#6D4C41"]
  },

  fabric: {
    title: "Fabric",
    type: "textures",
    data: [
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
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
    data: ["XS", "S", "M", "L", "XL"]
  },

  sleeves: {
    title: "Sleeves",
    type: "options",
    data: [
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
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
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
    ]
  },

  cuff: {
    title: "Cuff",
    type: "options",
    data: [
      "/img/avatars/thumb-1.jpg",
      "/img/avatars/thumb-1.jpg",
    ]
  }
};

export default function Uniforms3DmoduleRender() {
  const mvRef = useRef(null)
  const [modelSrc, setModelSrc] = useState(SAMPLE_MODEL)
  const [active, setActive] = useState('collar')
  const [autoRotate, setAutoRotate] = useState(true)
  const [color, setColor] = useState('#7fc7ff')
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [status, setStatus] = useState('loading')
  const [fieldOfView, setFieldOfView] = useState(45); // zoom control
  const [cameraHistory, setCameraHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  /** LOAD MODEL + APPLY COLOR */
  useEffect(() => {
    const mv = mvRef.current
    if (!mv) return

    function onError() {
      if (modelSrc !== FALLBACK_MODEL) setModelSrc(FALLBACK_MODEL)
    }

    function onLoad() {
      setStatus('loaded')
      applyBaseColorToModel(color)
    }

    mv.addEventListener('error', onError)
    mv.addEventListener('load', onLoad)

    return () => {
      mv.removeEventListener('error', onError)
      mv.removeEventListener('load', onLoad)
    }
  }, [mvRef, modelSrc])

  /** APPLY COLOR TO GLB MATERIAL */
  // async function applyBaseColorToModel(hex) {
  //   const mv = mvRef.current
  //   if (!mv) return

  //   try {
  //     await mv.updateComplete
  //   } catch { }

  //   try {
  //     const model = mv.model
  //     if (!model) return

  //     const mats = model.materials || []
  //     if (mats.length === 0) return

  //     const r = parseInt(hex.slice(1, 3), 16) / 255
  //     const g = parseInt(hex.slice(3, 5), 16) / 255
  //     const b = parseInt(hex.slice(5, 7), 16) / 255

  //     for (const m of mats) {
  //       console.log('ffffffffffffffffffff',m);
  //       if (m?.pbrMetallicRoughness?.setBaseColorFactor) {
  //         m.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1])
  //       }
  //     }

  //     mv.invalidate?.()
  //   } catch (e) {
  //     console.log('Color update error:', e)
  //   }
  // }

  //   async function applyBaseColorToModel(hex ) {
  //     let targetPart ="leg2"
  //   const mv = mvRef.current;
  //   if (!mv) return;

  //   await mv.updateComplete;

  //   const model = mv.model;
  //   if (!model) return;

  //   const r = parseInt(hex.slice(1, 3), 16) / 255;
  //   const g = parseInt(hex.slice(3, 5), 16) / 255;
  //   const b = parseInt(hex.slice(5, 7), 16) / 255;

  //   // LOOP ALL MATERIALS
  //   model.materials.forEach((mat) => {

  //     const name = mat.name?.toLowerCase();
  //   console.log('ffffffffffffffffffff',mat);
  //     // If no targetPart → apply everywhere (old behavior)
  //     if (!targetPart) {
  //       mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
  //       return;
  //     }

  //     // Apply only to the target mesh/material
  //     if (name.includes(targetPart.toLowerCase())) {
  //       mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
  //     }
  //   });

  //   mv.invalidate?.();
  // }

  function getAllChildNodes(object, list = []) {
    if (!object) return list;                 // safety check 1
    if (!object.children) return list;         // safety check 2

    if (object.name) list.push(object.name);   // add only valid names

    object.children.forEach(child => {
      if (child) getAllChildNodes(child, list); // safety check 3
    });

    return list;
  }
  async function applyBaseColorToModel(hex, targetPart = null) {
    targetPart = "FABRIC 2_FRONT_24961"
    const mv = mvRef.current;
    if (!mv) return;

    await mv.updateComplete;

    const model = mv.model;
    if (!model) return;

    // HEX → RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // 🟦 DEBUG: ALL MATERIALS
    //console.log("Materials:");
    // model.materials.forEach(mat => console.log(mat.name));
    model.materials.forEach(mat => {
      // console.log(mat.name)
    }
    );

    // 🟥 DEBUG: ALL NODE NAMES
    const nodes = getAllChildNodes(model.scene);
    //console.log("Nodes:", nodes);

    // Apply to all if no part selected
    if (!targetPart) {
      model.materials.forEach(mat => {
        mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
      });
      mv.invalidate?.();
      return;
    }

    const key = targetPart.toLowerCase();

    // 🟢 FIRST TRY — MATCH MATERIAL BY NAME
    model.materials.forEach(mat => {
      const name = mat.name?.toLowerCase() || "";
      if (name.includes(key)) {
        //console.log("Matched MATERIAL:", mat.name);
        mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
      }
    });

    // 🟡 SECOND TRY — MATCH MESH BY NAME + CHANGE ITS MATERIAL
    // model.scene.traverse((node) => {
    //   if (node.isMesh) {
    //     const nodeName = node.name?.toLowerCase() || "";

    //     if (nodeName.includes(key)) {
    //       console.log("Matched MESH:", node.name);

    //       if (node.material?.pbrMetallicRoughness) {
    //         node.material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
    //       }
    //     }
    //   }
    // });

    mv.invalidate?.();
  }
  /** PRESET COLOR CLICK */
  function onPresetColor(hex) {
    setColor(hex)
    applyBaseColorToModel(hex)

    //applyBaseColorToModel(hex, active);  
  }

  /** ROTATION TOGGLE */
  function onToggleAutoRotate() {
    setAutoRotate(v => !v)
    if (mvRef.current) mvRef.current.autoRotate = !autoRotate
  }

  /** RESET CAMERA */
  function onResetView() {
    const mv = mvRef.current
    if (!mv) return
    mv.cameraOrbit = '0deg 75deg 2.5m'
    mv.jumpCameraToGoal()
  }

  /** LEFT ICON SELECT */
  function onIconClick(key) {
    setActive(key)
  }

  function saveCameraState() {
    const mv = mvRef.current;
    if (!mv) return;

    const state = {
      orbit: mv.getCameraOrbit(),
      fov: mv.getFieldOfView(),
    };

    setCameraHistory((prev) => [...prev, state]);
  }
  function zoomIn() {
    saveCameraState();

    const mv = mvRef.current;
    let fov = mv.getFieldOfView();
    fov = Math.max(10, fov - 5); // limit zoom
    mv.fieldOfView = `${fov}deg`;
  }

  function zoomOut() {
    saveCameraState();

    const mv = mvRef.current;
    let fov = mv.getFieldOfView();
    fov = Math.min(120, fov + 5);
    mv.fieldOfView = `${fov}deg`;
  }
  function rotate90() {
    saveCameraState();

    const mv = mvRef.current;
    const orbit = mv.getCameraOrbit();

    const newOrbit = {
      theta: orbit.theta + 90,
      phi: orbit.phi,
      radius: orbit.radius
    };

    mv.cameraOrbit = `${newOrbit.theta}deg ${newOrbit.phi}deg ${newOrbit.radius}m`;
  }
  function undoCamera() {
    if (cameraHistory.length === 0) return;

    const mv = mvRef.current;

    const last = cameraHistory[cameraHistory.length - 1];
    setCameraHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);

    mv.cameraOrbit = `${last.orbit.theta}deg ${last.orbit.phi}deg ${last.orbit.radius}m`;
    mv.fieldOfView = `${last.fov}deg`;
  }
  function redoCamera() {
    if (redoStack.length === 0) return;

    const mv = mvRef.current;

    const last = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    mv.cameraOrbit = `${last.orbit.theta}deg ${last.orbit.phi}deg ${last.orbit.radius}m`;
    mv.fieldOfView = `${last.fov}deg`;
  }


  return (
    <Card className="relative overflow-visible p-6 bg-[#F4F7FB]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">3D Uniform Configurator</h4>
      </div>

      <div className="mt-6 flex gap-6">

        {/* LEFT TOOLBAR */}
        <div className="w-[80px] flex flex-col items-center">

          {/* TOP BUTTON */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#2F62FF] text-white rounded-lg shadow text-sm mb-4">
            Top <span className="text-xs">›</span>
          </div>

          {/* ICON LIST */}
          <div className="flex flex-col gap-5 w-full">
            <button
              onClick={() => onIconClick("color")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "collar" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/color-wheel.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Collar</span>
            </button>

            <button
              onClick={() => onIconClick("fabric")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "fabric" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/textile.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Fabric</span>
            </button>

            <button
              onClick={() => onIconClick("collar")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "collar" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/collar.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Collar</span>
            </button>
            {/* Size icon */}
            <button
              onClick={() => onIconClick("size")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "size" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/measuring-tape.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Size</span>
            </button>

            {/* Sleeves */}
            <button
              onClick={() => onIconClick("sleeves")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "sleeves" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/sleeves.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Sleeves</span>
            </button>

            {/* Cap */}
            <button
              onClick={() => onIconClick("cap")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cap" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/cap.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Cap</span>
            </button>

            {/* Zipper */}
            <button
              onClick={() => onIconClick("zipper")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "zipper" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/zipper.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Zipper</span>
            </button>

            {/* Cuff */}
            <button
              onClick={() => onIconClick("cuff")}
              className={`w-[75px] bg-white rounded-xl shadow-md p-2 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cuff" ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <img src="/img/top-left-image/cuff.png" className="w-12 h-12 mb-1" />
              <span className="text-sm text-gray-600">Cuff</span>
            </button>
          </div>
        </div>

        <div className="w-[275px]">
          {PANELS[active] && (
            <div className="bg-white shadow-xl rounded-xl p-4">
              <h5 className="font-semibold text-gray-700 mb-3">
                {PANELS[active].title}
              </h5>
              {/* COLORS */}
              {PANELS[active].type === "colors" && (
                <div className="grid grid-cols-5 gap-3 relative">
                  <button
                    onClick={() => setShowColorPicker(true)}
                    className="w-10 h-10 rounded-full"
                  >
                    <img src="/img/top-left-image/color-wheel.png" className="w-12" />
                  </button>
                  {PANELS[active].data.map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        applyBaseColorToModel(hex);
                        setColor(hex);
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
                    setColor(newColor);
                    applyBaseColorToModel(newColor);
                  }}
                  onClose={() => setShowColorPicker(false)}
                />
              )}

              {/* TEXTURES */}
              {PANELS[active].type === "textures" && (
                <div className="grid grid-cols-3 gap-3">
                  {PANELS[active].data.map((tex, i) => (
                    <button
                      key={i}
                      className="w-20 h-20 bg-cover bg-center rounded-md shadow border"
                      style={{ backgroundImage: `url(${tex})` }}
                      onClick={() => console.log("Texture:", tex)}
                    />
                  ))}
                </div>
              )}

              {/* OPTIONS (image-based) */}
              {PANELS[active].type === "options" && (
                <div className="grid grid-cols-2 gap-3">
                  {PANELS[active].data.map((opt, i) => (
                    <button key={i} className="p-2 border rounded-lg shadow">
                      <img src={opt} className="w-full" />
                    </button>
                  ))}
                </div>
              )}

              {/* SIZE SELECT */}
              {PANELS[active].type === "size" && (
                <div className="flex gap-2">
                  {PANELS[active].data.map((size, i) => (
                    <button
                      key={i}
                      className="px-3 py-2 border rounded-lg shadow text-sm"
                      onClick={() => console.log("Selected size:", size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* CENTER MODEL VIEWER */}
        <div className="relative flex-1 flex flex-col items-center">

          {/* Blue Circle */}
          <div className="absolute top-10 w-[500px] h-[500px] bg-[#BEE0FF] rounded-full"></div>

          {/* MODEL VIEWER */}
          <model-viewer
            ref={mvRef}
            src={modelSrc}
            alt="3D Uniform Model"
            camera-controls
            auto-rotate={autoRotate}
            environment-image="neutral"
            disable-tap
            style={{
              width: "480px",
              height: "600px",
              zIndex: 10,
              background: "transparent",
            }}
          />
          {/* BOTTOM TOOLBAR */}
          <div className="relative z-20 mt-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl px-6 py-3 flex items-center gap-4">

            {/* Cursor */}
            <button className="p-2 bg-[#202A57] rounded-md">
              <img src="/img/top-left-image/cursor.png" className="w-5 h-5 invert" />
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Hand */}
            <button className="p-2">
              <img src="/img/top-left-image/hand.png" className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Undo */}
            <button className="p-2" onClick={undoCamera}>
              <img src="/img/top-left-image/undo.png" className="w-5 h-5" />
            </button>

            {/* Redo */}
            <button className="p-2" onClick={redoCamera}>
              <img src="/img/top-left-image/redo.png" className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Zoom In */}
            <button className="p-2" onClick={zoomIn}>
              <span className="text-lg font-bold">+</span>
            </button>

            <span className="text-sm font-semibold text-gray-700">
              {Math.round(fieldOfView)}%
            </span>

            {/* Zoom Out */}
            <button className="p-2" onClick={zoomOut}>
              <span className="text-lg font-bold">−</span>
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Rotate */}
            <button className="p-2 flex items-center gap-1" onClick={rotate90}>
              <img src="/img/top-left-image/rotate.png" className="w-5 h-5" />
              <span className="text-sm text-gray-700">90°</span>
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* 3D View Toggle (optional) */}
            <button className="p-2 flex items-center gap-1">
              <img src="/img/top-left-image/Group.png" className="w-5 h-5" />
              <span className="text-sm text-gray-700">3D</span>
            </button>

          </div>
        </div>



      </div>
    </Card>
  )
}