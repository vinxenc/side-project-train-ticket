import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, within } from 'expo-router/testing-library';

const tabBar = () => within(screen.getByTestId('main-tab-bar'));

test('redirects / to the journeys tab', async () => {
  await renderRouter('./src/app', { initialUrl: '/' });
  expect(screen).toHavePathname('/journeys');
});

test('shows the four tab labels with Journeys selected', async () => {
  await renderRouter('./src/app', { initialUrl: '/journeys' });
  const tabs = tabBar().getAllByRole('tab');
  expect(tabs).toHaveLength(4);
  ['Journeys', 'Tickets', 'Explore', 'Profile'].forEach((name, index) => {
    expect(tabs[index]).toHaveAccessibleName(name);
  });
  expect(tabBar().getByRole('tab', { name: 'Journeys' })).toBeSelected();
});

test('opening a journey keeps the tab bar and does not add a tab', async () => {
  const user = userEvent.setup();
  await renderRouter('./src/app', { initialUrl: '/journeys' });
  await user.press(screen.getByText('Open journey'));
  expect(screen).toHavePathname('/journeys/nozomi-32');
  expect(await screen.findByText('Nozomi 32')).toBeOnTheScreen();
  expect(tabBar().getAllByRole('tab')).toHaveLength(4);
});

test('pressing a tab switches route', async () => {
  const user = userEvent.setup();
  await renderRouter('./src/app', { initialUrl: '/journeys' });
  await user.press(tabBar().getByRole('tab', { name: 'Tickets' }));
  expect(screen).toHavePathname('/tickets');
  expect(tabBar().getByRole('tab', { name: 'Tickets' })).toBeSelected();
});

test('known journey id shows the train name', async () => {
  await renderRouter('./src/app', { initialUrl: '/journeys/nozomi-32' });
  expect(await screen.findByText('Nozomi 32')).toBeOnTheScreen();
});
