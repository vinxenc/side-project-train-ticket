import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.card,
    ...shadows.card,
  },
});
