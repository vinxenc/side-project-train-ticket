import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '../Button';

test('exposes its label as the accessible name', async () => {
  await render(<Button label="Show ticket" />);
  expect(screen.getByRole('button', { name: 'Show ticket' })).toBeOnTheScreen();
});

test('calls onPress when pressed', async () => {
  const onPress = jest.fn();
  const user = userEvent.setup();
  await render(<Button label="Show ticket" onPress={onPress} />);
  await user.press(screen.getByRole('button', { name: 'Show ticket' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
