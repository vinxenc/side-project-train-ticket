// The whole journeys api, fake for now. To use a real backend, rewrite the body
// of getJourney (same signature); nothing else changes.

export interface Stop {
  city: string;
  time: string; // 'HH:mm', local
  platform: string;
}

export interface Journey {
  id: string;
  tripId: string; // for /booking/[tripId]/seats later
  trainName: string; // 'Nozomi 32'
  line: string; // 'Tokaido Shinkansen'
  model: string; // 'N700S'
  car: number; // 7
  carPosition: string; // 'front of the train'
  seat: string; // '7-E'
  seatNote: string; // 'Window seat · Mt. Fuji side'
  from: Stop;
  to: Stop;
  status: 'on-time' | 'delayed';
  boardingOpensInMin: number;
}

// What every implementation throws, so screens never care which one answered.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const journeys: Record<string, Journey> = {
  'nozomi-32': {
    id: 'nozomi-32',
    tripId: 'trip-nozomi-32',
    trainName: 'Nozomi 32',
    line: 'Tokaido Shinkansen',
    model: 'N700S',
    car: 7,
    carPosition: 'front of the train',
    seat: '7-E',
    seatNote: 'Window seat · Mt. Fuji side',
    from: { city: 'Tokyo', time: '09:00', platform: '14' },
    to: { city: 'Kyoto', time: '11:12', platform: '12' },
    status: 'on-time',
    boardingOpensInMin: 12,
  },
};

/** Rejects with ApiError(404) when the journey does not exist. */
export async function getJourney(id: string): Promise<Journey> {
  await new Promise((resolve) => setTimeout(resolve, 300)); // fake latency
  const journey = journeys[id];
  if (!journey) throw new ApiError(404, `Journey ${id} not found`);
  return journey;
}
