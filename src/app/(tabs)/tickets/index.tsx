import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

export default function TicketsScreen() {
  return (
    <View style={styles.container}>
      <Text>Tickets</Text>
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
