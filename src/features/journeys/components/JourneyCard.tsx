import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '@/shared/lib/format';
import { colors, layout, radius, spacing, typography } from '@/shared/theme';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Divider } from '@/shared/ui/Divider';
import { IconButton } from '@/shared/ui/IconButton';

import type { Journey } from '../types';

type JourneyCardProps = {
  journey: Journey;
  onSeatPress: () => void;
};

const DOTS_PER_LINE = 7;

function DottedLine() {
  return (
    <View style={styles.dotted}>
      {Array.from({ length: DOTS_PER_LINE }, (_, index) => (
        <View key={index} style={styles.dottedDot} />
      ))}
    </View>
  );
}

export function JourneyCard({ journey, onSeatPress }: JourneyCardProps) {
  const { from, to, status } = journey;
  const onTime = status === 'on-time';

  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{journey.trainName}</Text>
          <Text style={styles.subtitle}>
            {`${journey.line} · ${journey.model}`}
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label={`Seat ${journey.seat}`}
          onPress={onSeatPress}
          style={styles.seatChip}
        >
          <MaterialCommunityIcons
            name="seat-passenger"
            size={16}
            color={colors.textPrimary}
          />
          <Text style={styles.seatChipText}>{journey.seat}</Text>
        </Pressable>
      </View>

      <View style={styles.dividerGap}>
        <Divider />
      </View>

      <View style={styles.times}>
        <View>
          <Text style={styles.city}>{from.city}</Text>
          <Text style={styles.time}>{from.time}</Text>
        </View>
        <View style={styles.route}>
          <Text style={styles.caption}>
            {formatDuration(from.time, to.time)}
          </Text>
          <View style={styles.routeLine}>
            <View style={styles.dotHollow} />
            <DottedLine />
            <Ionicons name="train" size={14} color={colors.textPrimary} />
            <DottedLine />
            <View style={styles.dotFilled} />
          </View>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.city}>{to.city}</Text>
          <Text style={styles.time}>{to.time}</Text>
        </View>
      </View>

      <View style={styles.platforms}>
        <Text style={styles.caption}>
          {`Platform ${from.platform} · `}
          <Text style={{ color: onTime ? colors.success : colors.warning }}>
            {onTime ? 'On time' : 'Delayed'}
          </Text>
        </Text>
        <Text style={styles.caption}>{`Platform ${to.platform}`}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.primaryAction}>
          {/* no-op until Q7 */}
          <Button
            label="Show ticket"
            icon={
              <Ionicons
                name="qr-code-outline"
                size={20}
                color={colors.onButtonDark}
              />
            }
          />
        </View>
        {/* no-op until Q7 */}
        <IconButton
          icon="map-outline"
          label="Open map"
          size={layout.actionHeight}
          tone="chip"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seatChip: {
    width: layout.seatChipWidth,
    height: layout.seatChipHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  seatChipText: { ...typography.chip, color: colors.textPrimary },
  dividerGap: { marginVertical: spacing.lg },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  city: { ...typography.city, color: colors.textSecondary },
  time: { ...typography.time, color: colors.textPrimary },
  rightColumn: { alignItems: 'flex-end' },
  route: {
    width: layout.routeWidth,
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dotted: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dottedDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textSecondary,
  },
  dotHollow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
  },
  dotFilled: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  caption: { ...typography.caption, color: colors.textSecondary },
  platforms: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.buttonGap,
    marginTop: spacing.lg,
  },
  primaryAction: { flex: 1 },
});
