import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { colors } from '@/shared/theme/colors';

interface Props {
  icon: LucideIcon;
  label: string; // accessibility label; there is no visible text
  onPress?: () => void;
  size?: number;
  className?: string;
}

export function IconButton({
  icon: Icon,
  label,
  onPress,
  size = 40,
  className = 'bg-headerButton',
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: size, height: size }}
      className={`items-center justify-center rounded-full ${className}`}
    >
      <Icon size={size * 0.5} color={colors.textPrimary} />
    </Pressable>
  );
}
