import { colors } from './colors';

// The floating tab bar sits over the content, so scrolling screens pad their
// bottom by TAB_BAR_HEIGHT + TAB_BAR_GAP + the safe-area inset.
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_GAP = 16;

// A style object, not a class: NativeWind cannot read the shadow colour token.
export const cardShadow = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;
