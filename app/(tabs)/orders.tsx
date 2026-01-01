import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { MOCK_ORDERS } from '@/constants/mockData';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, Icons } from '@/components/ui/Icon';
import { Order, OrderStatus } from '@/types';
import { Colors } from '@/constants/colors';

const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'rgba(254, 243, 199, 0.9)', text: '#D97706', border: 'rgba(253, 230, 138, 0.6)' },
  confirmed: { bg: 'rgba(219, 234, 254, 0.9)', text: '#2563EB', border: 'rgba(191, 219, 254, 0.6)' },
  processing: { bg: 'rgba(233, 213, 255, 0.9)', text: '#7C3AED', border: 'rgba(221, 214, 254, 0.6)' },
  packed: { bg: 'rgba(224, 231, 255, 0.9)', text: '#6366F1', border: 'rgba(199, 210, 254, 0.6)' },
  shipped: { bg: 'rgba(209, 250, 229, 0.9)', text: '#059669', border: 'rgba(167, 243, 208, 0.6)' },
  out_for_delivery: { bg: 'rgba(254, 215, 170, 0.9)', text: '#EA580C', border: 'rgba(253, 186, 116, 0.6)' },
  delivered: { bg: 'rgba(209, 250, 229, 0.9)', text: '#059669', border: 'rgba(167, 243, 208, 0.6)' },
  cancelled: { bg: 'rgba(254, 226, 226, 0.9)', text: '#DC2626', border: 'rgba(254, 202, 202, 0.6)' },
  refunded: { bg: 'rgba(243, 244, 246, 0.9)', text: '#6B7280', border: 'rgba(229, 231, 235, 0.6)' },
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const SECTION_PADDING = 20;

export default function OrdersScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/orders/[id]',
      params: { id: order.id },
    });
  };

  const headerHeight = Platform.OS === 'ios' ? 120 : 100;

  if (MOCK_ORDERS.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <PageHeader title="My Orders" variant="primary" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: headerHeight, paddingHorizontal: 24 }}>
          <Animated.View style={{ opacity: fadeAnim, width: '100%', maxWidth: 400 }}>
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 12,
              padding: 40,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.gray200,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View style={{ 
                backgroundColor: Colors.gray100,
                borderRadius: 60, 
                padding: 24, 
                marginBottom: 20,
              }}>
                <Icon name={Icons.orders.name} size={60} color={Colors.textSecondary} library={Icons.orders.library} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center' }}>
                No orders yet
              </Text>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', fontSize: 15, lineHeight: 22, fontWeight: '400' }}>
                Your order history will appear here
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="My Orders" variant="primary" />

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: SECTION_PADDING, paddingTop: headerHeight + 20, paddingBottom: SECTION_PADDING }}
        renderItem={({ item }) => {
          const statusStyle = statusColors[item.status];
          return (
            <Animated.View
              style={{
                opacity: fadeAnim,
                marginBottom: 16,
              }}
            >
              <TouchableOpacity onPress={() => handleOrderPress(item)} activeOpacity={0.85}>
                <View style={{
                  backgroundColor: Colors.textWhite,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1.5,
                  borderColor: Colors.gray200,
                  borderLeftWidth: 5,
                  borderLeftColor: statusStyle.border,
                  shadowColor: Colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{
                        backgroundColor: Colors.gray100,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        alignSelf: 'flex-start',
                        marginBottom: 10,
                      }}>
                        <Text style={{ fontSize: 11, color: Colors.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          ORDER #{item.orderNumber}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.3 }}>
                        {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon name="schedule" size={14} color={Colors.textSecondary} library="material" />
                        <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '500' }}>
                          {new Date(item.placedAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={{
                      backgroundColor: statusStyle.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: statusStyle.border,
                      shadowColor: statusStyle.border,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 2,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: statusStyle.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {statusLabels[item.status]}
                      </Text>
                    </View>
                  </View>

                  <View style={{ 
                    borderTopWidth: 1.5, 
                    borderTopColor: Colors.gray200, 
                    paddingTop: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <View>
                      <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' }}>Total Amount</Text>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
                        ₹{item.total}
                      </Text>
                    </View>
                    {item.status === 'out_for_delivery' && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: Colors.primary,
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderRadius: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          shadowColor: Colors.primary,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          elevation: 4,
                        }}
                        onPress={() => router.push({
                          pathname: '/orders/[id]',
                          params: { id: item.id },
                        })}
                        activeOpacity={0.8}
                      >
                        <Icon name={Icons.truck.name} size={18} color={Colors.textWhite} library={Icons.truck.library} />
                        <Text style={{ color: Colors.textWhite, fontWeight: '700', fontSize: 14, marginLeft: 8, letterSpacing: 0.3 }}>
                          Track Order
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}
