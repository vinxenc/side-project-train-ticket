import { render, screen } from '@testing-library/react-native';

import { TrainHero } from '../TrainHero';

// The 3D hero is switched off in production (config.ts); these tests exercise the 3D path.
jest.mock('../config', () => ({ HERO_3D_ENABLED: true }));

// The scene module throws while it loads (not while it renders).
jest.mock('../scene/HeroScene', () => {
  throw new Error('three failed to evaluate');
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('falls back to the static image when the scene module throws at load', async () => {
  await render(<TrainHero />);
  expect(await screen.findByTestId('hero-static')).toBeOnTheScreen();
  expect(screen.queryByTestId('hero-scene')).not.toBeOnTheScreen();
});
