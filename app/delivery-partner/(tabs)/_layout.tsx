import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function DeliveryPartnerTabsLayout() {
  const { isAuthenticated, isLoading } = useDeliveryPartner();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
          // elevation: 8,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dashboard" size={22} color={color} library="material" />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Icon name="inventory" size={22} color={color} library="material" />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping-cart" size={22} color={color} library="material" />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications" size={22} color={color} library="material" />
          ),
        }}
      />
      <Tabs.Screen
        name="partners"
        options={{
          title: 'Partners',
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={22} color={color} library="material" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={22} color={color} library="material" />
          ),
        }}
      />
    </Tabs>
  );
}

