import { orderApi } from '@/api/orderApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { Order } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const truckAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.cubic) })
    ]).start();

    // Loop Truck Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(truckAnim, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.linear }),
        Animated.timing(truckAnim, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrderDetails(id as string);
      if (res.success && res.data) {
        const o = res.data;
        // Parse address if string
        let parsedAddress = o.shippingAddress;
        try {
          if (typeof o.shippingAddress === 'string') {
            parsedAddress = JSON.parse(o.shippingAddress);
          }
        } catch (e) {
          console.log("Address parse error");
        }

        const mappedOrder = {
          id: o._id || o.id,
          orderNumber: o.orderId || o._id?.slice(-6).toUpperCase() || 'UNKNOWN',
          items: (o.items || []).map((i: any) => ({
            id: i._id,
            name: i.name || i.product?.name || 'Product',
            image: i.image || i.product?.image,
            quantity: i.quantity,
            price: i.price,
            total: (i.price * i.quantity)
          })),
          status: o.orderStatus || o.status || 'Placed',
          total: o.totalAmount,
          subtotal: o.totalAmount,
          deliveryFee: 0,
          discount: 0,
          placedAt: o.createdAt,
          shippingAddress: parsedAddress,
          paymentMethod: o.paymentMethod || 'COD'
        };
        setOrder(mappedOrder);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!order) return null;

  const steps = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStatusIndex = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'cancelled') return -1;
    if (s === 'delivered') return 4;
    if (s === 'out for delivery' || s === 'out_for_delivery') return 3; // Fixed key match
    if (s === 'shipped') return 2;
    if (s === 'packed') return 1;
    return 0;
  };

  const currentStepIndex = getStatusIndex(order.status);
  const isCancelled = order.status?.toLowerCase() === 'cancelled';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header Area */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.primary }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          {/* NavBar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Icon name="arrow-back" size={24} color="#fff" library="material" />
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '700', marginRight: 40 }}>
              Order Details
            </Text>
          </View>

          {/* Key Info */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 8 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>ORDER TOTAL</Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>₹{order.total}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 6 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>#{order.orderNumber}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Content Sheet */}
      <Animated.View style={{
        flex: 1,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        overflow: 'hidden'
      }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

          {/* Delivery Status Card */}
          {!isCancelled ? (
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.03)'
            }}>
              {/* Animation Strip */}
              <View style={{
                height: 60,
                backgroundColor: '#F3F4F6',
                borderRadius: 16,
                marginBottom: 20,
                overflow: 'hidden',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}>
                <Animated.View style={{
                  transform: [{
                    translateX: truckAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-40, 300] // Adjusted for card width
                    })
                  }]
                }}>
                  <Icon name="local-shipping" size={28} color={Colors.primary} library="material" />
                </Animated.View>
              </View>

              {/* Timeline Steps */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {steps.map((step, idx) => {
                  const isActive = currentStepIndex >= idx;
                  return (
                    <View key={step} style={{ alignItems: 'center', width: '20%' }}>
                      {/* Dot */}
                      <View style={{
                        width: 20, height: 20, borderRadius: 10,
                        backgroundColor: isActive ? Colors.primary : Colors.gray200,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: '#fff',
                        shadowColor: isActive ? Colors.primary : 'transparent',
                        shadowOpacity: 0.3, shadowRadius: 4,
                        zIndex: 2
                      }}>
                        {isActive && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />}
                      </View>
                      {/* Connector */}
                      {idx < steps.length - 1 && (
                        <View style={{
                          position: 'absolute', top: 9, left: '50%', width: '100%', height: 2,
                          backgroundColor: currentStepIndex > idx ? Colors.primary : Colors.gray200,
                          zIndex: 1
                        }} />
                      )}
                      <Text style={{
                        fontSize: 9,
                        marginTop: 8,
                        textAlign: 'center',
                        color: isActive ? Colors.textPrimary : Colors.textTertiary,
                        fontWeight: isActive ? '700' : '500'
                      }}>
                        {step}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          ) : (
            <View style={{ backgroundColor: '#FFEBEE', padding: 20, borderRadius: 16, marginBottom: 24, alignItems: 'center' }}>
              <Icon name="error-outline" size={32} color={Colors.error} library="material" />
              <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 16, marginTop: 8 }}>Order Cancelled</Text>
            </View>
          )}

          {/* Items Section */}
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 }}>Items Ordered</Text>
          <View style={{ marginBottom: 24 }}>
            {order.items.map((item, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                marginBottom: 12,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.03)',
                shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 }
              }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 12, backgroundColor: '#F8F9FA',
                  justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6'
                }}>
                  <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/64' }}
                    style={{ width: 50, height: 50 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: Colors.textSecondary, backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' }}>
                      Qty: {item.quantity}
                    </Text>
                    <Text style={{ fontSize: 13, color: Colors.textTertiary, marginLeft: 8 }}>
                      x ₹{item.price}
                    </Text>
                  </View>
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textPrimary }}>
                    ₹{item.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Shipping & Payment Details */}
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 }}>Order Details</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 }}>

            {/* Address */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Icon name="location-pin" size={18} color={Colors.primary} library="entypo" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }}>Delivery Address</Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 18 }}>
                  <Text style={{ fontWeight: '600' }}>{order.shippingAddress?.fullName}</Text>{'\n'}
                  {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}{'\n'}
                  Phone: {order.shippingAddress?.phoneNumber}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 }} />

            {/* Payment */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Icon name="credit-card" size={18} color="#F57C00" library="material" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }}>Payment Method</Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }}>
                  {order.paymentMethod.toUpperCase()}
                  <Text style={{ color: Colors.success }}> (Status: Paid/Pending)</Text>
                </Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </Animated.View>
    </View>
  );
}
