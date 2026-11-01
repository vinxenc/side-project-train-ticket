import { lazy, Suspense } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { layout } from '@/shared/theme';

import { HERO_3D_ENABLED } from './config';
import { ErrorBoundary } from './ErrorBoundary';
import { useReduceMotion } from './useReduceMotion';

// Deferred module evaluation keeps three out of the barrel's static imports; it only
// runs when Hero3D first renders, so with HERO_3D_ENABLED off it never runs.
// Not `import()`: babel-preset-expo leaves it for Metro, so jest cannot run it.
// If the module throws while loading, Metro reports the error as fatal and returns
// undefined from `require`; turn that into a real error for the boundary.
const HeroScene = lazy(async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const scene = require('./scene/HeroScene') as
    typeof import('./scene/HeroScene') | undefined;
  if (!scene?.default) throw new Error('HeroScene failed to load');
  return scene;
});

// PLACEHOLDER art (flat drawings, plan Q5), not the mockup illustration.
// Decorative: the container below carries the accessible name.
function StaticHero() {
  return (
    <Image
      source={require('../../../assets/images/hero-static.png')}
      resizeMode="cover"
      testID="hero-static"
      style={styles.fill}
    />
  );
}

function Hero3D({ active }: { active: boolean }) {
  const reduceMotion = useReduceMotion();

  return (
    <ErrorBoundary fallback={<StaticHero />}>
      <Suspense fallback={<StaticHero />}>
        <HeroScene active={active} reduceMotion={reduceMotion} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function TrainHero({ active = true }: { active?: boolean }) {
  return (
    <View
      accessible
      role="img"
      aria-label="Shinkansen in front of Mt. Fuji"
      style={styles.container}
    >
      {HERO_3D_ENABLED ? <Hero3D active={active} /> : <StaticHero />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: layout.heroHeight, width: '100%', overflow: 'hidden' },
  // RN's Image applies the asset's intrinsic size, which beats absoluteFill's insets.
  fill: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
});
