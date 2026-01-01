import { HapticTab } from '@/components/haptic-tab';
import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors.textWhite,
          borderTopColor: Colors.gray200,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 68,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarShowLabel: false, // We'll use custom labels
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={Icons.home.name}
              size={focused ? 26 : 24}
              color={color}
              library={Icons.home.library}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 12,
              fontWeight: focused ? '700' : '500',
              color: color,
              marginTop: 4,
              letterSpacing: 0.2,
            }}>
              Home
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={Icons.category.name}
              size={focused ? 26 : 24}
              color={color}
              library={Icons.category.library}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 12,
              fontWeight: focused ? '700' : '500',
              color: color,
              marginTop: 4,
              letterSpacing: 0.2,
            }}>
              Explore
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={Icons.orders.name}
              size={focused ? 26 : 24}
              color={color}
              library={Icons.orders.library}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 12,
              fontWeight: focused ? '700' : '500',
              color: color,
              marginTop: 4,
              letterSpacing: 0.2,
            }}>
              Orders
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={Icons.profile.name}
              size={focused ? 26 : 24}
              color={color}
              library={Icons.profile.library}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 12,
              fontWeight: focused ? '700' : '500',
              color: color,
              marginTop: 4,
              letterSpacing: 0.2,
            }}>
              Profile
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
