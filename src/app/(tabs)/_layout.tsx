import { Tabs } from 'expo-router';
import { Leaf, Trees } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGarden } from '@/hooks/useGarden';

export default function TabLayout() {
  const { T, L } = useGarden();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <Tabs
      initialRouteName="tareas"
      screenOptions={{
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: T.textMuted,
        tabBarStyle: {
          backgroundColor: T.tabBar,
          borderTopColor: T.tabBorder,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: 'Outfit-Bold', fontSize: 13 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="tareas"
        options={{
          title: L.tabTareas,
          tabBarIcon: ({ color, size }) => <Leaf color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="jardin"
        options={{
          title: L.tabJardin,
          tabBarIcon: ({ color, size }) => <Trees color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
