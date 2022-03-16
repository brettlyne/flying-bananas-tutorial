import * as Three from 'three'
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';

const Banana = ({ z }) => {
  const ref = useRef();
  const { nodes, materials } = useGLTF('/banana-transformed.glb')

  const { viewport, camera } = useThree()
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, z])

  const [data] = useState({
    x: Three.MathUtils.randFloatSpread(2),
    y: Three.MathUtils.randFloatSpread(height),
    rX: Math.random() * Math.PI,
    rY: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
    speed: Three.MathUtils.randFloat(1.4, 1.2)
  })

  useFrame((state) => {
    ref.current.rotation.set((data.rX += .001), (data.rY += .001), (data.rZ += (.001)))
    ref.current.position.set(data.x * width, (data.y += 0.025), z * data.speed)
    if (data.y > height * 1.2) {
      data.y = -height * 1.2
    }
  })

  return (
    <mesh
      ref={ref}
      geometry={nodes.banana.geometry}
      material={materials.skin}
      material-emissive="#ffa500"
    />
  );
};

export default function App({ count = 100, depth = 80 }) {
  return (
    <Canvas gl={{ alpha: false, antialias: false }} dpr={[1, 1.5]} camera={{ near: 0.01, far: depth + 15, fov: 20 }}>
      <color attach="background" args={['#ffbf40']} />
      {/* <spotLight position={[10, 10, 10]} intensity={1} /> */}
      <spotLight position={[10, 20, 10]} penumbra={1} intensity={3} color="orange" />
      <Suspense fallback={null}>
        <Environment preset='sunset' />
        {Array.from({ length: count }, (_, i) => (
          <Banana key={i} z={-(i / count) * depth - 10} />
        ))}
        <EffectComposer multisampling={0}>
          <DepthOfField target={[0, 0, 60]} focalLength={0.5} bokehScale={11} height={700} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}



