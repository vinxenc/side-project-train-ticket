import Svg, { G, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// A bullet train seen from the side (Lucide only has front views). Drawn in
// a solid silhouette like the mockup's tab icon, on Lucide's 24 grid.
export function TrainSideIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* mirrored so the nose points right, the direction of travel */}
      <G transform="translate(24 0) scale(-1 1)">
        {/* solid body with a swept nose and a window cut-out */}
        <Path
          d="M1.5 18C1.5 15 5.5 8 12 8h7.2a3.3 3.3 0 0 1 3.3 3.3V18zM12.7 11.2v2.3H19.5v-2.3z"
          fill={color}
          fillRule="evenodd"
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        {/* bogies */}
        <Path
          d="M6 20.5h2.5M15.5 20.5H18"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}
