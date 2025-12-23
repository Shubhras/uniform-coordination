

'use client'

import { useGLTF } from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { uniformState } from './uniformStore'
import * as THREE from 'three'
import { useEffect } from 'react'
/* 🔹 PRELOAD – YAHAN ADD KARO */
useGLTF.preload('/img/3dmodels/doctor_uniform.glb')
export default function UniformModel() {
   const gltf = useGLTF('/img/3dmodels/doctor_uniform.glb')
    //const gltf = useGLTF('/img/3dmodels/Book_Closure.glb')  
  // TEST MODEL (USE THIS IF LOCAL FAILS)
  //const gltf = useGLTF('https://modelviewer.dev/shared-assets/models/Astronaut.glb')

  const scene = gltf.scene
  const snap = useSnapshot(uniformState)
   // 🎯 TARGET MESH NAME
  // const targetPart = 'FABRIC 2_FRONT_24961';
  
  // useEffect(() => {
  //   if (!scene) return

  //   console.log('GLB LOADED:', scene)
 
  //   scene.traverse((child) => {
  //     console.log(child.name);
  //     if (child.isMesh && child.material) {
  //       child.material = child.material.clone()
  //       child.material.color = new THREE.Color(snap.color)
  //       child.material.needsUpdate =      true
  //     }
  //   })
  // }, [snap.color, scene])



  useEffect(() => {
  if (!scene) return;
  //console.log('GLB LOADED:', scene)
  // const leggingsMesh = scene.getObjectByName('leggings'); // exact name
  //const leggingsMesh = scene.getObjectByName('hair_Shape'); // exact name
  const leggingsMesh = scene.getObjectByName(snap.active3dPart); // exact name
  if (leggingsMesh && leggingsMesh.material) {
    leggingsMesh.material = leggingsMesh.material.clone(); // clone to avoid shared material
    leggingsMesh.material.color.set(snap.color); // apply your color
    leggingsMesh.material.needsUpdate = true;
  }
}, [snap.color,snap.active3dPart, scene]);

  if (!scene) return null

  // return <primitive object={scene} scale={0.1} position={[0, -10, 0]} />
  return <primitive object={scene} scale={0.019} position={[0, -1.5, 0]} />
}