import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { layout, spacing } from '../../theme';
import { useTabBarClearance } from '../TabBar';

function withInsets(bottom: number) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 402, height: 874 },
          insets: { top: 62, bottom, left: 0, right: 0 },
        }}
      >
        {children}
      </SafeAreaProvider>
    );
  };
}

test('tab bar clearance covers the bar, its offset and a gap', async () => {
  // Home-indicator inset 34 -> bar offset 22.
  const { result } = await renderHook(() => useTabBarClearance(), {
    wrapper: withInsets(34),
  });
  expect(result.current).toBe(layout.tabBarHeight + 22 + spacing.lg);
});

test('tab bar clearance keeps a minimum offset without a bottom inset', async () => {
  const { result } = await renderHook(() => useTabBarClearance(), {
    wrapper: withInsets(0),
  });
  expect(result.current).toBe(layout.tabBarHeight + 12 + spacing.lg);
});
