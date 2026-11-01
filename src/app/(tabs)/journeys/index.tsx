import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/theme';

// Stub list until the Journeys list screen exists.
export default function JourneysScreen() {
  return (
    <View style={styles.container}>
      <Link href="/journeys/nozomi-32">Open journey</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
