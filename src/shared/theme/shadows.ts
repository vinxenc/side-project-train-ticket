import type { ViewStyle } from 'react-native';

import { colors } from './colors';

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  control: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tabBar: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>;
