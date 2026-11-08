import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { queryClient } from '@/api/queryClient';

// Renders the real src/app routes, so a wrong Tabs.Screen name or a [id] that
// becomes its own tab fails here.
const APP = './src/app';

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  // The real client's default 5-minute cache timer would keep jest open.
  queryClient.clear();
  // Expo Router warns about a Tabs.Screen name that matches no route.
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test('/ redirects to the journeys list inside the tab bar', async () => {
  await renderRouter(APP, { initialUrl: '/' });
  expect(
    await screen.findByText('Nozomi 32 · Tokyo → Kyoto'),
  ).toBeOnTheScreen();
  expect(screen).toHavePathname('/journeys');
});

test('detail route loads the journey and keeps the four tabs', async () => {
  await renderRouter(APP, { initialUrl: '/journeys/nozomi-32' });
  expect(await screen.findByText('Show ticket')).toBeOnTheScreen();
  expect(screen).toHavePathname('/journeys/nozomi-32');
  expect(screen.getByText('2h 12m')).toBeOnTheScreen();
  // The bar's items have no accessibility role under jest, so check the labels.
  // "Tickets" is also a segment name, hence two matches.
  for (const label of ['Journeys', 'Explore', 'Profile']) {
    expect(screen.getByText(label)).toBeOnTheScreen();
  }
  expect(screen.getAllByText('Tickets')).toHaveLength(2);
  // A stray route would show up as an extra tab titled with its route name.
  for (const stray of ['[id]', 'index', 'journeys', 'journeys/[id]']) {
    expect(screen.queryByText(stray)).not.toBeOnTheScreen();
  }
});

test('segments switch the content', async () => {
  await renderRouter(APP, { initialUrl: '/journeys/nozomi-32' });
  await screen.findByText('Nozomi 32');
  await fireEvent.press(screen.getByRole('tab', { name: 'Live' }));
  expect(screen.getByText('Live status is coming soon.')).toBeOnTheScreen();
  expect(screen.queryByText('Nozomi 32')).not.toBeOnTheScreen();
});

test('unknown journey shows an alert', async () => {
  await renderRouter(APP, { initialUrl: '/journeys/nope' });
  expect(await screen.findByRole('alert')).toBeOnTheScreen();
});

test('the Back button returns from the detail page to the list', async () => {
  await renderRouter(APP, { initialUrl: '/journeys' });
  await fireEvent.press(await screen.findByText('Nozomi 32 · Tokyo → Kyoto'));
  await screen.findByText('Show ticket');
  await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(
    await screen.findByText('Nozomi 32 · Tokyo → Kyoto'),
  ).toBeOnTheScreen();
  expect(screen).toHavePathname('/journeys');
});

test('the Tickets segment shows its placeholder', async () => {
  await renderRouter(APP, { initialUrl: '/journeys/nozomi-32' });
  await screen.findByText('Nozomi 32');
  await fireEvent.press(screen.getAllByRole('tab', { name: 'Tickets' })[0]);
  expect(screen.getByText('Tickets is coming soon.')).toBeOnTheScreen();
});

test('tapping the error message retries the request', async () => {
  await renderRouter(APP, { initialUrl: '/journeys/nope' });
  const alert = await screen.findByRole('alert');
  // renderRouter fakes timers, but the retry's fake-api delay must really elapse.
  jest.useRealTimers();
  await fireEvent.press(alert);
  expect(await screen.findByRole('alert')).toBeOnTheScreen();
});

test('the tab bar opens the Tickets, Explore and Profile tabs', async () => {
  await renderRouter(APP, { initialUrl: '/journeys' });
  for (const title of ['Tickets', 'Explore', 'Profile']) {
    await fireEvent.press(screen.getByRole('tab', { name: title }));
    expect(
      await screen.findByText(`${title} is coming soon.`),
    ).toBeOnTheScreen();
    expect(screen).toHavePathname(`/${title.toLowerCase()}`);
  }
});
