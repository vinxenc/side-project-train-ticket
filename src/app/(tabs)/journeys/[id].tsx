import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, EllipsisVertical } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getJourney } from '@/api/journeys';
import { HeroIllustration } from '@/components/HeroIllustration';
import { IconButton } from '@/components/IconButton';
import { JourneyCard } from '@/components/JourneyCard';
import { JourneyDetails } from '@/components/JourneyDetails';
import { SegmentedControl } from '@/components/SegmentedControl';
import { colors } from '@/shared/theme/colors';
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from '@/shared/theme/layout';

const SEGMENTS = [
  { value: 'overview', label: 'Overview' },
  { value: 'live', label: 'Live' },
  { value: 'tickets', label: 'Tickets' },
] as const;
type Segment = (typeof SEGMENTS)[number]['value'];

// Opened directly (a deep link), there is no earlier screen to go back to.
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/journeys');
}

export default function JourneyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<Segment>('overview');
  const {
    data: journey,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['journey', id],
    queryFn: () => getJourney(id),
  });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <IconButton icon={ChevronLeft} label="Back" onPress={goBack} />
        <Text
          accessibilityRole="header"
          className="text-base font-semibold text-textPrimary"
        >
          My Journeys
        </Text>
        <IconButton icon={EllipsisVertical} label="More options" />
      </View>

      <View className="px-4 pb-3">
        <SegmentedControl
          options={SEGMENTS}
          value={segment}
          onChange={setSegment}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_GAP * 2,
        }}
      >
        <HeroIllustration />
        <View className="gap-4 p-4">
          {isPending && <ActivityIndicator color={colors.accent} />}
          {isError && (
            <Text
              accessibilityRole="alert"
              onPress={() => refetch()}
              className="text-center text-sm text-warning"
            >
              Could not load this journey. Tap to retry.
            </Text>
          )}
          {journey && segment === 'overview' && (
            <>
              <JourneyCard journey={journey} />
              <JourneyDetails journey={journey} />
            </>
          )}
          {journey && segment !== 'overview' && (
            <Text className="py-8 text-center text-sm text-textSecondary">
              {segment === 'live' ? 'Live status' : 'Tickets'} is coming soon.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
