import { View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { colors } from '@/shared/theme/colors';

// An original flat illustration: a Shinkansen in front of Mt. Fuji, with a
// sakura branch and a torii gate. Drawn in SVG (no image file) on a 402x176 grid
// and cropped to the screen width. Real art can replace it later.
const BLOSSOMS = [
  [12, 22, 5],
  [28, 30, 6],
  [46, 38, 5],
  [62, 48, 4.5],
  [22, 46, 4],
  [40, 18, 4],
  [74, 34, 3.5],
  [8, 52, 3.5],
];
const PETALS = [
  [96, 62],
  [120, 84],
  [88, 96],
  [140, 70],
  [64, 78],
];
const WINDOWS = Array.from({ length: 22 }, (_, i) => 78 + i * 16);

export function HeroIllustration() {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Shinkansen in front of Mt. Fuji"
      className="h-44 bg-heroSky"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 402 176"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* far hills and Mt. Fuji */}
        <Path
          d="M0 118C40 102 90 112 140 108L402 112V150H0Z"
          fill={colors.heroFar}
        />
        <Path
          d="M118 132C158 120 184 86 200 64L214 64C230 86 258 120 304 132Z"
          fill={colors.heroMountain}
        />
        <Path
          d="M192 72L200 64H214L222 72L214 69L208 75L202 69L196 76Z"
          fill={colors.card}
        />
        {/* near hills */}
        <Path
          d="M0 134C50 118 100 130 150 136L0 142ZM250 138C300 124 350 130 402 122V146H250Z"
          fill={colors.heroNear}
        />

        {/* torii gate */}
        <G fill={colors.torii}>
          <Rect x={340} y={112} width={3.5} height={30} />
          <Rect x={362} y={112} width={3.5} height={30} />
          <Path d="M331 111Q353 106 375 111L373 116H333Z" />
          <Rect x={337} y={121} width={32} height={2.5} />
        </G>

        {/* ground, rail and train (nose to the left) */}
        <Rect x={0} y={140} width={402} height={36} fill={colors.heroGround} />
        <Rect x={0} y={155} width={402} height={2.5} fill={colors.heroRail} />
        <Path
          d="M6 149C6 138 30 128 72 128H420V149Z"
          fill={colors.trainBody}
          stroke={colors.heroRail}
          strokeWidth={1}
        />
        <Rect x={34} y={140} width={386} height={3} fill={colors.accent} />
        {WINDOWS.map((x) => (
          <Rect
            key={x}
            x={x}
            y={132}
            width={10}
            height={4}
            rx={1.5}
            fill={colors.accent}
          />
        ))}
        <Path d="M30 136C40 131 52 130 64 130L64 136Z" fill={colors.accent} />
        <Rect x={18} y={149} width={402} height={4} fill={colors.heroRail} />

        {/* sakura branch, top left, with a few falling petals */}
        <Path
          d="M-4 8C26 14 50 30 84 52"
          stroke={colors.branch}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M30 22C34 12 44 8 54 10M50 36C60 30 70 30 80 34"
          stroke={colors.branch}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
        {BLOSSOMS.map(([cx, cy, r]) => (
          <Circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={colors.sakura}
          />
        ))}
        {PETALS.map(([cx, cy]) => (
          <Circle
            key={`p${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={2.2}
            fill={colors.sakura}
            opacity={0.8}
          />
        ))}
      </Svg>
    </View>
  );
}
