// 'use client'

// import { Canvas } from '@react-three/fiber'
// import { OrbitControls, Environment } from '@react-three/drei'
// import { useRef } from 'react'
// import UniformModel from './UniformModel'
// import { useSnapshot } from 'valtio'
// import { uniformState } from './uniformStore'

// export default function UniformCanvas() {
//   const controlsRef = useRef()
//   const snap = useSnapshot(uniformState)

//   return (
//     <Canvas
//       camera={{ position: [0, 1.6, 3], fov: 45 }}
//       style={{ height: 650 }}
//     >
//       <ambientLight intensity={0.6} />
//       <directionalLight position={[5, 5, 5]} intensity={1} />

//       <UniformModel />

//       <OrbitControls
//         ref={controlsRef}
//         enableZoom
//         enablePan
//         autoRotate={snap.autoRotate}
//         autoRotateSpeed={1}
//       />

//       <Environment preset="studio" />
//     </Canvas>
//   )
// }

'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useRef, Suspense } from 'react'
import UniformModel from './UniformModel'
import { useSnapshot } from 'valtio'
import { uniformState } from './uniformStore'

export default function UniformCanvas() {
    const controlsRef = useRef()
    const snap = useSnapshot(uniformState)

    return (
        <Canvas
            camera={{ position: [0, 1.5, 6], fov: 35 }}
            style={{ width: '100%', height: '100%' }}
        >
            {/* LIGHTS */}
            <ambientLight intensity={0.6} />
            {/* <directionalLight position={[5, 5, 5]} intensity={1} /> */}
            <directionalLight position={[5, 5, 5]} intensity={1} />
            {/* 🔴 DEBUG BOX (CONFIRM CANVAS WORKS) */}
            {/* <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="red" />
            </mesh> */}

            {/* MODEL (ASYNC LOAD) */}
            <Suspense fallback={null}>
                <UniformModel />
                <Environment preset="studio" />
            </Suspense>

            {/* CONTROLS */}
            <OrbitControls
                ref={controlsRef}
                enableZoom
                enablePan
                autoRotate={snap.autoRotate}
                autoRotateSpeed={1}
            />

        </Canvas>
    )
}