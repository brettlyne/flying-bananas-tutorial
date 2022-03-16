import * as Three from 'three'
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { useControls, folder, button } from 'leva'

import Brain from './models/Brain'
import Skateboard from './models/Skateboard'
import Lipstick from './models/Lipstick'
import Banana from './models/Banana'
import Stopwatch from './models/Stopwatch'
import Live from './models/Live'
import QuestionBlock from './models/QuestionBlock'


const presets = {
  'Lipstick_A': { "model": "Lipstick", "count": 100, "model scale": 1.3, "background": "#0e87c0", "shadows": "#220000", "environment": "city", "rise speed": 0.5, "rotation speed": 10, "spotlight intensity": 3, "spotlight color": "#38b9ff", "edge buffer": 1.5 },
  'Brain_A': {
    "model": "Brain", "count": 100, "model scale": 2.8, "background": "#9c5dc4", "shadows": "#ce2424", "environment": "sunset", "rise speed": 1, "rotation speed": 20, "spotlight intensity": 1, "spotlight color": "#fcce7c", "edge buffer": 1
  },
  'Skateboard_A': {
    "model": "Skateboard", "count": 80, "model scale": 1.8, "background": "#17aaf5", "shadows": "#220000", "environment": "park", "rise speed": 1, "rotation speed": 20, "spotlight intensity": 2, "spotlight color": "#ff8338", "edge buffer": 1.5
  },
  'Skateboard_B': {
    "model": "Skateboard", "count": 90, "model scale": 1.8, "background": "#030407", "shadows": "#270015", "environment": "night", "rise speed": 1, "rotation speed": 20, "spotlight intensity": 0.3, "spotlight color": "#c2e2f8", "edge buffer": 1.5
  },
  'Banana_A': {
    "model": "Banana", "count": 80, "model scale": 1.1, "background": "#ffc536", "shadows": "#be6400", "environment": "sunset", "rise speed": 1, "rotation speed": 20, "spotlight intensity": 2, "spotlight color": "#ffb22b", "edge buffer": 1.5
  },
  'Pocketwatch_A': {
    "model": "Stopwatch", "count": 100, "model scale": 3, "background": "#aeffc5", "shadows": "#052100", "environment": "forest", "rise speed": 1, "rotation speed": 20, "spotlight intensity": 3, "spotlight color": "#bcfff2", "edge buffer": 1.5
  },
  'Live_A': { "model": "Live", "count": 80, "model scale": 0.1, "background": "#030202", "shadows": "#620000", "environment": "sunset", "rise speed": 0.5, "rotation speed": 30, "spotlight intensity": 6, "spotlight color": "#a00000", "edge buffer": 1.5 },
  'QuestionCube_A': { "model": "QuestionBlock", "count": 100, "model scale": 0.5, "background": "#79d5b6", "shadows": "#6c5101", "environment": "sunset", "rise speed": 1, "rotation speed": 30, "spotlight intensity": 2, "spotlight color": "#ff5600", "dof target": 40, "dof focal length": 0.4, "dof amount": 13, "dof height": 500, "edge buffer": 1.5 },
}
const firstPreset = presets[Object.keys(presets)[0]];

const settings = {
  preset: {
    value: 'Live_A',
    options: Object.keys(presets),
    onChange: (preset) => {
      set(presets[preset])
    }
  },
  model: {
    value: firstPreset.model,
    options: [
      'Live', 'Lipstick', 'Brain', 'Skateboard', 'Banana', 'Stopwatch', 'QuestionBlock']
  },
  count: {
    value: firstPreset.count,
    min: 0,
    max: 500,
    step: 10,
  },
  'model scale': {
    value: firstPreset['model scale'],
    min: 0,
    max: 5,
    step: .1,
  },
  background: {
    value: firstPreset.background,
  },
  shadows: firstPreset.shadows,
  environment: {
    value: firstPreset.environment,
    options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby']
  },
  'movement': folder({
    'rise speed': {
      value: firstPreset['rise speed'],
      min: 0,
      max: 10,
      step: .1,
    },
    'rotation speed': {
      value: firstPreset['rotation speed'],
      min: 0,
      max: 100,
      step: 1,
    },
  }, { collapsed: true }),

  'spotlight': folder({
    'spotlight intensity': {
      value: firstPreset['spotlight intensity'],
      min: 0,
      max: 20,
      step: .5,
      label: 'intensity'
    },
    'spotlight color': { value: firstPreset['spotlight color'], label: 'color' },
    'spotlight location': {
      value: { x: 10, y: 20 },
      joystick: false,
      label: 'location'
    }
  }, { collapsed: true }),

  'depth of field': folder({
    'dof target': {
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      label: 'target depth'
    },
    'dof focal length': {
      value: .4,
      min: 0,
      max: 5,
      step: 0.1,
      label: 'focal length'
    },
    'dof amount': {
      value: 11,
      min: 0,
      max: 40,
      step: 1,
      label: 'bokeh amount'
    },
    'dof height': {
      value: 800,
      min: 100,
      max: 2000,
      step: 100,
      label: 'quality'
    },
  }, { collapsed: true }),

  'debug': folder({
    'tip': {
      value: 'scale the buffer area below and above the visible area to eliminate glitching where items pop in or out',
      editable: false
    },
    'edge buffer': {
      value: firstPreset['edge buffer'],
      min: .5,
      max: 3,
      step: .1,
    },
  }, { collapsed: true }),

  'export current settings': button((get, b) => {
    const temp = options;
    delete temp[' ']
    delete temp['share current settings']
    prompt("Copy to clipboard to share: CMD + C", JSON.stringify(temp));
  })
}


const Model = ({ z, options }) => {

  const ref = useRef();
  const { viewport, camera } = useThree()
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, z])

  const [data] = useState({
    x: Three.MathUtils.randFloatSpread(2),
    y: Three.MathUtils.randFloatSpread(2 * height * options['edge buffer']),
    rX: Math.random() * 2 * Math.PI,
    rY: Math.random() * 2 * Math.PI,
    rZ: Math.random() * 2 * Math.PI,
    speed: Three.MathUtils.randFloat(.005, .007)
  })

  useFrame((state) => {
    ref.current.rotation.set(
      (data.rX += .001 * options['rotation speed'] / 20),
      (data.rY += .001 * options['rotation speed'] / 20),
      (data.rZ += .001 * options['rotation speed'] / 20)
    )
    ref.current.position.set(data.x * width, (data.y += data.speed * options['rise speed']), z)
    if (data.y > (height * options['edge buffer'])) {
      data.y = (-height * options['edge buffer'])
    }
  })

  const pickModel = () => {
    switch (options.model) {
      case 'Live':
        return Live;
      case 'Lipstick':
        return Lipstick;
      case 'Brain':
        return Brain;
      case 'Banana':
        return Banana;
      case 'Skateboard':
        return Skateboard;
      case 'Stopwatch':
        return Stopwatch;
      case 'QuestionBlock ':
        return QuestionBlock;
      default:
        return null;
    }
  }
  const SelectedModel = pickModel();

  return (
    <group ref={ref} scale={options['model scale']} >
      <SelectedModel shadowColor={options.shadows} />
    </group>
  );
};

export default function App({ depth = 70 }) {
  const [options, set] = useControls(() => (settings))
  window.options = options;
  window.set = set;

  const { x: spotX, y: spotY } = options[`spotlight location`]

  const { count, environment } = options;

  return (
    <Canvas gl={{ alpha: false, antialias: false }} dpr={[1, 1.5]} camera={{ near: 0.01, far: depth + 35, fov: 20 }} key={environment}>
      <color attach="background" args={[options.background]} />
      <spotLight position={[spotX, spotY, 10]} penumbra={1} intensity={options['spotlight intensity']} color={options['spotlight color']} />
      <Suspense fallback={null}>
        <Environment preset={environment} />
        {Array.from({ length: count }, (_, i) => (
          <Model options={options} key={i} z={-(i / count) * depth - 10} />
        ))}
        <EffectComposer multisampling={0}>
          <DepthOfField target={[0, 0, options['dof target']]} focalLength={options['dof focal length']} bokehScale={options['dof amount']} height={options['dof height']} />
        </EffectComposer>
      </Suspense>
    </Canvas >
  )
}



