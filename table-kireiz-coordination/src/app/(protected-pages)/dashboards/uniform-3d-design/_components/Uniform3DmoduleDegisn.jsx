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



const Uniform3DmoduleDegisn = () => {
     const router = useRouter()
    const mvRef = useRef(null)
    const [modelSrc, setModelSrc] = useState(SAMPLE_MODEL)
    const [active, setActive] = useState('')
    const [autoRotate, setAutoRotate] = useState(true)
    const [color, setColor] = useState('#7fc7ff')
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [status, setStatus] = useState('loading')
    const [fieldOfView, setFieldOfView] = useState(45); // zoom control
    const [cameraHistory, setCameraHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [mounted, setMounted] = useState(false)
    const panelRef = useRef(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('@google/model-viewer')
        }
    }, [])
    useEffect(() => {
        setMounted(true)
    }, [])
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
        setActive(prev => {
            if (prev === key) {
                setShowColorPicker(false)
                return ''
            }
            return key
        })
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
        if (!mv) return;

        let fov = mv.getFieldOfView();
        fov = Math.max(10, fov - 5);   // min zoom

        mv.fieldOfView = `${fov}deg`;
        setFieldOfView(fov);           // UPDATE UI
    }

    function zoomOut() {
        saveCameraState();
        const mv = mvRef.current;
        if (!mv) return;

        let fov = mv.getFieldOfView();
        fov = Math.min(120, fov + 5);  // max zoom

        mv.fieldOfView = `${fov}deg`;
        setFieldOfView(fov);           // UPDATE UI
    }
    const zoomPercent = Math.round(((120 - fieldOfView) / 110) * 100);

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

  const handleUniformDesignResult = () => {
        router.push("/dashboards/design-result");
    };
    return (
        <section className="w-full mx-auto bg-white flex flex-col px-6 lg:px-4 py-4 gap-10 mt-15 ">
            <div className="flex gap-6">
                <div className="w-[80px] flex flex-col items-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1c2c56] text-white rounded-lg shadow text-sm mb-2">
                        Top <span className="text-xs">›</span>
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
                        <button
                            onClick={() => onIconClick("fabric")}
                            className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "fabric" ? "ring-2 ring-blue-500" : ""
                                }`}
                        >
                            <img src="/img/top-left-image/textile.png" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-600">Fabric</span>
                        </button>
                        <button
                            onClick={() => onIconClick("collar")}
                            className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "collar" ? "ring-2 ring-blue-500" : ""
                                }`}
                        >
                            <img src="/img/top-left-image/collar.png" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-600">Collar</span>
                        </button>
                        <button
                            onClick={() => onIconClick("size")}
                            className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "size" ? "ring-2 ring-blue-500" : ""
                                }`}
                        >
                            <img src="/img/top-left-image/measuring-tape.png" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-600">Size</span>
                        </button>
                        <button
                            onClick={() => onIconClick("sleeves")}
                            className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "sleeves" ? "ring-2 ring-blue-500" : ""
                                }`}
                        >
                            <img src="/img/top-left-image/sleeves.png" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-600">Sleeves</span>
                        </button>
                        <button
                            onClick={() => onIconClick("cap")}
                            className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cap" ? "ring-2 ring-blue-500" : ""
                                }`}
                        >
                            <img src="/img/top-left-image/cap.png" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-600">Cap</span>
                        </button>
                        <button
                            onClick={() => onIconClick("zipper")}
                            className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "zipper" ? "ring-2 ring-blue-500" : ""
                                }`}
                        >
                            <img src="/img/top-left-image/zipper.png" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-600">Zipper</span>
                        </button>
                        <button
                            onClick={() => onIconClick("cuff")}
                            className={`w-[70px] bg-white rounded-lg shadow-md p-1.5 flex flex-col justify-center items-center hover:shadow-xl transition ${active === "cuff" ? "ring-2 ring-blue-500" : ""
                                }`}
                        >
                            <img src="/img/top-left-image/cuff.png" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-600">Cuff</span>
                        </button>
                    </div>
                </div>
                <div className="relative ">
                    {PANELS[active] && (
                        <div
                            ref={panelRef}
                            className="absolute top-0 left-0 z-30 w-[275px] bg-white shadow-xl rounded-xl p-3">
                            <h5 className="font-semibold text-gray-700 mb-2">
                                {PANELS[active].title}
                            </h5>
                            {PANELS[active].type === "colors" && (
                                <div className="grid grid-cols-5 gap-3 relative">
                                    <button
                                        onClick={() => setShowColorPicker(true)}
                                        className="w-10 h-10 rounded-full"
                                    >
                                        <img
                                            src="/img/top-left-image/color-wheel.png"
                                            className="w-12"
                                        />
                                    </button>

                                    {PANELS[active].data.map((hex, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                applyBaseColorToModel(hex)
                                                setColor(hex)
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
                                <div className="grid grid-cols-3 gap-3">
                                    {PANELS[active].data.map((tex, i) => (
                                        <button
                                            key={i}
                                            className="w-20 h-20 bg-cover bg-center rounded-md shadow border"
                                            style={{ backgroundImage: `url(${tex})` }}
                                        />
                                    ))}
                                </div>
                            )}

                            {PANELS[active].type === "options" && (
                                <div className="grid grid-cols-3 gap-3">
                                    {PANELS[active].data.map((opt, i) => (
                                        <button key={i} className="p-2 border rounded-lg shadow">
                                            <img src={opt} className="w-full" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {PANELS[active].type === "size" && (
                                <div className="flex gap-2">
                                    {PANELS[active].data.map((size, i) => (
                                        <button
                                            key={i}
                                            className="px-3 py-2 border rounded-lg shadow text-sm"
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
                <div className="relative flex-1 flex flex-col items-center mt-6">
                    {/* <div className="absolute top-10 w-[400px] h-[400px] bg-[#BEE0FF] rounded-full"></div>
                    {mounted && (
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

                    <div className="absolute top-[-10] w-[360px] h-[360px] bg-[#BEE0FF] rounded-full"></div>
                    <div className="relative z-10">
                        <Image
                            src="/img/uniform/uniform.png"
                            alt="Uniform"
                            width={350}
                            height={500}
                            className="object-contain"
                            priority
                        />
                    </div>
                    {/* BOTTOM TOOLBAR */}
                    <div className="absolute bottom-[30px] flex">
                        <div className="z-20 mt-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl px-3 py-2 flex items-center gap-4">
                            <button className="p-2 rounded-md">
                                <img src="/img/top-left-image/cursor.png" className="w-5 h-5 invert" />
                            </button>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <button className="p-2">
                                <img src="/img/top-left-image/hand.png" className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <button className="p-2" onClick={undoCamera}>
                                <img src="/img/top-left-image/undo.png" className="w-5 h-5" />
                            </button>
                            <button className="p-2" onClick={redoCamera}>
                                <img src="/img/top-left-image/redo.png" className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <button className="p-2" onClick={zoomIn}>
                                <span className="text-lg font-bold">+</span>
                            </button>
                            <span className="text-sm font-semibold text-gray-700">
                                {zoomPercent}%
                            </span>
                            <button className="p-2" onClick={zoomOut}>
                                <span className="text-lg font-bold">−</span>
                            </button>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <button className="p-2 flex items-center gap-1" onClick={rotate90}>
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
                                className="w-full ml-10 mt-7 bg-[#1C2C56] hover:bg-[#1C2C56] text-white py-3" onClick={handleUniformDesignResult}
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
