import { HapticTab } from '@/components/haptic-tab';
import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.neutralLight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 6,
        },
        tabBarShowLabel: true,
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                name={focused ? "home" : "home-outline"}
                size={22}
                color={focused ? Colors.primary : "#94A3B8"}
                library="ionicons"
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '800' : '600',
              color: focused ? Colors.primary : '#94A3B8',
              marginTop: 2,
              letterSpacing: 0.1,
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
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                name={focused ? "search" : "search-outline"}
                size={22}
                color={focused ? Colors.primary : "#94A3B8"}
                library="ionicons"
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '800' : '600',
              color: focused ? Colors.primary : '#94A3B8',
              marginTop: 2,
              letterSpacing: 0.1,
            }}>
              Explore
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null, // Hidden tab route
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                name={focused ? "receipt" : "receipt-outline"}
                size={22}
                color={focused ? Colors.primary : "#94A3B8"}
                library="ionicons"
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '800' : '600',
              color: focused ? Colors.primary : '#94A3B8',
              marginTop: 2,
              letterSpacing: 0.1,
            }}>
              Orders
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                name={focused ? "notifications" : "notifications-outline"}
                size={22}
                color={focused ? Colors.primary : "#94A3B8"}
                library="ionicons"
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '800' : '600',
              color: focused ? Colors.primary : '#94A3B8',
              marginTop: 2,
              letterSpacing: 0.1,
            }}>
              Inbox
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                name={focused ? "person" : "person-outline"}
                size={22}
                color={focused ? Colors.primary : "#94A3B8"}
                library="ionicons"
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '800' : '600',
              color: focused ? Colors.primary : '#94A3B8',
              marginTop: 2,
              letterSpacing: 0.1,
            }}>
              Profile
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
