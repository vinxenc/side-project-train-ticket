import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, within } from 'expo-router/testing-library';

import { TrainHero } from '@/features/seat-map-3d';

jest.mock('@/features/seat-map-3d', () => ({
  ...jest.requireActual('@/features/seat-map-3d'),
  TrainHero: jest.fn(() => null),
}));

const trainHero = jest.mocked(TrainHero);
const lastActive = () => trainHero.mock.calls.at(-1)?.[0].active;

test('hero is active on Overview and paused on Live', async () => {
  const user = userEvent.setup();
  await renderRouter('./src/app', { initialUrl: '/journeys/nozomi-32' });
  const segments = within(screen.getByTestId('journey-segments'));

  expect(lastActive()).toBe(true);
  await user.press(segments.getByRole('tab', { name: 'Live' }));
  expect(lastActive()).toBe(false);
  await user.press(segments.getByRole('tab', { name: 'Overview' }));
  expect(lastActive()).toBe(true);
});

test('hero is paused once the screen loses focus', async () => {
  const user = userEvent.setup();
  await renderRouter('./src/app', { initialUrl: '/journeys/nozomi-32' });
  expect(lastActive()).toBe(true);

  await user.press(
    within(screen.getByTestId('main-tab-bar')).getByRole('tab', {
      name: 'Tickets',
    }),
  );
  expect(screen).toHavePathname('/tickets');
  expect(lastActive()).toBe(false);
});
