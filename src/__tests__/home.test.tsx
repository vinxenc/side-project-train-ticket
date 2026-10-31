import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';

test('home screen renders', async () => {
  await render(<HomeScreen />);
  expect(screen.getByText('Train Ticket')).toBeOnTheScreen();
});
