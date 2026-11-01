import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { TabBar } from '@/shared/ui/TabBar';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabOptions(title: string, icon: IconName) {
  return {
    title,
    tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => (
      <Ionicons
        name={icon}
        size={size}
        color={typeof color === 'string' ? color : undefined}
      />
    ),
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="journeys" options={tabOptions('Journeys', 'train')} />
      <Tabs.Screen
        name="tickets/index"
        options={tabOptions('Tickets', 'ticket')}
      />
      <Tabs.Screen
        name="explore/index"
        options={tabOptions('Explore', 'map')}
      />
      <Tabs.Screen
        name="profile/index"
        options={tabOptions('Profile', 'person-circle')}
      />
    </Tabs>
  );
}
