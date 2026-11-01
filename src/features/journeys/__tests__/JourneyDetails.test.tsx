import { render, screen } from '@testing-library/react-native';

import { JourneyDetails } from '../components/JourneyDetails';
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

test('shows the section heading', async () => {
  await render(<JourneyDetails journey={journey} />);
  expect(screen.getByText('Journey details')).toBeOnTheScreen();
});

test('shows boarding minutes', async () => {
  await render(<JourneyDetails journey={journey} />);
  expect(screen.getByText('Boarding opens in 12 min')).toBeOnTheScreen();
  expect(screen.getByText('12 min')).toBeOnTheScreen();
});

test('shows the car row', async () => {
  await render(<JourneyDetails journey={journey} />);
  expect(screen.getByText('Car 7 · front of the train')).toBeOnTheScreen();
});

test('shows the seat note', async () => {
  await render(<JourneyDetails journey={journey} />);
  expect(screen.getByText('Window seat · Mt. Fuji side')).toBeOnTheScreen();
});
