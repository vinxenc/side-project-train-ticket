import {
  render,
  screen,
  userEvent,
  within,
} from '@testing-library/react-native';

import { SeatGrid2D } from '../fallback-2d/SeatGrid2D';
import type { SeatInfo, SeatMapProps, SeatStatus } from '../types';

const columns = ['A', 'B', 'C', 'D', 'E'];
const layout: SeatInfo[] = [1, 2].flatMap((row) =>
  columns.map((col) => ({
    code: `${row}-${col}`,
    row,
    col,
    pos: [0, 0, 0] as [number, number, number],
    window: col === 'A' || col === 'E',
  })),
);
const status: Record<string, SeatStatus> = Object.fromEntries(
  layout.map((seat) => [seat.code, 'available' as SeatStatus]),
);
status['1-B'] = 'booked';
status['2-A'] = 'held';

async function renderGrid(overrides: Partial<SeatMapProps> = {}) {
  const onSeatPress = jest.fn();
  await render(
    <SeatGrid2D
      layout={layout}
      status={status}
      selectedSeat={null}
      pendingSeat={null}
      onSeatPress={onSeatPress}
      {...overrides}
    />,
  );
  return onSeatPress;
}

const seat = (code: string) =>
  screen.getByRole('button', { name: `Seat ${code}` });

test('renders one button per seat', async () => {
  await renderGrid();
  expect(screen.getAllByRole('button')).toHaveLength(10);
});

test('shows the column letters and the row numbers', async () => {
  await renderGrid();
  columns.forEach((col) => {
    expect(screen.getByText(col)).toBeOnTheScreen();
  });
  expect(screen.getByText('1')).toBeOnTheScreen();
  expect(screen.getByText('2')).toBeOnTheScreen();
});

test('pressing a free seat calls onSeatPress with its code', async () => {
  const user = userEvent.setup();
  const onSeatPress = await renderGrid();
  await user.press(seat('1-C'));
  expect(onSeatPress).toHaveBeenCalledTimes(1);
  expect(onSeatPress).toHaveBeenCalledWith('1-C');
});

test('booked and held seats are disabled and do not call onSeatPress', async () => {
  const user = userEvent.setup();
  const onSeatPress = await renderGrid();
  expect(seat('1-B')).toBeDisabled();
  expect(seat('2-A')).toBeDisabled();
  expect(seat('1-C')).toBeEnabled();
  await user.press(seat('1-B'));
  await user.press(seat('2-A'));
  expect(onSeatPress).not.toHaveBeenCalled();
});

test('the selected seat is aria-selected', async () => {
  await renderGrid({ selectedSeat: '1-A' });
  expect(seat('1-A')).toBeSelected();
  expect(seat('1-C')).not.toBeSelected();
});

test('the pending seat is busy', async () => {
  await renderGrid({ pendingSeat: '1-C' });
  expect(seat('1-C')).toBeBusy();
  expect(seat('1-A')).not.toBeBusy();
});

test('taken seats show a cross, the selected seat a check', async () => {
  await renderGrid({ selectedSeat: '1-A' });
  expect(screen.getAllByText('✕')).toHaveLength(2);
  expect(within(seat('1-B')).getByText('✕')).toBeOnTheScreen();
  expect(within(seat('1-A')).getByText('✓')).toBeOnTheScreen();
  expect(screen.getAllByText('✓')).toHaveLength(1);
});
