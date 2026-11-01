import { render, screen } from '@testing-library/react-native';

import { TrainHero } from '../TrainHero';

// The 3D hero is switched off in production (config.ts); these tests exercise the 3D path.
jest.mock('../config', () => ({ HERO_3D_ENABLED: true }));

// Metro reports a module that throws while loading and returns undefined from require.
jest.mock('../scene/HeroScene', () => undefined);

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('falls back to the static image when require returns undefined', async () => {
  await render(<TrainHero />);
  expect(await screen.findByTestId('hero-static')).toBeOnTheScreen();
  expect(screen.queryByTestId('hero-scene')).not.toBeOnTheScreen();
});

test('turns an undefined require into a real error for the boundary', async () => {
  await render(<TrainHero />);
  await screen.findByTestId('hero-static');
  const logged = jest
    .mocked(console.error)
    .mock.calls.flat()
    .map((arg) => String(arg));
  expect(logged.some((line) => line.includes('HeroScene failed to load'))).toBe(
    true,
  );
});
