/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/live-transformed.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh geometry={nodes.live.geometry} material={materials['Default OBJ']} rotation={[Math.PI / 2, 0, 0]} material-emissive={props.shadowColor} />
    </group>
  )
}

useGLTF.preload('/live-transformed.glb')
