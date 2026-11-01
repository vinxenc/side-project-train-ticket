import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useReduceMotion } from '../useReduceMotion';

afterEach(() => {
  jest.restoreAllMocks();
});

test('reads the initial value', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  const { result } = await renderHook(() => useReduceMotion());
  await waitFor(() => expect(result.current).toBe(true));
});

test('reacts to reduceMotionChanged and unsubscribes', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  const remove = jest.fn();
  let onChange: (enabled: boolean) => void = () => {};
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((_event, handler) => {
      onChange = handler as (enabled: boolean) => void;
      return { remove };
    });

  const { result, unmount } = await renderHook(() => useReduceMotion());
  await waitFor(() => expect(result.current).toBe(true));

  await act(() => onChange(false));
  expect(result.current).toBe(false);

  await unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});
