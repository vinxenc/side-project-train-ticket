import {
  FORCED_REJECT_SEAT,
  HOLD_DELAY_MS,
  getSeatLayout,
  holdSeat,
} from '../api/fake';
import { SeatUnavailableError } from '../types';

describe('getSeatLayout', () => {
  const { layout, status } = getSeatLayout('trip-test', 7);

  test('layout has car 7, 8 rows by 5 columns, 40 unique codes', () => {
    expect(getSeatLayout('trip-test', 7)).toMatchObject({
      tripId: 'trip-test',
      car: 7,
      version: 1,
    });
    expect(layout).toHaveLength(40);
    expect(new Set(layout.map((seat) => seat.code)).size).toBe(40);
    expect(new Set(layout.map((seat) => seat.row))).toEqual(
      new Set([1, 2, 3, 4, 5, 6, 7, 8]),
    );
    expect(new Set(layout.map((seat) => seat.col))).toEqual(
      new Set(['A', 'B', 'C', 'D', 'E']),
    );
  });

  test('window seats are exactly columns A and E', () => {
    const windows = layout.filter((seat) => seat.window);
    expect(windows).toHaveLength(16);
    expect(windows.every((seat) => seat.col === 'A' || seat.col === 'E')).toBe(
      true,
    );
  });

  test('positions are finite and unique, x increases from A to E, z increases with row', () => {
    const at = (code: string) => layout.find((seat) => seat.code === code)!.pos;
    expect(layout.every((seat) => seat.pos.every(Number.isFinite))).toBe(true);
    expect(new Set(layout.map((seat) => seat.pos.join())).size).toBe(40);
    const xs = ['A', 'B', 'C', 'D', 'E'].map((col) => at(`1-${col}`)[0]);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(new Set(xs).size).toBe(5);
    const zs = [1, 2, 3, 4, 5, 6, 7, 8].map((row) => at(`${row}-A`)[2]);
    expect([...zs].sort((a, b) => a - b)).toEqual(zs);
    expect(new Set(zs).size).toBe(8);
  });

  test('status covers every seat; has booked seats and exactly one held seat; 5-B and 7-E are available', () => {
    expect(Object.keys(status).sort()).toEqual(
      layout.map((seat) => seat.code).sort(),
    );
    const values = Object.values(status);
    expect(values.filter((value) => value === 'booked')).toHaveLength(8);
    expect(values.filter((value) => value === 'held')).toHaveLength(1);
    expect(status['5-B']).toBe('available');
    expect(status['7-E']).toBe('available');
  });
});

describe('holdSeat', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('holdSeat resolves after about 600 ms with a future expiresAt', async () => {
    let hold: { seat: string; expiresAt: string } | undefined;
    holdSeat('trip-test', 7, '7-E').then((result) => {
      hold = result;
    });
    await jest.advanceTimersByTimeAsync(HOLD_DELAY_MS - 1);
    expect(hold).toBeUndefined();
    await jest.advanceTimersByTimeAsync(1);
    expect(hold?.seat).toBe('7-E');
    expect(new Date(hold!.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  test('holdSeat rejects the forced-reject seat 5-B', async () => {
    expect(FORCED_REJECT_SEAT).toBe('5-B');
    const result = holdSeat('trip-test', 7, '5-B');
    const assertion =
      expect(result).rejects.toBeInstanceOf(SeatUnavailableError);
    await jest.advanceTimersByTimeAsync(HOLD_DELAY_MS);
    await assertion;
  });

  test('holdSeat rejects booked and held seats', async () => {
    const booked = holdSeat('trip-test', 7, '1-A');
    const held = holdSeat('trip-test', 7, '2-A');
    const assertions = Promise.all([
      expect(booked).rejects.toBeInstanceOf(SeatUnavailableError),
      expect(held).rejects.toBeInstanceOf(SeatUnavailableError),
    ]);
    await jest.advanceTimersByTimeAsync(HOLD_DELAY_MS);
    await assertions;
  });
});
