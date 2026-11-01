import { render, screen, userEvent } from '@testing-library/react-native';

import { JourneyCard } from '../components/JourneyCard';
import type { Journey } from '../types';

const journey: Journey = {
  id: 'test-journey',
  tripId: 'trip-test',
  trainName: 'Nozomi 32',
  line: 'Tokaido Shinkansen',
  model: 'N700S',
  car: 7,
  seat: '7-E',
  seatNote: 'Window seat · Mt. Fuji side',
  from: { city: 'Tokyo', time: '09:00', platform: '14' },
  to: { city: 'Kyoto', time: '11:12', platform: '12' },
  status: 'on-time',
  boardingOpensInMin: 12,
};

test('shows train name, line and model', async () => {
  await render(<JourneyCard journey={journey} onSeatPress={jest.fn()} />);
  expect(screen.getByText('Nozomi 32')).toBeOnTheScreen();
  expect(screen.getByText('Tokaido Shinkansen · N700S')).toBeOnTheScreen();
});

test('shows the seat chip as a button named Seat 7-E', async () => {
  await render(<JourneyCard journey={journey} onSeatPress={jest.fn()} />);
  expect(screen.getByRole('button', { name: 'Seat 7-E' })).toBeOnTheScreen();
  expect(screen.getByText('7-E')).toBeOnTheScreen();
});

test('shows cities and times', async () => {
  await render(<JourneyCard journey={journey} onSeatPress={jest.fn()} />);
  expect(screen.getByText('Tokyo')).toBeOnTheScreen();
  expect(screen.getByText('Kyoto')).toBeOnTheScreen();
  expect(screen.getByText('09:00')).toBeOnTheScreen();
  expect(screen.getByText('11:12')).toBeOnTheScreen();
});

test('shows the derived duration 2h 12m', async () => {
  await render(<JourneyCard journey={journey} onSeatPress={jest.fn()} />);
  expect(screen.getByText('2h 12m')).toBeOnTheScreen();
});

test('shows platforms and on-time status', async () => {
  await render(<JourneyCard journey={journey} onSeatPress={jest.fn()} />);
  expect(screen.getByText('Platform 14 · On time')).toBeOnTheScreen();
  expect(screen.getByText('On time')).toBeOnTheScreen();
  expect(screen.getByText('Platform 12')).toBeOnTheScreen();
});

test('shows Delayed when the status is delayed', async () => {
  await render(
    <JourneyCard
      journey={{ ...journey, status: 'delayed' }}
      onSeatPress={jest.fn()}
    />,
  );
  expect(screen.getByText('Delayed')).toBeOnTheScreen();
  expect(screen.queryByText('On time')).not.toBeOnTheScreen();
});

test('calls onSeatPress when the seat chip is pressed', async () => {
  const onSeatPress = jest.fn();
  const user = userEvent.setup();
  await render(<JourneyCard journey={journey} onSeatPress={onSeatPress} />);
  await user.press(screen.getByRole('button', { name: 'Seat 7-E' }));
  expect(onSeatPress).toHaveBeenCalledTimes(1);
});

test('has Show ticket and Open map buttons', async () => {
  await render(<JourneyCard journey={journey} onSeatPress={jest.fn()} />);
  expect(screen.getByRole('button', { name: 'Show ticket' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Open map' })).toBeOnTheScreen();
});
