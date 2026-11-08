import { Link } from 'expo-router';
import { Text, View } from 'react-native';

// Stub list until a list api exists: one link to the fake journey.
export default function JourneysList() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Link href={'/journeys/nozomi-32'} asChild>
        <Text className="rounded-3xl bg-buttonDark px-6 py-3 text-lg font-semibold text-onButtonDark">
          Nozomi 32 · Tokyo → Kyoto
        </Text>
      </Link>
    </View>
  );
}
