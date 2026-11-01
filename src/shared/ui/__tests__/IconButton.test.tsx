import { render, screen, userEvent } from '@testing-library/react-native';

import { IconButton } from '../IconButton';

test('exposes label as the accessible name and calls onPress', async () => {
  const onPress = jest.fn();
  const user = userEvent.setup();
  await render(
    <IconButton icon="chevron-back" label="Back" onPress={onPress} />,
  );
  const button = screen.getByRole('button', { name: 'Back' });
  expect(button).toBeOnTheScreen();
  await user.press(button);
  expect(onPress).toHaveBeenCalledTimes(1);
});
