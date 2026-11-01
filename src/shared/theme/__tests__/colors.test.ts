import { colors } from '../colors';

// iOS cannot compute the shadow of a translucent view and logs an ADVICE warning,
// so the tab bar (which has a shadow) needs a solid #RRGGBB fill, not rgba().
test('the tab bar fill is opaque', () => {
  expect(colors.tabBar).toMatch(/^#[0-9A-Fa-f]{6}$/);
});
