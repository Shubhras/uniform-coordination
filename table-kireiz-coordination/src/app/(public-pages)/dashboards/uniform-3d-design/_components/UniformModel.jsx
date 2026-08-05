

'use client'

import { useGLTF } from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { uniformState } from './uniformStore'
import { useEffect, useMemo } from 'react'

useGLTF.preload('/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb')

/**
 * UniformModel Component
 * 
 * Clones and traverses GLTF scene nodes to apply selected part colors and active part emissive highlights.
 */
export default function UniformModel() {
  const { scene: originalScene } = useGLTF(
    '/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb'
  )

  const scene = useMemo(() => originalScene.clone(true), [originalScene])
  const snap = useSnapshot(uniformState)

  const handleClick = (e) => {
    e.stopPropagation()
    if (!e.object?.isMesh) return

    uniformState.active3dPart = e.object.name
  }

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return

      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material.clone()
      }

      const baseMaterial = child.userData.originalMaterial.clone()

      const savedColor = snap.partColors[child.name]
      if (savedColor) {
        baseMaterial.color.set(savedColor)
      }

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

