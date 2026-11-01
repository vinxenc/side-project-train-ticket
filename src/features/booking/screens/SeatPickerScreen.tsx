import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SeatMap } from '@/features/seat-map-3d';
import { colors, layout, spacing, typography } from '@/shared/theme';
import { IconButton } from '@/shared/ui/IconButton';

import { SeatCard } from '../components/SeatCard';
import { useSeatHold } from '../hooks/useSeatHold';
import { useSeatLayout } from '../hooks/useSeatLayout';

const CAR = 7;

export function SeatPickerScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { layout: seats, status } = useSeatLayout(tripId, CAR);
  const { selectedSeat, pendingSeat, error, requestSeat } = useSeatHold(
    tripId,
    CAR,
  );

  const selectedInfo = seats.find((seat) => seat.code === selectedSeat);

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace('/journeys');

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton icon="chevron-back" label="Back" onPress={goBack} />
        <Text role="heading" numberOfLines={1} style={styles.title}>
          {`Choose your seat · Car ${CAR}`}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <SeatMap
          layout={seats}
          status={status}
          selectedSeat={selectedSeat}
          pendingSeat={pendingSeat}
          onSeatPress={requestSeat}
        />
        {error && (
          <Text role="alert" style={styles.error}>
            {error}
          </Text>
        )}
        <Text style={styles.helper}>Tap a free seat to hold it.</Text>
      </ScrollView>
      {selectedInfo && (
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          {/* no-op until checkout */}
          <SeatCard seat={selectedInfo} onContinue={() => {}} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  headerSpacer: { width: layout.headerButton },
  body: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  error: {
    ...typography.subtitle,
    color: colors.warning,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingHorizontal: layout.screenMargin,
    paddingTop: spacing.md,
  },
  helper: {
    ...typography.subtitle,
    color: colors.textInactive,
    textAlign: 'center',
  },
});
