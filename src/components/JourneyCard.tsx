import { Armchair, Map, QrCode } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/theme/colors';
import { cardShadow } from '@/shared/theme/layout';
import { IconButton } from '@/components/IconButton';
import { TrainSideIcon } from '@/components/TrainSideIcon';

import type { Journey, Stop } from '@/api/journeys';

/** '09:00', '11:12' -> '2h 12m'. Same-day trips only for now. */
export function formatDuration(from: string, to: string): string {
  const minutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const total = minutes(to) - minutes(from);
  return `${Math.floor(total / 60)}h ${total % 60}m`;
}

function StopBlock({
  stop,
  align,
  children,
}: {
  stop: Stop;
  align: 'left' | 'right';
  children?: React.ReactNode;
}) {
  const alignment = align === 'left' ? 'items-start' : 'items-end';
  return (
    <View className={alignment}>
      <Text className="text-xs text-textSecondary">{stop.city}</Text>
      <Text className="text-3xl font-bold text-textPrimary">{stop.time}</Text>
      <Text className="text-xs text-textSecondary">
        Platform {stop.platform}
        {children}
      </Text>
    </View>
  );
}

export function JourneyCard({ journey }: { journey: Journey }) {
  const onTime = journey.status === 'on-time';
  return (
    <View className="rounded-3xl bg-card p-5" style={cardShadow}>
      <View className="flex-row items-center justify-between border-b border-divider pb-4">
        <View>
          <Text className="text-base font-semibold text-textPrimary">
            {journey.trainName}
          </Text>
          <Text className="text-xs text-textSecondary">
            {journey.line} · {journey.model}
          </Text>
        </View>
        <View
          accessibilityLabel={`Seat ${journey.seat}`}
          className="flex-row items-center gap-1 rounded-full bg-chip px-3 py-1.5"
        >
          <Armchair size={14} color={colors.textPrimary} />
          <Text className="text-xs font-semibold text-textPrimary">
            {journey.seat}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between py-4">
        <StopBlock stop={journey.from} align="left">
          <Text> · </Text>
          <Text className={onTime ? 'text-success' : 'text-warning'}>
            {onTime ? 'On time' : 'Delayed'}
          </Text>
        </StopBlock>
        <View className="items-center gap-1">
          <Text className="text-xs text-textSecondary">
            {formatDuration(journey.from.time, journey.to.time)}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-textSecondary">······</Text>
            <TrainSideIcon size={20} color={colors.textPrimary} />
            <Text className="text-textSecondary">······</Text>
          </View>
        </View>
        <StopBlock stop={journey.to} align="right" />
      </View>

      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-buttonDark"
        >
          <QrCode size={18} color={colors.onButtonDark} />
          <Text className="text-sm font-semibold text-onButtonDark">
            Show ticket
          </Text>
        </Pressable>
        <IconButton icon={Map} label="Show map" size={48} className="bg-chip" />
      </View>
    </View>
  );
}
