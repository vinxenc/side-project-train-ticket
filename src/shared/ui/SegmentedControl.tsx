import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, shadows, typography } from '../theme';

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track} testID={testID}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="tab"
            aria-selected={active}
            onPress={() => {
              if (!active) onChange(option.value);
            }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text
              style={[
                active ? typography.segmentActive : typography.segment,
                { color: active ? colors.textPrimary : colors.textInactive },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: layout.segmentTrackHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.segmentTrack,
    padding: layout.segmentInset,
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    height: layout.segmentPillHeight,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: colors.segmentActive, ...shadows.control },
});
