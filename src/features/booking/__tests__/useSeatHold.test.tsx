import { act, renderHook } from '@testing-library/react-native';

import { HOLD_DELAY_MS } from '../api/fake';
import { useSeatHold } from '../hooks/useSeatHold';

const message = (seat: string) =>
  `Seat ${seat} is no longer available. Pick another seat.`;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

async function setup() {
  const { result, unmount } = await renderHook(() =>
    useSeatHold('trip-test', 7),
  );
  const request = (code: string) =>
    act(async () => {
      result.current.requestSeat(code);
    });
  const advance = (ms: number) => act(() => jest.advanceTimersByTimeAsync(ms));
  return { result, unmount, request, advance };
}

test('starts with nothing selected, pending or erroring', async () => {
  const { result } = await setup();
  expect(result.current).toMatchObject({
    selectedSeat: null,
    pendingSeat: null,
    error: null,
  });
});

test('requestSeat sets pending and then selected once the hold resolves', async () => {
  const { result, request, advance } = await setup();
  await request('7-E');
  expect(result.current.pendingSeat).toBe('7-E');
  expect(result.current.selectedSeat).toBeNull();
  await advance(HOLD_DELAY_MS);
  expect(result.current.pendingSeat).toBeNull();
  expect(result.current.selectedSeat).toBe('7-E');
});

test('a rejected seat clears pending, keeps the selection and sets the error message', async () => {
  const { result, request, advance } = await setup();
  await request('5-B');
  expect(result.current.pendingSeat).toBe('5-B');
  await advance(HOLD_DELAY_MS);
  expect(result.current).toMatchObject({
    pendingSeat: null,
    selectedSeat: null,
    error: message('5-B'),
  });
});

test('choosing another seat replaces the previous hold', async () => {
  const { result, request, advance } = await setup();
  await request('7-E');
  await advance(HOLD_DELAY_MS);
  expect(result.current.selectedSeat).toBe('7-E');
  await request('3-C');
  await advance(HOLD_DELAY_MS);
  expect(result.current.selectedSeat).toBe('3-C');
});

test('race: 3-A then 3-B before 3-A resolves leaves only 3-B selected', async () => {
  const { result, request, advance } = await setup();
  await request('3-A');
  await advance(200);
  await request('3-B');
  // 3-A's hold lands now, but it is stale: 3-B is still the pending one.
  await advance(HOLD_DELAY_MS - 200);
  expect(result.current.selectedSeat).toBeNull();
  expect(result.current.pendingSeat).toBe('3-B');
  await advance(200);
  expect(result.current.selectedSeat).toBe('3-B');
  expect(result.current.pendingSeat).toBeNull();
});

test('race: a stale rejection is ignored while a newer request is pending', async () => {
  const { result, request, advance } = await setup();
  await request('5-B');
  await advance(200);
  await request('7-E');
  // 5-B's rejection lands now, but 7-E is the latest request: no error, still pending.
  await advance(HOLD_DELAY_MS - 200);
  expect(result.current.error).toBeNull();
  expect(result.current.pendingSeat).toBe('7-E');
  await advance(200);
  expect(result.current.selectedSeat).toBe('7-E');
  expect(result.current.error).toBeNull();
});

test('a rejected second request keeps the first selection', async () => {
  const { result, request, advance } = await setup();
  await request('3-C');
  await advance(HOLD_DELAY_MS);
  await request('5-B');
  await advance(HOLD_DELAY_MS);
  expect(result.current).toMatchObject({
    selectedSeat: '3-C',
    pendingSeat: null,
    error: message('5-B'),
  });
});

test('a new request clears the previous error', async () => {
  const { result, request, advance } = await setup();
  await request('5-B');
  await advance(HOLD_DELAY_MS);
  expect(result.current.error).toBe(message('5-B'));
  await request('7-E');
  expect(result.current.error).toBeNull();
});

// React 19 drops state updates on unmounted components, so this is a smoke test.
test('ignores a hold result after unmount', async () => {
  const { request, advance, unmount } = await setup();
  await request('7-E');
  await unmount();
  await expect(advance(HOLD_DELAY_MS)).resolves.not.toThrow();
});
