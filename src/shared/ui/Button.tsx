import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, layout, radius, typography } from '../theme';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
};

export function Button({ label, onPress, icon }: ButtonProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={styles.button}
    >
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: layout.actionHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.buttonDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { ...typography.button, color: colors.onButtonDark },
});
