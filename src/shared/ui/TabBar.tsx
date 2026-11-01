import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radius, shadows, spacing, typography } from '../theme';

function useBottomOffset(): number {
  return Math.max(useSafeAreaInsets().bottom - 12, 12);
}

/** Space a screen's scroll content needs at the bottom so the floating bar never covers it. */
export function useTabBarClearance(): number {
  return layout.tabBarHeight + useBottomOffset() + spacing.lg;
}

export function TabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const bottom = useBottomOffset();

  return (
    // Solid fill (`colors.tabBar`): iOS cannot compute the shadow of a translucent view
    // and logs a shadow ADVICE warning. Content still scrolls under the floating bar.
    <View testID="main-tab-bar" style={[styles.bar, { bottom }]}>
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const { options } = descriptors[route.key];
        const title = options.title ?? route.name;
        const color = focused ? colors.textPrimary : colors.textSecondary;

        const onPress = () => {
          const event = emitter.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };

        return (
          <Pressable
            key={route.key}
            role="tab"
            aria-selected={focused}
            aria-label={title}
            onPress={onPress}
            style={styles.tab}
          >
            <View style={[styles.item, focused && styles.itemActive]}>
              {options.tabBarIcon?.({ focused, color, size: layout.tabIcon })}
              <Text style={[typography.tabLabel, { color }]}>{title}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: layout.tabBarSideMargin,
    right: layout.tabBarSideMargin,
    height: layout.tabBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.tabBar,
    ...shadows.tabBar,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: {
    width: layout.tabActiveWidth,
    height: layout.tabActiveHeight,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: { backgroundColor: colors.tabBarActive },
});
