import { render, screen } from '@testing-library/react-native';

import { TrainHero } from '../TrainHero';

// Real config (HERO_3D_ENABLED is off). A factory that runs means the scene module was
// required, which would create a Canvas and a GL context.
const mockSceneRequired = jest.fn();
jest.mock('../scene/HeroScene', () => {
  mockSceneRequired();
  return { __esModule: true, default: () => null };
});

test('ships the static hero with the 3D flag off', async () => {
  await render(<TrainHero />);
  expect(screen.getByTestId('hero-static')).toBeOnTheScreen();
  expect(
    screen.getByRole('img', { name: 'Shinkansen in front of Mt. Fuji' }),
  ).toBeOnTheScreen();
});

test('never requires the scene module with the 3D flag off', async () => {
  await render(<TrainHero />);
  // Let the lazy loader run if it was going to (it resolves within `render`).
  await screen.findByTestId('hero-static');
  expect(mockSceneRequired).not.toHaveBeenCalled();
});
