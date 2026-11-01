import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Group } from 'three';

import { colors } from '@/shared/theme';

/** The parts the peel animation moves; step 10 animates them without React state. */
export type PlaceholderTrainHandle = {
  readonly roof: Group | null;
  readonly left: Group | null;
  readonly right: Group | null;
  readonly nose: Group | null;
};

// One car. Rows run along z and columns along x, like the seat layout.
const LENGTH = 8;
const WIDTH = 2.4;
const HEIGHT = 2.2;
const WALL = 0.08;
const STRIPE = 0.22;

export const PlaceholderTrain = forwardRef<PlaceholderTrainHandle>(
  function PlaceholderTrain(_props, ref) {
    const roof = useRef<Group>(null);
    const left = useRef<Group>(null);
    const right = useRef<Group>(null);
    const nose = useRef<Group>(null);

    useImperativeHandle(ref, () => ({
      get roof() {
        return roof.current;
      },
      get left() {
        return left.current;
      },
      get right() {
        return right.current;
      },
      get nose() {
        return nose.current;
      },
    }));

    return (
      <group>
        <group ref={roof}>
          <mesh name="Shell_Roof" position={[0, HEIGHT / 2, 0]}>
            <boxGeometry args={[WIDTH, WALL, LENGTH]} />
            <meshStandardMaterial color={colors.trainBody} />
          </mesh>
        </group>

        {([-1, 1] as const).map((side) => (
          <group key={side} ref={side === -1 ? left : right}>
            <mesh
              name={side === -1 ? 'Shell_Left' : 'Shell_Right'}
              position={[(side * WIDTH) / 2, 0, 0]}
            >
              <boxGeometry args={[WALL, HEIGHT, LENGTH]} />
              <meshStandardMaterial color={colors.trainBody} />
            </mesh>
            <mesh position={[(side * (WIDTH + WALL)) / 2, 0, 0]}>
              <boxGeometry args={[WALL, STRIPE, LENGTH]} />
              <meshStandardMaterial color={colors.accent} />
            </mesh>
          </group>
        ))}

        <group ref={nose}>
          <mesh
            name="Nose"
            position={[0, 0, LENGTH / 2]}
            scale={[1, HEIGHT / WIDTH, 1.6]}
          >
            <sphereGeometry args={[WIDTH / 2, 24, 16]} />
            <meshStandardMaterial color={colors.trainBody} />
          </mesh>
        </group>

        <mesh name="Interior" position={[0, -HEIGHT / 2 + WALL, 0]}>
          <boxGeometry args={[WIDTH - 2 * WALL, WALL, LENGTH]} />
          <meshStandardMaterial color={colors.trainInterior} />
        </mesh>
        <mesh name="Seat" position={[0.5, -HEIGHT / 2 + 0.4, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshStandardMaterial color={colors.seatFree} />
        </mesh>
      </group>
    );
  },
);
