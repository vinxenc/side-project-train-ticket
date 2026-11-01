// The global setup mocks the scene; undo that so a static import of it would reach three.
jest.unmock('@/features/seat-map-3d/scene/HeroScene');
jest.mock('three', () => {
  throw new Error('three imported by the barrel');
});
jest.mock('@react-three/fiber/native', () => {
  throw new Error('@react-three/fiber imported by the barrel');
});

test('barrel does not import three at module load', () => {
  const barrel = jest.requireActual('@/features/seat-map-3d');
  expect(barrel).toHaveProperty('TrainHero');
});
