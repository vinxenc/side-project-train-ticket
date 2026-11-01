import { Canvas, useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import type { Group } from 'three';

import { colors } from '@/shared/theme';

import { PlaceholderTrain } from '../models/PlaceholderTrain';

type HeroSceneProps = {
  active: boolean;
  reduceMotion: boolean;
};

const SWAY_AMPLITUDE = (12 * Math.PI) / 180; // about +-12 degrees
const SWAY_SPEED = 1.05; // rad/s, a period of about 6 s

// Fixed object: R3F compares the camera prop by reference.
const CAMERA: { position: [number, number, number]; fov: number } = {
  position: [10, 1, 0],
  fov: 30,
};

function Sway() {
  const group = useRef<Group>(null);
  // Own clock: R3F resets its clock when the frame loop pauses and resumes,
  // so deriving the angle from it would snap the train back to side-on.
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (group.current) {
      group.current.rotation.y =
        Math.sin(time.current * SWAY_SPEED) * SWAY_AMPLITUDE;
    }
  });

  return (
    <group ref={group}>
      <PlaceholderTrain />
    </group>
  );
}

// Unverified: neither a transparent canvas nor this opaque `scene.background` drew
// anything on the iOS 26.5 simulator; only the Round 3 diagnostic build ever drew (it
// also had a raw GLView, an explicit setClearColor and a gl.getError() sync). The next
// attempt re-adds those pieces one at a time; see the Round 3 logs in
// docs/journey-detail-checklist.md.
// Not capped with `dpr`: R3F native fixes it at the screen scale, because expo-gl
// can only render at native resolution.
export default function HeroScene({ active, reduceMotion }: HeroSceneProps) {
  return (
    <Canvas
      style={StyleSheet.absoluteFill}
      // The native Canvas overlay claims every gesture; without this the hero blocks page scrolling.
      pointerEvents="none"
      frameloop={active && !reduceMotion ? 'always' : 'demand'}
      camera={CAMERA}
    >
      <color attach="background" args={[colors.heroSky]} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[6, 8, 4]} intensity={2.2} />
      <Sway />
    </Canvas>
  );
}
