import '../../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { queryClient } from '@/api/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
