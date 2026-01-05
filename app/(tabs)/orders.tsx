import { orderApi } from '@/api/orderApi';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Image, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusColors: Record<string, { bg: string; text: string }> = {
  placed: { bg: '#E3F2FD', text: '#1976D2' },
  pending: { bg: '#FFF3E0', text: '#F57C00' },
  confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  processing: { bg: '#E3F2FD', text: '#1565C0' },
  packed: { bg: '#F3E5F5', text: '#7B1FA2' },
  shipped: { bg: '#E0F7FA', text: '#006064' },
  out_for_delivery: { bg: '#FFF8E1', text: '#FF6F00' },
  delivered: { bg: '#E8F5E9', text: '#1B5E20' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
  refunded: { bg: '#FAFAFA', text: '#757575' },
};

const getStatusStyle = (status: string) => {
  const normalized = status?.toLowerCase() || 'pending';
  return statusColors[normalized] || statusColors.pending;
};

export default function OrdersScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getMyOrders();
      if (res.success && Array.isArray(res.data)) {
        // Normalize data
        const mappedOrders = res.data.map((o: any) => ({
          id: o._id || o.id,
          orderNumber: o.orderId || o._id?.slice(-6).toUpperCase() || 'UNKNOWN',
          items: (o.items || []).map((i: any) => ({
            id: i._id,
            name: i.name || i.product?.name || 'Product',
            image: i.image || i.product?.image,
            quantity: i.quantity,
            price: i.price,
          })),
          status: o.orderStatus || o.status || 'Placed',
          total: o.totalAmount || 0,
          placedAt: o.createdAt,
          shippingAddress: o.shippingAddress,
        }));
        setOrders(mappedOrders.reverse());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: Colors.background,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.05)'
        }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.textPrimary }}>
            My Orders
          </Text>
        </View>

        {!loading && orders.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 }}>
            <View style={{
              width: 120,
              height: 120,
              backgroundColor: '#F3F4F6',
              borderRadius: 60,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24
            }}>
              <Icon name="shopping-bag" size={56} color={Colors.gray300} library="material" />
            </View>
            <Text style={{ fontSize: 20, color: Colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>No orders yet</Text>
            <Text style={{ fontSize: 14, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: 40, marginBottom: 32 }}>
              It looks like you haven't placed any orders yet. Start shopping to see them here!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/')}
              style={{
                paddingHorizontal: 32,
                paddingVertical: 16,
                backgroundColor: Colors.primary,
                borderRadius: 16,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <Animated.View style={{ opacity: fadeAnim, marginBottom: 16 }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push({ pathname: '/orders/[id]', params: { id: item.id } })}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 20,
                      padding: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* ID & Date */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <View>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginBottom: 4 }}>
                          ORDER #{item.orderNumber}
                        </Text>
                        <Text style={{ fontSize: 12, color: Colors.textTertiary, fontWeight: '500' }}>
                          {new Date(item.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(item.placedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: statusStyle.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: statusStyle.text, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 }} />

                    {/* Images Horizontal Scroll Preview */}
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                      {item.items.slice(0, 4).map((p: any, idx: number) => (
                        <View key={idx} style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          backgroundColor: '#F8F9FA',
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: '#F3F4F6',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          {p.image ? (
                            <Image
                              source={{ uri: p.image }}
                              style={{ width: 44, height: 44 }}
                              resizeMode="contain"
                            />
                          ) : (
                            <Icon name="image" size={20} color={Colors.gray300} library="material" />
                          )}
                        </View>
                      ))}
                      {item.items.length > 4 && (
                        <View style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          backgroundColor: '#F3F4F6',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary }}>+{item.items.length - 4}</Text>
                        </View>
                      )}
                    </View>

                    {/* Footer - Total & Action */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontSize: 12, color: Colors.textTertiary, marginBottom: 2 }}>Total Amount</Text>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>₹{item.total}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '700', marginRight: 4 }}>View Details</Text>
                        <Icon name="chevron-right" size={20} color={Colors.primary} library="material" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
