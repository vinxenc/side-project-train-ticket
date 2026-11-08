import { render, screen } from '@testing-library/react-native';

import { MapFilledIcon, UserFilledIcon } from '@/components/FilledIcons';
import { TrainSideIcon } from '@/components/TrainSideIcon';

test.each([
  ['TrainSideIcon', TrainSideIcon],
  ['MapFilledIcon', MapFilledIcon],
  ['UserFilledIcon', UserFilledIcon],
])('%s renders with and without props', async (_name, Icon) => {
  await render(<Icon />);
  expect(screen.toJSON()).not.toBeNull();
  await render(<Icon size={40} color="#123456" />);
  expect(screen.toJSON()).not.toBeNull();
});
