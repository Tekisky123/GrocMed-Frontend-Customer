import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_ORDERS } from '@/constants/mockData';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, Icons } from '@/components/ui/Icon';
import { Order, OrderStatus } from '@/types';
import { Colors } from '@/constants/colors';

const CARD_PADDING = 20;
const SECTION_PADDING = 20;

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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = MOCK_ORDERS.find((o) => o.id === id);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SECTION_PADDING }}>
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
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 24, letterSpacing: -0.5 }}>
              Order not found
            </Text>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 16,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: Colors.textWhite, fontWeight: '800', fontSize: 16, letterSpacing: 0.8 }}>
                GO BACK
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>
      </View>
    );
  }

  const statusStyle = statusColors[order.status];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="Order Details" variant="primary" />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Enhanced Order Status - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 24, opacity: fadeAnim }}>
          <GlassCard
            variant="elevated"
            style={{
              backgroundColor: Colors.glassHeavy,
              padding: 0,
            }}
            padding={28}
          >
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                backgroundColor: statusStyle.bg,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: statusStyle.border,
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: statusStyle.text, letterSpacing: 0.8 }}>
                  {statusLabels[order.status].toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
                Order #{order.orderNumber}
              </Text>
            </View>

            {/* Enhanced Tracking Timeline */}
            {order.tracking && order.tracking.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20, letterSpacing: -0.5 }}>
                  Tracking Timeline
                </Text>
                {order.tracking.map((track, index) => {
                  const isLast = index === order.tracking!.length - 1;
                  return (
                    <View key={index} style={{ flexDirection: 'row', marginBottom: 20 }}>
                      <View style={{ alignItems: 'center', marginRight: 16 }}>
                        <View style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: isLast ? Colors.primary : Colors.gray300,
                          borderWidth: 3,
                          borderColor: Colors.glassHeavy,
                          shadowColor: isLast ? Colors.primary : 'transparent',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: isLast ? 4 : 0,
                        }} />
                        {!isLast && (
                          <View style={{ width: 2, height: 40, backgroundColor: Colors.gray300, marginTop: 4 }} />
                        )}
                      </View>
                      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6, letterSpacing: -0.2 }}>
                          {track.message}
                        </Text>
                        <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '600', marginBottom: 4 }}>
                          {new Date(track.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        {track.location && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Icon name={Icons.location.name} size={16} color={Colors.textSecondary} library={Icons.location.library} />
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginLeft: 6, fontWeight: '500' }}>
                              {track.location}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Enhanced Order Items - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 24, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Order Items
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.primary,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </View>
          {order.items.map((item) => (
            <GlassCard
              key={item.id}
              variant="elevated"
              style={{
                backgroundColor: Colors.glassHeavy,
                marginBottom: 16,
                padding: 0,
              }}
              padding={18}
            >
              <View style={{ flexDirection: 'row' }}>
                <View style={{
                  backgroundColor: Colors.gray50,
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginRight: 16,
                  width: 100,
                  height: 100,
                }}>
                  <Image
                    source={{ uri: item.product.image }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 17, 
                    fontWeight: '800', 
                    color: Colors.textPrimary, 
                    marginBottom: 8,
                    letterSpacing: -0.3,
                  }} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 10, fontWeight: '600' }}>
                    {item.product.brand} • Qty: {item.quantity}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
                    ₹{item.total}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </Animated.View>

        {/* Enhanced Order Summary - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 24, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Order Summary
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.primary,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </View>
          <GlassCard
            variant="elevated"
            style={{
              backgroundColor: Colors.glassHeavy,
              padding: 0,
            }}
            padding={24}
          >
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 16, fontWeight: '600' }}>Subtotal</Text>
                <Text style={{ color: Colors.textPrimary, fontWeight: '800', fontSize: 16 }}>
                  ₹{order.subtotal}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 16, fontWeight: '600' }}>Delivery Fee</Text>
                <Text style={{ color: Colors.textPrimary, fontWeight: '800', fontSize: 16 }}>
                  {order.deliveryFee === 0 ? (
                    <Text style={{ color: Colors.success, fontWeight: '800' }}>FREE</Text>
                  ) : (
                    `₹${order.deliveryFee}`
                  )}
                </Text>
              </View>
              {order.discount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: Colors.success, fontSize: 16, fontWeight: '600' }}>Discount</Text>
                  <Text style={{ color: Colors.success, fontWeight: '800', fontSize: 16 }}>
                    -₹{order.discount}
                  </Text>
                </View>
              )}
              <View style={{ 
                borderTopWidth: 2.5, 
                borderTopColor: Colors.gray200, 
                paddingTop: 18, 
                marginTop: 10,
                flexDirection: 'row', 
                justifyContent: 'space-between' 
              }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>Total</Text>
                <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
                  ₹{order.total}
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Enhanced Delivery Address - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 24, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Delivery Address
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.primary,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </View>
          <GlassCard
            variant="elevated"
            style={{
              backgroundColor: Colors.glassHeavy,
              padding: 0,
            }}
            padding={24}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12, letterSpacing: -0.3 }}>
              {order.deliveryAddress.name}
            </Text>
            <Text style={{ fontSize: 15, color: Colors.textSecondary, marginBottom: 8, lineHeight: 22, fontWeight: '500' }}>
              {order.deliveryAddress.addressLine1}
              {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
            </Text>
            <Text style={{ fontSize: 15, color: Colors.textSecondary, marginBottom: 8, fontWeight: '500' }}>
              {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Icon name={Icons.phone.name} size={18} color={Colors.textSecondary} library={Icons.phone.library} />
              <Text style={{ fontSize: 15, color: Colors.textSecondary, marginLeft: 8, fontWeight: '600' }}>
                {order.deliveryAddress.phone}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
