import { userEvent } from '@testing-library/react-native';
import {
  renderRouter,
  screen,
  testRouter,
  within,
} from 'expo-router/testing-library';

const segments = () => within(screen.getByTestId('journey-segments'));
const tabBar = () => within(screen.getByTestId('main-tab-bar'));

async function renderDetail() {
  await renderRouter('./src/app', { initialUrl: '/journeys/nozomi-32' });
}

test('shows the header title with back and more buttons', async () => {
  await renderDetail();
  expect(
    screen.getByRole('heading', { name: 'My Journeys' }),
  ).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  expect(
    screen.getByRole('button', { name: 'More options' }),
  ).toBeOnTheScreen();
});

test('shows three segments with Overview selected', async () => {
  await renderDetail();
  expect(segments().getAllByRole('tab')).toHaveLength(3);
  expect(segments().getByRole('tab', { name: 'Overview' })).toBeSelected();
  expect(segments().getByRole('tab', { name: 'Live' })).not.toBeSelected();
  expect(segments().getByRole('tab', { name: 'Tickets' })).not.toBeSelected();
});

test('Overview shows the hero, card and details', async () => {
  await renderDetail();
  expect(
    screen.getByRole('img', { name: 'Shinkansen in front of Mt. Fuji' }),
  ).toBeOnTheScreen();
  expect(screen.getByText('Nozomi 32')).toBeOnTheScreen();
  expect(screen.getByText('Journey details')).toBeOnTheScreen();
});

test('pressing Live shows the placeholder, hides the card and keeps the hero', async () => {
  const user = userEvent.setup();
  await renderDetail();
  await user.press(segments().getByRole('tab', { name: 'Live' }));
  expect(screen.getByText('Live status is coming soon.')).toBeOnTheScreen();
  expect(screen.queryByText('Nozomi 32')).not.toBeOnTheScreen();
  expect(
    screen.getByRole('img', { name: 'Shinkansen in front of Mt. Fuji' }),
  ).toBeOnTheScreen();
});

test('pressing Tickets shows its placeholder', async () => {
  const user = userEvent.setup();
  await renderDetail();
  await user.press(segments().getByRole('tab', { name: 'Tickets' }));
  expect(
    screen.getByText('Tickets for this journey are coming soon.'),
  ).toBeOnTheScreen();
  expect(screen.queryByText('Nozomi 32')).not.toBeOnTheScreen();
});

test('pressing Overview again restores the card', async () => {
  const user = userEvent.setup();
  await renderDetail();
  await user.press(segments().getByRole('tab', { name: 'Live' }));
  await user.press(segments().getByRole('tab', { name: 'Overview' }));
  expect(screen.getByText('Nozomi 32')).toBeOnTheScreen();
  expect(
    screen.queryByText('Live status is coming soon.'),
  ).not.toBeOnTheScreen();
});

test('back returns to the list', async () => {
  const user = userEvent.setup();
  await renderRouter('./src/app', { initialUrl: '/journeys' });
  await user.press(screen.getByText('Open journey'));
  expect(screen).toHavePathname('/journeys/nozomi-32');
  await user.press(screen.getByRole('button', { name: 'Back' }));
  expect(screen).toHavePathname('/journeys');
  // Popped, not replaced: replace('/journeys') would leave a second list under it.
  expect(testRouter.canGoBack()).toBe(false);
});

test('back falls back to the list when opened by deep link', async () => {
  const user = userEvent.setup();
  await renderDetail();
  await user.press(screen.getByRole('button', { name: 'Back' }));
  expect(screen).toHavePathname('/journeys');
});

test('unknown journey id shows a not-found line and keeps the tab bar', async () => {
  await renderRouter('./src/app', { initialUrl: '/journeys/nope' });
  expect(screen.getByText('Journey not found')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  expect(tabBar().getAllByRole('tab')).toHaveLength(4);
});
