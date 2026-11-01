import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

async function renderPicker() {
  await renderRouter('./src/app', {
    initialUrl: '/booking/trip-nozomi-32/seats',
  });
  return userEvent.setup();
}

const seat = (code: string) =>
  screen.getByRole('button', { name: `Seat ${code}` });

test('shows the title and the helper line', async () => {
  await renderPicker();
  expect(
    screen.getByRole('heading', { name: 'Choose your seat · Car 7' }),
  ).toBeOnTheScreen();
  expect(screen.getByText('Tap a free seat to hold it.')).toBeOnTheScreen();
});

test('tapping a free seat shows busy and then selected', async () => {
  const user = await renderPicker();
  await user.press(seat('7-E'));
  expect(seat('7-E')).toBeBusy();
  expect(
    await screen.findByRole('button', { name: 'Seat 7-E', selected: true }),
  ).toBeOnTheScreen();
  expect(seat('7-E')).not.toBeBusy();
});

test('the forced-reject seat goes back to free with a message', async () => {
  const user = await renderPicker();
  await user.press(seat('5-B'));
  expect(seat('5-B')).toBeBusy();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Seat 5-B is no longer available. Pick another seat.',
  );
  expect(seat('5-B')).not.toBeBusy();
  expect(seat('5-B')).not.toBeSelected();
});

test('a booked seat cannot be pressed', async () => {
  await renderPicker();
  expect(seat('1-A')).toBeDisabled();
});

test('the back button leaves the picker', async () => {
  const user = await renderPicker();
  await user.press(screen.getByRole('button', { name: 'Back' }));
  expect(screen).toHavePathname('/journeys');
});

test('has no tab bar', async () => {
  await renderPicker();
  expect(screen.queryByTestId('main-tab-bar')).not.toBeOnTheScreen();
});

const card = (code: string) =>
  screen.queryByRole('heading', { name: `Seat ${code}` });

test('the card is hidden before any seat is chosen', async () => {
  await renderPicker();
  expect(
    screen.queryByRole('button', { name: 'Continue' }),
  ).not.toBeOnTheScreen();
});

test('the card is hidden while a hold is pending, then shows the seat after it is granted', async () => {
  const user = await renderPicker();
  await user.press(seat('7-E'));
  expect(card('7-E')).not.toBeOnTheScreen();
  expect(
    await screen.findByRole('heading', { name: 'Seat 7-E' }),
  ).toBeOnTheScreen();
  expect(screen.getByText('Window seat')).toBeOnTheScreen();
});

test('the card is not shown after a rejected hold with nothing selected', async () => {
  const user = await renderPicker();
  await user.press(seat('5-B'));
  await screen.findByRole('alert');
  expect(
    screen.queryByRole('button', { name: 'Continue' }),
  ).not.toBeOnTheScreen();
});

test('choosing another seat updates the card', async () => {
  const user = await renderPicker();
  await user.press(seat('7-E'));
  await screen.findByRole('heading', { name: 'Seat 7-E' });
  await user.press(seat('3-C'));
  expect(
    await screen.findByRole('heading', { name: 'Seat 3-C' }),
  ).toBeOnTheScreen();
  expect(screen.getByText('Aisle seat')).toBeOnTheScreen();
  expect(card('7-E')).not.toBeOnTheScreen();
});

test('a rejected hold keeps the previous seat and its card', async () => {
  const user = await renderPicker();
  await user.press(seat('3-C'));
  await screen.findByRole('heading', { name: 'Seat 3-C' });
  await user.press(seat('5-B'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Seat 5-B is no longer available. Pick another seat.',
  );
  expect(card('3-C')).toBeOnTheScreen();
  expect(seat('3-C')).toBeSelected();
});

test('a middle seat shows the Middle seat label', async () => {
  const user = await renderPicker();
  await user.press(seat('7-B'));
  expect(
    await screen.findByRole('heading', { name: 'Seat 7-B' }),
  ).toBeOnTheScreen();
  expect(screen.getByText('Middle seat')).toBeOnTheScreen();
});

test('Continue does nothing yet', async () => {
  const user = await renderPicker();
  await user.press(seat('7-E'));
  await user.press(await screen.findByRole('button', { name: 'Continue' }));
  expect(screen).toHavePathname('/booking/trip-nozomi-32/seats');
});
