import type { Journey } from '../types';

const journeys: Journey[] = [
  {
    id: 'nozomi-32',
    tripId: 'trip-nozomi-32',
    trainName: 'Nozomi 32',
    line: 'Tokaido Shinkansen',
    model: 'N700S',
    car: 7,
    seat: '7-E',
    seatNote: 'Window seat · Mt. Fuji side',
    from: { city: 'Tokyo', time: '09:00', platform: '14' },
    to: { city: 'Kyoto', time: '11:12', platform: '12' },
    status: 'on-time',
    boardingOpensInMin: 12,
  },
];

export function getJourney(id: string): Journey | undefined {
  return journeys.find((journey) => journey.id === id);
}
