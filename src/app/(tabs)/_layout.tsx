import { Ticket } from 'lucide-react-native';
import { Tabs, usePathname } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { GestureResponderEvent, PressableProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapFilledIcon, UserFilledIcon } from '@/components/FilledIcons';
import { TrainSideIcon } from '@/components/TrainSideIcon';
import { colors } from '@/shared/theme/colors';
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from '@/shared/theme/layout';

type IconType = ComponentType<{ size?: number; color?: string }>;

const TABS: { name: string; title: string; icon: IconType }[] = [
  { name: 'journeys', title: 'Journeys', icon: TrainSideIcon },
  { name: 'tickets/index', title: 'Tickets', icon: Ticket },
  { name: 'explore/index', title: 'Explore', icon: MapFilledIcon },
  { name: 'profile/index', title: 'Profile', icon: UserFilledIcon },
];

interface ButtonProps {
  onPress?: ((e: GestureResponderEvent) => void) | null;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  testID?: string;
}

// The whole tab button, drawn by us: icon and label inside one rounded pill that
// is filled when active. (The built-in item squeezes its label and has a square
// highlight.)
function TabButton({
  icon: Icon,
  title,
  onPress,
  onLongPress,
  testID,
  name,
}: ButtonProps & { icon: IconType; title: string; name: string }) {
  // The button is not told whether it is selected, so read it from the route.
  const focused = usePathname().startsWith(`/${name.split('/')[0]}`);
  // Every tab is near-black, as in the mockup; only the pill marks the active one.
  const color = colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={title}
      accessibilityState={{ selected: focused }}
      testID={testID}
      onPress={onPress as PressableProps['onPress']}
      onLongPress={onLongPress as PressableProps['onLongPress']}
      className="flex-1 items-center justify-center"
    >
      <View
        className={`items-center rounded-full px-4 py-1.5 ${focused ? 'bg-tabBarActive' : ''}`}
      >
        <Icon size={22} color={color} />
        <Text className="mt-0.5 text-[11px] font-semibold" style={{ color }}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Floating, translucent, no shadow (a translucent fill plus a shadow
        // makes iOS log a warning). The screens pad their content to clear it.
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: TAB_BAR_GAP,
          bottom: insets.bottom + TAB_BAR_GAP,
          height: TAB_BAR_HEIGHT,
          borderRadius: 32,
          borderTopWidth: 0,
          backgroundColor: colors.tabBar,
          paddingHorizontal: 8,
          // Tabs adds the safe-area inset as padding; the bar floats above it.
          paddingBottom: 0,
        },
      }}
    >
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarButton: (props) => (
              <TabButton {...props} icon={icon} title={title} name={name} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
