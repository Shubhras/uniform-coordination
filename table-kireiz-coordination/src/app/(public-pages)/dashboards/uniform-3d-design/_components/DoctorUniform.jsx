'use client'

import { useGLTF, Primitive } from '@react-three/drei'
import * as THREE from 'three'

/**
 * DoctorUniform Component
 * 
 * Renders the 3D GLTF doctor uniform model and manages individual mesh part selections and material colors.
 */
export function DoctorUniform({ onClickPart, activePart, color, ...props }) {
  const gltf = useGLTF('/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb')
  const { nodes, materials, scene } = gltf

  const getMaterial = (originalMat, meshName) => {
    if (!originalMat) return new THREE.MeshStandardMaterial({ color: 'gray' })
    if (activePart === meshName.toLowerCase()) {
      const mat = originalMat.clone()
      mat.color.set(color)
      return mat
    }
    return originalMat
  }

  const handlePointerOver = (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }
  const handlePointerOut = () => document.body.style.cursor = 'default'

  return (
    <group {...props} dispose={null}>
      {/* Base 3D Model Scene */}
      <Primitive object={scene.clone()} />

      {/* Interactive Mesh Parts Overlay */}
      {nodes.coat && (
        <mesh geometry={nodes.coat.geometry} material={getMaterial(materials.material || materials.coat, 'coat')}
          onClick={(e) => { e.stopPropagation(); onClickPart('coat') }}
          onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} />
      )}
      {nodes.tie && (
        <mesh geometry={nodes.tie.geometry} material={getMaterial(materials.material || materials.tie, 'tie')}
          onClick={(e) => { e.stopPropagation(); onClickPart('tie') }}
          onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} />
      )}
      {nodes.tie1 && (
        <mesh geometry={nodes.tie1.geometry} material={getMaterial(materials.material || materials.tie1, 'tie1')}
          onClick={(e) => { e.stopPropagation(); onClickPart('tie1') }} />
      )}
      {nodes.Collar && (
        <mesh geometry={nodes.Collar.geometry} material={getMaterial(materials.material || materials.Collar, 'Collar')}
          onClick={(e) => { e.stopPropagation(); onClickPart('Collar') }} />
      )}
    </group>
  )
}

useGLTF.preload('/img/3dmodels/doctor_-_sketchfab_weekly_-_13_mar23.glb')