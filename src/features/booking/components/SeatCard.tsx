import { StyleSheet, Text, View } from 'react-native';

import type { SeatInfo } from '@/features/seat-map-3d';
import { colors, spacing, typography } from '@/shared/theme';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

type SeatCardProps = {
  seat: SeatInfo;
  onContinue: () => void;
};

// Column B is the middle seat of the 3-seat side, so it gets its own label.
function seatLabel(seat: SeatInfo) {
  if (seat.window) return 'Window seat';
  return seat.col === 'B' ? 'Middle seat' : 'Aisle seat';
}

export function SeatCard({ seat, onContinue }: SeatCardProps) {
  return (
    <Card>
      <Text role="heading" style={styles.title}>
        {`Seat ${seat.code}`}
      </Text>
      <Text style={styles.label}>{seatLabel(seat)}</Text>
      <View style={styles.action}>
        <Button label="Continue" onPress={onContinue} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.cardTitle, color: colors.textPrimary },
  label: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: 2,
  },
  action: { marginTop: spacing.lg },
});
