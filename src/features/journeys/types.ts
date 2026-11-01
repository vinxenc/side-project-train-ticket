export interface Stop {
  city: string;
  time: string;
  platform: string;
}

export interface Journey {
  id: string;
  tripId: string; // for /booking/[tripId]/seats
  trainName: string;
  line: string; // 'Tokaido Shinkansen'
  model: string; // 'N700S'
  car: number; // 7
  seat: string; // '7-E'
  seatNote: string; // 'Window seat · Mt. Fuji side'
  from: Stop; // Tokyo
  to: Stop; // Kyoto
  status: 'on-time' | 'delayed';
  boardingOpensInMin: number;
}
