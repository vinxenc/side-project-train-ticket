import { render, screen } from '@testing-library/react-native';

import { getJourney } from '@/api/journeys';
import { formatDuration, JourneyCard } from '@/components/JourneyCard';

test('formatDuration turns two times into hours and minutes', () => {
  expect(formatDuration('09:00', '11:12')).toBe('2h 12m');
  expect(formatDuration('10:05', '10:45')).toBe('0h 40m');
});

test('JourneyCard shows On time, or Delayed for a delayed journey', async () => {
  const journey = await getJourney('nozomi-32');
  await render(<JourneyCard journey={journey} />);
  expect(screen.getByText('On time')).toBeOnTheScreen();

  await render(<JourneyCard journey={{ ...journey, status: 'delayed' }} />);
  expect(screen.getByText('Delayed')).toBeOnTheScreen();
});
