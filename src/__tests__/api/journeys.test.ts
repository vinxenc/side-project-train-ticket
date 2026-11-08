import { ApiError, getJourney } from '@/api/journeys';

test('getJourney returns the fake journey', async () => {
  const journey = await getJourney('nozomi-32');
  expect(journey.trainName).toBe('Nozomi 32');
});

test('getJourney rejects an unknown id with a 404 ApiError', async () => {
  const error = await getJourney('nope').catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status: 404 });
});

test.each(['constructor', 'toString', '__proto__'])(
  'getJourney treats the inherited name %s as an unknown id',
  async (id) => {
    const error = await getJourney(id).catch((e: unknown) => e);
    expect(error).toMatchObject({ status: 404 });
  },
);
