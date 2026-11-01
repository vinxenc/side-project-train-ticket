import { seatVisual } from '../seatVisual';
import type { SeatStatus } from '../types';

const status: Record<string, SeatStatus> = {
  '1-A': 'available',
  '1-B': 'booked',
  '1-C': 'held',
};

test('maps an available seat to free', () => {
  expect(seatVisual('1-A', status, null, null)).toBe('free');
});

test('maps booked and held seats to taken', () => {
  expect(seatVisual('1-B', status, null, null)).toBe('taken');
  expect(seatVisual('1-C', status, null, null)).toBe('taken');
});

test('the selected seat is selected', () => {
  expect(seatVisual('1-A', status, '1-A', null)).toBe('selected');
});

test('the pending seat is pending', () => {
  expect(seatVisual('1-A', status, null, '1-A')).toBe('pending');
});

test('pending wins over selected for the same seat', () => {
  expect(seatVisual('1-A', status, '1-A', '1-A')).toBe('pending');
});

test('another seat staying selected does not affect a free seat', () => {
  expect(seatVisual('1-A', status, '1-B', '1-C')).toBe('free');
});
