import { getJourney } from '../api/fake';

test('returns Nozomi 32 for nozomi-32', () => {
  const journey = getJourney('nozomi-32');
  expect(journey).toMatchObject({
    trainName: 'Nozomi 32',
    seat: '7-E',
    from: { time: '09:00', platform: '14' },
    to: { time: '11:12', platform: '12' },
  });
});

test('returns undefined for an unknown id', () => {
  expect(getJourney('nope')).toBeUndefined();
});

test('has a tripId for the seat picker route', () => {
  expect(getJourney('nozomi-32')?.tripId).toBe('trip-nozomi-32');
});
