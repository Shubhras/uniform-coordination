

// 'use client'

// import { useGLTF } from '@react-three/drei'
// import { useSnapshot } from 'valtio'
// import { uniformState } from './uniformStore'
// import * as THREE from 'three'
// import { useEffect } from 'react'
// /* 🔹 PRELOAD – YAHAN ADD KARO */
// useGLTF.preload('/img/3dmodels/doctor_uniform.glb')
// export default function UniformModel() {
//    const gltf = useGLTF('/img/3dmodels/doctor_uniform.glb')
//     //const gltf = useGLTF('/img/3dmodels/Book_Closure.glb')  
//   // TEST MODEL (USE THIS IF LOCAL FAILS)
//   //const gltf = useGLTF('https://modelviewer.dev/shared-assets/models/Astronaut.glb')

//   const scene = gltf.scene
//   const snap = useSnapshot(uniformState)
//    //  TARGET MESH NAME
//   // const targetPart = 'FABRIC 2_FRONT_24961';
  
//   // useEffect(() => {
//   //   if (!scene) return

//   //   console.log('GLB LOADED:', scene)
 
//   //   scene.traverse((child) => {
//   //     console.log(child.name);
//   //     if (child.isMesh && child.material) {
//   //       child.material = child.material.clone()
//   //       child.material.color = new THREE.Color(snap.color)
//   //       child.material.needsUpdate =      true
//   //     }
//   //   })
//   // }, [snap.color, scene])



//   useEffect(() => {
//   if (!scene) return;
//   //console.log('GLB LOADED:', scene)
//   // const leggingsMesh = scene.getObjectByName('leggings'); // exact name
//   //const leggingsMesh = scene.getObjectByName('hair_Shape'); // exact name
//   const leggingsMesh = scene.getObjectByName(snap.active3dPart); // exact name
//   if (leggingsMesh && leggingsMesh.material) {
//     leggingsMesh.material = leggingsMesh.material.clone(); // clone to avoid shared material
//     leggingsMesh.material.color.set(snap.color); // apply your color
//     leggingsMesh.material.needsUpdate = true;
//   }
// }, [snap.color,snap.active3dPart, scene]);

//   if (!scene) return null

//   // return <primitive object={scene} scale={0.1} position={[0, -10, 0]} />
//   return <primitive object={scene} scale={0.015} position={[0, -0.8, 0]} />
// }

// 'use client'

// import { useGLTF } from '@react-three/drei'
// import { useSnapshot } from 'valtio'
// import { uniformState } from './uniformStore'
// import * as THREE from 'three'
// import { useEffect } from 'react'

// useGLTF.preload('/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb')

// export default function UniformModel() {
//   const gltf = useGLTF('/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb')
//   const scene = gltf.scene.clone() // important: clone to avoid shared materials
//   const snap = useSnapshot(uniformState)

//   useEffect(() => {
//     if (!scene) return

//     // Possible part names from your list – try one by one
//     const possibleNames = ['coat', 'tie', 'tie1', 'Collar', 'button003']

//     let targetMesh = null
//     for (const name of possibleNames) {
//       targetMesh = scene.getObjectByName(name)
//       if (targetMesh) break
//     }

//     // Reset all custom parts to original color first (optional)
//     possibleNames.forEach(name => {
//       const mesh = scene.getObjectByName(name)
//       if (mesh && mesh.material && mesh.userData.originalMaterial) {
//         mesh.material = mesh.userData.originalMaterial
//         mesh.material.needsUpdate = true
//       }
//     })

//     // Apply color to active part
//     if (targetMesh && snap.active3dPart && targetMesh.name.toLowerCase() === snap.active3dPart.toLowerCase()) {
//       if (!targetMesh.userData.originalMaterial) {
//         targetMesh.userData.originalMaterial = targetMesh.material.clone()
//       }
//       targetMesh.material = targetMesh.userData.originalMaterial.clone()
//       targetMesh.material.color.set(snap.color)
//       targetMesh.material.needsUpdate = true
//     }
//   }, [snap.color, snap.active3dPart, scene])

//   return <primitive object={scene} scale={0.015} position={[0, -0.8, 0]} />
// }


// 'use client'

// import { useGLTF } from '@react-three/drei'
// import { useSnapshot } from 'valtio'
// import { uniformState } from './uniformStore'
// import { useEffect, useMemo } from 'react'

// useGLTF.preload('/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb')

// export default function UniformModel() {
//   const { scene: originalScene } = useGLTF(
//     '/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb'
//   )

//   // clone once
//   const scene = useMemo(() => originalScene.clone(true), [originalScene])
//   const snap = useSnapshot(uniformState)

//   /* 👉 CLICK HANDLER */
//   const handleClick = (e) => {
//     e.stopPropagation()
//     const mesh = e.object

//     if (!mesh?.material) return

//     uniformState.active3dPart = mesh.name
//     console.log('Active part:', mesh.name)
//   }

//   /* 👉 APPLY COLOR */
//   useEffect(() => {
//     scene.traverse((child) => {
//       if (!child.isMesh) return

//       // store original material
//       if (!child.userData.originalMaterial) {
//         child.userData.originalMaterial = child.material.clone()
//       }

//       // active part
//       if (child.name === snap.active3dPart) {
//         child.material = child.userData.originalMaterial.clone()
//         child.material.color.set(snap.color)
//         child.material.needsUpdate = true
//       } else {
//         // reset others
//         child.material = child.userData.originalMaterial.clone()
//       }
//     })
//   }, [snap.color, snap.active3dPart, scene])

//   return (
//     <primitive
//       object={scene}
//       scale={0.015}
//       position={[0, -0.8, 0]}
//       onPointerDown={handleClick}
//     />
//   )
// }


'use client'

import { useGLTF } from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { uniformState } from './uniformStore'
import { useEffect, useMemo } from 'react'

useGLTF.preload('/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb')

export default function UniformModel() {
  const { scene: originalScene } = useGLTF(
    '/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb'
  )

  const scene = useMemo(() => originalScene.clone(true), [originalScene])
  const snap = useSnapshot(uniformState)

  /*  CLICK HANDLER */
  const handleClick = (e) => {
    e.stopPropagation()
    if (!e.object?.isMesh) return

    uniformState.active3dPart = e.object.name
    console.log('Active part:', e.object.name)
  }

  /*  APPLY COLORS (NO RESET) */
  // useEffect(() => {
  //   scene.traverse((child) => {
  //     if (!child.isMesh) return

  //     // save original material once
  //     if (!child.userData.originalMaterial) {
  //       child.userData.originalMaterial = child.material.clone()
  //     }

  //     const savedColor = snap.partColors[child.name]

  //     if (savedColor) {
  //       child.material = child.userData.originalMaterial.clone()
  //       child.material.color.set(savedColor)
  //       child.material.needsUpdate = true
  //     }
  //   })
  // }, [snap.partColors, scene])

  useEffect(() => {
  scene.traverse((child) => {
    if (!child.isMesh) return

    // save original material once
    if (!child.userData.originalMaterial) {
      child.userData.originalMaterial = child.material.clone()
    }

    const baseMaterial = child.userData.originalMaterial.clone()

    // apply saved color
    const savedColor = snap.partColors[child.name]
    if (savedColor) {
      baseMaterial.color.set(savedColor)
    }

    //  ACTIVE PART HIGHLIGHT
    if (child.name === snap.active3dPart) {
      baseMaterial.emissive.set('#ffffff')
      baseMaterial.emissiveIntensity = 0.35
    } else {
      baseMaterial.emissive.set('#000000')
      baseMaterial.emissiveIntensity = 0
    }

    child.material = baseMaterial
    child.material.needsUpdate = true
  })
}, [snap.partColors, snap.active3dPart, scene])

  return (
    <primitive
      object={scene}
      scale={0.015}
      position={[0, -0.8, 0]}
      onPointerDown={handleClick}
    />
  )
}
