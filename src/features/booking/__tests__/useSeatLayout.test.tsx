import { renderHook } from '@testing-library/react-native';

import { useSeatLayout } from '../hooks/useSeatLayout';

test('keeps the same layout object across re-renders', async () => {
  const { result, rerender } = await renderHook(() =>
    useSeatLayout('trip-test', 7),
  );
  const first = result.current;
  await rerender(undefined);
  expect(result.current).toBe(first);
});

test('returns the 40-seat layout for the trip and car', async () => {
  const { result } = await renderHook(() => useSeatLayout('trip-test', 7));
  expect(result.current).toMatchObject({ tripId: 'trip-test', car: 7 });
  expect(result.current.layout).toHaveLength(40);
});
