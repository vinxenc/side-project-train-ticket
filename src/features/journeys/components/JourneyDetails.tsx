import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/shared/theme';
import { Card } from '@/shared/ui/Card';
import { Divider } from '@/shared/ui/Divider';

import type { Journey } from '../types';

function DetailRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.rowText}>{children}</View>
    </View>
  );
}

export function JourneyDetails({ journey }: { journey: Journey }) {
  return (
    <Card>
      <View style={styles.heading}>
        <Ionicons
          name="document-text-outline"
          size={18}
          color={colors.textPrimary}
        />
        <Text style={styles.headingText}>Journey details</Text>
      </View>
      <View style={styles.dividerGap}>
        <Divider />
      </View>
      <DetailRow
        icon={<Ionicons name="walk" size={18} color={colors.textPrimary} />}
      >
        <Text style={styles.rowTitle}>
          {'Boarding opens in '}
          <Text
            style={styles.highlight}
          >{`${journey.boardingOpensInMin} min`}</Text>
        </Text>
        {/* "front of the train" is a static fake until phase 2 */}
        <Text
          style={styles.rowSubtitle}
        >{`Car ${journey.car} · front of the train`}</Text>
      </DetailRow>
      <View style={styles.dividerGap}>
        <Divider />
      </View>
      <DetailRow
        icon={
          <MaterialCommunityIcons
            name="image-filter-hdr"
            size={18}
            color={colors.textPrimary}
          />
        }
      >
        <Text style={styles.rowTitle}>{journey.seatNote}</Text>
      </DetailRow>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headingText: { ...typography.sectionHeading, color: colors.textPrimary },
  dividerGap: { marginVertical: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rowIconGap,
  },
  iconCircle: {
    width: layout.rowIconCircle,
    height: layout.rowIconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { ...typography.rowTitle, color: colors.textPrimary },
  highlight: { color: colors.success },
  rowSubtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
