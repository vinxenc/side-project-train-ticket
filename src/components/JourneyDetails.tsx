import { FileText, Footprints, Mountain } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { colors } from '@/shared/theme/colors';
import { cardShadow } from '@/shared/theme/layout';

import type { Journey } from '@/api/journeys';

function Row({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-chip">
        <Icon size={18} color={colors.textPrimary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-textPrimary">{title}</Text>
        <Text className="text-xs text-textSecondary">{subtitle}</Text>
      </View>
    </View>
  );
}

export function JourneyDetails({ journey }: { journey: Journey }) {
  return (
    <View className="rounded-3xl bg-card px-5 py-4" style={cardShadow}>
      <View className="flex-row items-center gap-2 border-b border-divider pb-3">
        <FileText size={18} color={colors.textPrimary} />
        <Text className="text-sm font-semibold text-textPrimary">
          Journey details
        </Text>
      </View>
      <Row
        icon={Footprints}
        title={
          <>
            Boarding opens in{' '}
            <Text className="text-success">
              {journey.boardingOpensInMin} min
            </Text>
          </>
        }
        subtitle={`Car ${journey.car} · ${journey.carPosition}`}
      />
      <Row
        icon={Mountain}
        title={journey.seatNote}
        subtitle={`Seat ${journey.seat}`}
      />
    </View>
  );
}
