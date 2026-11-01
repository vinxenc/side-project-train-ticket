import { render, screen, userEvent } from '@testing-library/react-native';

import { SegmentedControl } from '../SegmentedControl';

const options = [
  { value: 'overview', label: 'Overview' },
  { value: 'live', label: 'Live' },
  { value: 'tickets', label: 'Tickets' },
];

test('renders every option as a tab and marks the value selected', async () => {
  await render(
    <SegmentedControl
      options={options}
      value="overview"
      onChange={jest.fn()}
    />,
  );
  expect(screen.getAllByRole('tab')).toHaveLength(3);
  expect(screen.getByRole('tab', { name: 'Overview' })).toBeSelected();
  expect(screen.getByRole('tab', { name: 'Live' })).not.toBeSelected();
});

test('calls onChange with the pressed value', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  await render(
    <SegmentedControl options={options} value="overview" onChange={onChange} />,
  );
  await user.press(screen.getByRole('tab', { name: 'Live' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('live');
});

test('does not call onChange when the active tab is pressed', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  await render(
    <SegmentedControl options={options} value="overview" onChange={onChange} />,
  );
  await user.press(screen.getByRole('tab', { name: 'Overview' }));
  expect(onChange).not.toHaveBeenCalled();
});
