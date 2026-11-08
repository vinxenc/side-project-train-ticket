import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Solid versions of the Explore and Profile tab icons, as in the mockup.
// Details (fold lines, the person) are drawn in white on top of the fill, so
// they read the same on the white bar and on the grey active pill.

/** A folded map: Lucide's `map` outline, filled, with its two folds in white. */
export function MapFilledIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"
        fill={color}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M15 5.764v15M9 3.236v15"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** A solid circle with a white head and shoulders. */
export function UserFilledIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Circle cx={12} cy={9.5} r={3.2} fill="#fff" />
      <Path
        d="M5.9 18.3c.9-2.6 3.3-4 6.1-4s5.2 1.4 6.1 4a8.6 8.6 0 0 1-12.2 0z"
        fill="#fff"
      />
    </Svg>
  );
}
