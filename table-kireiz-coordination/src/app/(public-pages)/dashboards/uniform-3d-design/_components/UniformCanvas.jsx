'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useRef, Suspense } from 'react'
import UniformModel from './UniformModel'
import { useSnapshot } from 'valtio'
import { uniformState } from './uniformStore'

/**
 * Exposed camera control actions API (zoom, rotate, undo/redo).
 */
export let controlsApi = {
    zoomIn: () => { },
    zoomOut: () => { },
    rotate90: () => { },
    undo: () => { },
    redo: () => { },
}

/**
 * UniformCanvas Component
 * 
 * Renders the 3D Three.js React Three Fiber Canvas with lights, orbit controls, and environment setup.
 */
export default function UniformCanvas() {
    const controlsRef = useRef()
    const snap = useSnapshot(uniformState)

    const history = useRef([])
    const redoStack = useRef([])

    const saveCameraState = () => {
        if (!controlsRef.current) return
        history.current.push({
            position: controlsRef.current.object.position.clone(),
            target: controlsRef.current.target.clone(),
        })
        if (history.current.length > 30) history.current.shift()
        redoStack.current = []
    }

    const restoreState = (state) => {
        controlsRef.current.object.position.copy(state.position)
        controlsRef.current.target.copy(state.target)
        controlsRef.current.update()
    }

    controlsApi.zoomIn = () => {
        saveCameraState()
        controlsRef.current.dollyIn(1.2)
        controlsRef.current.update()
    }

    controlsApi.zoomOut = () => {
        saveCameraState()
        controlsRef.current.dollyOut(1.2)
        controlsRef.current.update()
    }

    controlsApi.rotate90 = () => {
        if (!controlsRef.current) return

        saveCameraState()

        const controls = controlsRef.current
        const currentAngle = controls.getAzimuthalAngle()

        controls.setAzimuthalAngle(currentAngle + Math.PI / 2)
        controls.update()
    }

    controlsApi.undo = () => {
        const last = history.current.pop()
        if (!last) return
        redoStack.current.push({
            position: controlsRef.current.object.position.clone(),
            target: controlsRef.current.target.clone(),
        })
        restoreState(last)
    }

    controlsApi.redo = () => {
        const next = redoStack.current.pop()
        if (!next) return
        saveCameraState()
        restoreState(next)
    }

    return (
        <div className="w-full aspect-[18/9] sm:aspect-[15/9] lg:aspect-[15/9]">
            <Canvas camera={{ position: [0, 1.5, 6], fov: 35 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1} />

                <Suspense fallback={null}>
                    <UniformModel />
                    <Environment preset="studio" />
                </Suspense>

                <OrbitControls
                    ref={controlsRef}
                    enableZoom
                    enablePan
                    autoRotate={snap.autoRotate}
                />
            </Canvas>
        </div>
    )
}