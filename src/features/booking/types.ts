export type SeatHold = { seat: string; expiresAt: string };

export class SeatUnavailableError extends Error {
  seat: string;

  constructor(seat: string) {
    super(`Seat ${seat} is unavailable`);
    this.name = 'SeatUnavailableError';
    this.seat = seat;
  }
}
