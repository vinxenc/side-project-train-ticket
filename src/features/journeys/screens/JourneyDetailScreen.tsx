import { useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TrainHero } from '@/features/seat-map-3d';
import { colors, layout, spacing, typography } from '@/shared/theme';
import { IconButton } from '@/shared/ui/IconButton';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { useTabBarClearance } from '@/shared/ui/TabBar';

import { JourneyCard } from '../components/JourneyCard';
import { JourneyDetails } from '../components/JourneyDetails';
import { useJourney } from '../hooks/useJourney';

type Segment = 'overview' | 'live' | 'tickets';

const segments: { value: Segment; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'live', label: 'Live' },
  { value: 'tickets', label: 'Tickets' },
];

export function JourneyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const journey = useJourney(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const clearance = useTabBarClearance();
  const [segment, setSegment] = useState<Segment>('overview');
  const heroActive = useIsFocused() && segment === 'overview';

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace('/journeys');

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton icon="chevron-back" label="Back" onPress={goBack} />
        <Text role="heading" style={styles.title}>
          My Journeys
        </Text>
        {/* no-op for now */}
        <IconButton icon="ellipsis-vertical" label="More options" />
      </View>

      {journey ? (
        <>
          <View style={styles.segments}>
            <SegmentedControl
              testID="journey-segments"
              options={segments}
              value={segment}
              onChange={setSegment}
            />
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: clearance }}
            showsVerticalScrollIndicator={false}
          >
            <TrainHero active={heroActive} />
            <View style={styles.content}>
              {segment === 'overview' && (
                <>
                  <JourneyCard
                    journey={journey}
                    onSeatPress={() =>
                      router.push(`/booking/${journey.tripId}/seats`)
                    }
                  />
                  <JourneyDetails journey={journey} />
                </>
              )}
              {segment === 'live' && (
                <Text style={styles.placeholder}>
                  Live status is coming soon.
                </Text>
              )}
              {segment === 'tickets' && (
                <Text style={styles.placeholder}>
                  Tickets for this journey are coming soon.
                </Text>
              )}
            </View>
          </ScrollView>
        </>
      ) : (
        <Text style={styles.placeholder}>Journey not found</Text>
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
  title: { ...typography.headerTitle, color: colors.textPrimary },
  segments: {
    marginTop: layout.headerToSegmentGap,
    marginHorizontal: layout.screenMargin,
  },
  scroll: { flex: 1, marginTop: layout.blockGap },
  content: {
    paddingHorizontal: layout.screenMargin,
    paddingTop: layout.blockGap,
    gap: layout.blockGap,
  },
  placeholder: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
