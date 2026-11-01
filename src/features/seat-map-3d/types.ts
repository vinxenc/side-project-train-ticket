export type SeatStatus = 'available' | 'booked' | 'held';

export type SeatInfo = {
  code: string; // `${row}-${col}`, for example '7-E'
  row: number;
  col: string;
  pos: [number, number, number]; // 3D position, used by the 3D map (step 10)
  window: boolean;
};

export type SeatLayout = {
  tripId: string;
  car: number;
  layout: SeatInfo[];
  status: Record<string, SeatStatus>;
  version: number;
};

export type SeatMapProps = {
  layout: SeatLayout['layout'];
  status: SeatLayout['status'];
  selectedSeat: string | null;
  pendingSeat: string | null;
  onSeatPress: (code: string) => void;
};
