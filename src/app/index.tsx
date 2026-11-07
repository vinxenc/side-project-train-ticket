import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100">
      <View className="rounded-3xl bg-black px-6 py-3">
        <Text className="text-lg font-semibold text-white">Train Ticket</Text>
      </View>
    </View>
  );
}
