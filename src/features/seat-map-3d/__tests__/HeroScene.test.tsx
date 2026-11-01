import { render } from '@testing-library/react-native';
import { Children, isValidElement } from 'react';

import { colors } from '@/shared/theme';

import HeroScene from '../scene/HeroScene';

// The global setup replaces the scene with null; use the real one against a fake Canvas.
jest.unmock('@/features/seat-map-3d/scene/HeroScene');
jest.mock('@react-three/fiber/native', () => ({
  Canvas: jest.fn(() => null),
  useFrame: jest.fn(),
  useThree: jest.fn(),
}));

// requireMock, not an import: only scene/ and models/ may import R3F (standing check S3).
const { Canvas } = jest.requireMock('@react-three/fiber/native') as {
  Canvas: jest.Mock;
};
const canvasProps = () => Canvas.mock.calls.at(-1)?.[0];

test('renders every frame while the hero is active', async () => {
  await render(<HeroScene active reduceMotion={false} />);
  expect(canvasProps()).toMatchObject({ frameloop: 'always' });
});

test('renders on demand when the hero is not active', async () => {
  await render(<HeroScene active={false} reduceMotion={false} />);
  expect(canvasProps()).toMatchObject({ frameloop: 'demand' });
});

test('renders on demand under Reduce Motion', async () => {
  await render(<HeroScene active reduceMotion />);
  expect(canvasProps()).toMatchObject({ frameloop: 'demand' });
});

test('lets touches through so the page still scrolls', async () => {
  await render(<HeroScene active reduceMotion={false} />);
  expect(canvasProps()).toMatchObject({ pointerEvents: 'none' });
});

test('looks at the car side-on from a fixed camera', async () => {
  await render(<HeroScene active reduceMotion={false} />);
  expect(canvasProps()).toMatchObject({
    camera: { position: [10, 1, 0], fov: 30 },
  });
});

test('has an opaque sky background (a transparent canvas drew nothing on the simulator)', async () => {
  await render(<HeroScene active reduceMotion={false} />);
  const children = Children.toArray(canvasProps()?.children);
  const background = children.find(
    (child) => isValidElement(child) && child.type === 'color',
  );
  expect(background).toMatchObject({
    props: { attach: 'background', args: [colors.heroSky] },
  });
});
