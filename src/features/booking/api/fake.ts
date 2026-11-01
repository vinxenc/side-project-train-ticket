import type { SeatInfo, SeatLayout, SeatStatus } from '@/features/seat-map-3d';

import { SeatUnavailableError, type SeatHold } from '../types';

export const FORCED_REJECT_SEAT = '5-B';
export const HOLD_DELAY_MS = 600;
export const HOLD_TTL_MS = 5 * 60 * 1000;

const ROWS = 8;
const COLUMNS = ['A', 'B', 'C', 'D', 'E'];
const BOOKED = ['1-A', '1-B', '2-C', '3-D', '3-E', '4-A', '6-C', '8-B'];
const HELD = ['2-A'];

// 3D units: columns A-C, a clear aisle, then D-E; the car is centred on x = 0 and its
// rows run along z. Only the 3D map (step 10) reads these.
const COLUMN_X: Record<string, number> = {
  A: -1.45,
  B: -0.85,
  C: -0.25,
  D: 0.85,
  E: 1.45,
};
const SEAT_Y = 0.4;
const ROW_PITCH = 0.7;

export function getSeatLayout(tripId: string, car: number): SeatLayout {
  const layout: SeatInfo[] = [];
  const status: Record<string, SeatStatus> = {};
  for (let row = 1; row <= ROWS; row += 1) {
    for (const col of COLUMNS) {
      const code = `${row}-${col}`;
      layout.push({
        code,
        row,
        col,
        pos: [COLUMN_X[col], SEAT_Y, (row - (ROWS + 1) / 2) * ROW_PITCH],
        window: col === 'A' || col === 'E',
      });
      status[code] = BOOKED.includes(code)
        ? 'booked'
        : HELD.includes(code)
          ? 'held'
          : 'available';
    }
  }
  return { tripId, car, layout, status, version: 1 };
}

export function holdSeat(
  tripId: string,
  car: number,
  seat: string,
): Promise<SeatHold> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const available =
        seat !== FORCED_REJECT_SEAT &&
        getSeatLayout(tripId, car).status[seat] === 'available';
      if (available) {
        resolve({
          seat,
          expiresAt: new Date(Date.now() + HOLD_TTL_MS).toISOString(),
        });
      } else {
        reject(new SeatUnavailableError(seat));
      }
    }, HOLD_DELAY_MS);
  });
}
