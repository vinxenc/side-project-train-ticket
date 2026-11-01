import { useRef, useState } from 'react';

import { holdSeat } from '../api/fake';

export function useSeatHold(tripId: string, car: number) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [pendingSeat, setPendingSeat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Latest request wins: a result from an older request is dropped. (A result after
  // unmount needs no code: React 19 ignores state updates on unmounted components.)
  const latestRequest = useRef(0);

  function requestSeat(code: string) {
    latestRequest.current += 1;
    const request = latestRequest.current;
    setError(null);
    setPendingSeat(code);
    holdSeat(tripId, car, code).then(
      () => {
        if (request !== latestRequest.current) return;
        setSelectedSeat(code);
        setPendingSeat(null);
      },
      () => {
        if (request !== latestRequest.current) return;
        // A rejected hold keeps the previous selection.
        setPendingSeat(null);
        setError(`Seat ${code} is no longer available. Pick another seat.`);
      },
    );
  }

  return { selectedSeat, pendingSeat, error, requestSeat };
}
