import { formatDuration } from '../format';

test('formats 09:00 to 11:12 as 2h 12m', () => {
  expect(formatDuration('09:00', '11:12')).toBe('2h 12m');
});

test('drops zero minutes', () => {
  expect(formatDuration('09:00', '11:00')).toBe('2h');
});

test('shows minutes only under an hour', () => {
  expect(formatDuration('09:00', '09:45')).toBe('45m');
});

test('wraps past midnight', () => {
  expect(formatDuration('23:30', '01:10')).toBe('1h 40m');
});
