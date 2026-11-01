// Icon fonts are not loadable under jest (no asset registry), so treat them as loaded.
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  isLoaded: () => true,
  loadAsync: () => Promise.resolve(),
}));

// There is no GL under jest. The scene is a marker view so tests can tell "scene loaded"
// from the static fallback. Tests that need a throwing scene mock it themselves.
jest.mock('@/features/seat-map-3d/scene/HeroScene', () => {
  const { createElement } = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: () => createElement(View, { testID: 'hero-scene' }),
  };
});
