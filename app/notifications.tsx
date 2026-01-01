import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Animated } from 'react-native';
import { router } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, Icons } from '@/components/ui/Icon';
import { Notification } from '@/types';
import { Colors } from '@/constants/colors';

const CARD_PADDING = 20;
const SECTION_PADDING = 20;

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Order Confirmed',
    message: 'Your order ORD-2024-001 has been confirmed',
    type: 'order',
    read: false,
    timestamp: '2024-01-22T10:30:00Z',
    actionUrl: '/orders/o1',
  },
  {
    id: 'n2',
    title: 'Special Offer',
    message: 'Get 20% off on all dairy products. Use code DAIRY20',
    type: 'promotion',
    read: false,
    timestamp: '2024-01-21T14:20:00Z',
  },
  {
    id: 'n3',
    title: 'Order Delivered',
    message: 'Your order ORD-2024-001 has been delivered successfully',
    type: 'order',
    read: true,
    timestamp: '2024-01-21T14:15:00Z',
    actionUrl: '/orders/o1',
  },
  {
    id: 'n4',
    title: 'Reminder',
    message: 'Don\'t forget to rate your recent order',
    type: 'reminder',
    read: true,
    timestamp: '2024-01-20T09:00:00Z',
  },
];

const typeIcons: Record<Notification['type'], { name: string; library: 'material' | 'ionicons' | 'feather'; color: string }> = {
  order: { name: Icons.orders.name, library: Icons.orders.library, color: Colors.info },
  promotion: { name: 'local-offer', library: 'material' as const, color: Colors.warning },
  reminder: { name: 'schedule', library: 'material' as const, color: Colors.accent },
  system: { name: Icons.settings.name, library: Icons.settings.library, color: Colors.textSecondary },
};

export default function NotificationsScreen() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader 
        title="Notifications" 
        variant="primary"
        rightComponent={
          unreadCount > 0 ? (
            <View style={{
              backgroundColor: Colors.error,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderWidth: 2,
              borderColor: Colors.textWhite,
            }}>
              <Text style={{ color: Colors.textWhite, fontSize: 12, fontWeight: '700' }}>
                {unreadCount}
              </Text>
            </View>
          ) : undefined
        }
      />

      {MOCK_NOTIFICATIONS.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SECTION_PADDING }}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <GlassCard
              variant="elevated"
              style={{
                alignItems: 'center',
                backgroundColor: Colors.glassHeavy,
                padding: 0,
              }}
              padding={40}
            >
              <View style={{
                backgroundColor: `${Colors.info}15`,
                borderRadius: 80,
                padding: 36,
                marginBottom: 28,
                borderWidth: 3,
                borderColor: `${Colors.info}25`,
              }}>
                <Icon name={Icons.notification.name} size={80} color={Colors.info} library={Icons.notification.library} />
              </View>
              <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12, letterSpacing: -0.5 }}>
                No notifications
              </Text>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', fontSize: 17, fontWeight: '500' }}>
                You're all caught up!
              </Text>
            </GlassCard>
          </Animated.View>
        </View>
      ) : (
        <FlatList
          data={MOCK_NOTIFICATIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SECTION_PADDING, paddingTop: 0 }}
          renderItem={({ item, index }) => {
            const iconConfig = typeIcons[item.type];
            return (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  onPress={() => item.actionUrl && router.push(item.actionUrl as any)}
                  activeOpacity={0.8}
                  style={{ marginBottom: 16 }}
                >
                  <GlassCard
                    variant="elevated"
                    style={{
                      backgroundColor: Colors.glassHeavy,
                      borderLeftWidth: !item.read ? 5 : 0,
                      borderLeftColor: !item.read ? Colors.info : 'transparent',
                      padding: 0,
                    }}
                    padding={20}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                        backgroundColor: `${iconConfig.color}15`,
                        borderWidth: 2,
                        borderColor: `${iconConfig.color}30`,
                      }}>
                        <Icon 
                          name={iconConfig.name} 
                          size={28} 
                          color={iconConfig.color} 
                          library={iconConfig.library} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, flex: 1, letterSpacing: -0.3 }}>
                            {item.title}
                          </Text>
                          {!item.read && (
                            <View style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: Colors.info,
                              marginLeft: 8,
                            }} />
                          )}
                        </View>
                        <Text style={{ fontSize: 15, color: Colors.textSecondary, marginBottom: 10, lineHeight: 22, fontWeight: '500' }}>
                          {item.message}
                        </Text>
                        <Text style={{ fontSize: 13, color: Colors.textTertiary, fontWeight: '600' }}>
                          {new Date(item.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}
