import { render, screen } from '@testing-library/react-native';

import { TrainHero } from '../TrainHero';

// The 3D hero is switched off in production (config.ts); these tests exercise the 3D path.
jest.mock('../config', () => ({ HERO_3D_ENABLED: true }));

test('renders the static hero image with an accessible name', async () => {
  await render(<TrainHero />);
  expect(
    screen.getByRole('img', { name: 'Shinkansen in front of Mt. Fuji' }),
  ).toBeOnTheScreen();
});

test('swaps the static fallback for the scene once it loads', async () => {
  await render(<TrainHero />);
  // jest.setup.ts mocks the scene as a marker view.
  expect(await screen.findByTestId('hero-scene')).toBeOnTheScreen();
  expect(screen.queryByTestId('hero-static')).not.toBeOnTheScreen();
});

test('clips the hero to its slot', async () => {
  await render(<TrainHero />);
  expect(
    screen.getByRole('img', { name: 'Shinkansen in front of Mt. Fuji' }),
  ).toHaveStyle({ overflow: 'hidden' });
});
