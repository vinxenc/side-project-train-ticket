import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="rounded-3xl bg-buttonDark px-6 py-3">
        <Text className="text-lg font-semibold text-onButtonDark">
          Train Ticket
        </Text>
      </View>
    </View>
  );
}
