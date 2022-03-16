/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/skateboard-transformed.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        geometry={nodes.skateboad.geometry}
        material={materials['Material.001']}
        material-emissive={props.shadowColor}
      />
    </group>
  )
}

useGLTF.preload('/skateboard-transformed.glb')
