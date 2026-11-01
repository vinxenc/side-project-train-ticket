import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, shadows } from '../theme';

type IconButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
  size?: number;
  tone?: 'header' | 'chip';
};

export function IconButton({
  icon,
  label,
  onPress,
  size = 44,
  tone = 'header',
}: IconButtonProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        tone === 'header' ? styles.header : styles.chip,
      ]}
    >
      <Ionicons
        name={icon}
        size={Math.round(size * 0.5)}
        color={colors.textPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.headerButton, ...shadows.control },
  chip: { backgroundColor: colors.chip },
});
