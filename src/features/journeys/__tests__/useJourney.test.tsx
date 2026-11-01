import { renderHook } from '@testing-library/react-native';

import { useJourney } from '../hooks/useJourney';

test('returns the journey for a known id', async () => {
  const { result } = await renderHook(() => useJourney('nozomi-32'));
  expect(result.current?.trainName).toBe('Nozomi 32');
});

test('returns undefined for an unknown id', async () => {
  const { result } = await renderHook(() => useJourney('nope'));
  expect(result.current).toBeUndefined();
});

test('returns undefined when id is undefined', async () => {
  const { result } = await renderHook(() => useJourney(undefined));
  expect(result.current).toBeUndefined();
});
