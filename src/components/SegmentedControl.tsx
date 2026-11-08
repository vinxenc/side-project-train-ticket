import { Pressable, Text, View } from 'react-native';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full bg-segmentTrack p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-full py-2 ${
              selected ? 'bg-segmentActive' : ''
            }`}
          >
            <Text
              className={`text-sm ${
                selected
                  ? 'font-semibold text-textPrimary'
                  : 'text-textInactive'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
