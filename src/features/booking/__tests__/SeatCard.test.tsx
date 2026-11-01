import { render, screen, userEvent } from '@testing-library/react-native';

import type { SeatInfo } from '@/features/seat-map-3d';

import { SeatCard } from '../components/SeatCard';

function seat(col: string, row = 7): SeatInfo {
  return {
    code: `${row}-${col}`,
    row,
    col,
    pos: [0, 0, 0],
    window: col === 'A' || col === 'E',
  };
}

test('shows the seat code and Window seat for column E', async () => {
  await render(<SeatCard seat={seat('E')} onContinue={jest.fn()} />);
  expect(screen.getByRole('heading', { name: 'Seat 7-E' })).toBeOnTheScreen();
  expect(screen.getByText('Window seat')).toBeOnTheScreen();
});

test('shows Window seat for column A too', async () => {
  await render(<SeatCard seat={seat('A')} onContinue={jest.fn()} />);
  expect(screen.getByText('Window seat')).toBeOnTheScreen();
});

test('shows Middle seat for column B', async () => {
  await render(<SeatCard seat={seat('B')} onContinue={jest.fn()} />);
  expect(screen.getByText('Middle seat')).toBeOnTheScreen();
});

test('shows Aisle seat for column C', async () => {
  await render(<SeatCard seat={seat('C', 3)} onContinue={jest.fn()} />);
  expect(screen.getByRole('heading', { name: 'Seat 3-C' })).toBeOnTheScreen();
  expect(screen.getByText('Aisle seat')).toBeOnTheScreen();
});

test('shows Aisle seat for column D', async () => {
  await render(<SeatCard seat={seat('D')} onContinue={jest.fn()} />);
  expect(screen.getByText('Aisle seat')).toBeOnTheScreen();
});

test('Continue is a button and calls onContinue', async () => {
  const onContinue = jest.fn();
  const user = userEvent.setup();
  await render(<SeatCard seat={seat('E')} onContinue={onContinue} />);
  await user.press(screen.getByRole('button', { name: 'Continue' }));
  expect(onContinue).toHaveBeenCalledTimes(1);
});
