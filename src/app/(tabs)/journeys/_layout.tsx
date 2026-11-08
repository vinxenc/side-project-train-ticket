import { Stack } from 'expo-router';

// A Stack inside the tab, so /journeys/[id] keeps the tab bar visible.
export default function JourneysLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
