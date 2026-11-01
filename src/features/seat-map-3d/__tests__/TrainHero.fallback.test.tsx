import { render, screen } from '@testing-library/react-native';

import { TrainHero } from '../TrainHero';

// The 3D hero is switched off in production (config.ts); these tests exercise the 3D path.
jest.mock('../config', () => ({ HERO_3D_ENABLED: true }));

jest.mock('../scene/HeroScene', () => ({
  __esModule: true,
  default: () => {
    throw new Error('GL unavailable');
  },
}));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('falls back to the static image when the scene throws', async () => {
  await render(<TrainHero />);
  expect(await screen.findByTestId('hero-static')).toBeOnTheScreen();
  expect(
    screen.getByRole('img', { name: 'Shinkansen in front of Mt. Fuji' }),
  ).toBeOnTheScreen();
});

test('sizes the static fallback to its slot instead of the image size', async () => {
  await render(<TrainHero />);
  expect(await screen.findByTestId('hero-static')).toHaveStyle({
    width: '100%',
    height: '100%',
  });
});
