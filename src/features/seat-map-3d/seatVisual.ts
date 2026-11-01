import type { SeatStatus } from './types';

export type SeatVisual = 'free' | 'taken' | 'pending' | 'selected';

export function seatVisual(
  code: string,
  status: Record<string, SeatStatus>,
  selectedSeat: string | null,
  pendingSeat: string | null,
): SeatVisual {
  if (code === pendingSeat) return 'pending';
  if (code === selectedSeat) return 'selected';
  const seatStatus = status[code];
  return seatStatus === 'booked' || seatStatus === 'held' ? 'taken' : 'free';
}
