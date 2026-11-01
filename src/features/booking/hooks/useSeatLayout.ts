import { useMemo } from 'react';

import type { SeatLayout } from '@/features/seat-map-3d';

import { getSeatLayout } from '../api/fake';

// Memoised so the 40-seat array keeps its identity across renders.
export function useSeatLayout(tripId: string, car: number): SeatLayout {
  return useMemo(() => getSeatLayout(tripId, car), [tripId, car]);
}
