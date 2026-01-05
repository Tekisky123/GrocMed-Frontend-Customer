import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/ui/Icon';
import { Order, OrderStatus } from '@/types';

// Mock Orders Data
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    userId: 'u1',
    items: [],
    subtotal: 1250,
    deliveryFee: 50,
    discount: 100,
    total: 1200,
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    address: {
      id: 'a1',
      type: 'home',
      name: 'John Doe',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    },
    placedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    userId: 'u2',
    items: [],
    subtotal: 850,
    deliveryFee: 50,
    discount: 0,
    total: 900,
    status: 'confirmed',
    paymentMethod: 'upi',
    paymentStatus: 'completed',
    address: {
      id: 'a2',
      type: 'work',
      name: 'Jane Smith',
      phone: '+91 9876543211',
      addressLine1: '456 Business Park',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      isDefault: false,
    },
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    userId: 'u3',
    items: [],
    subtotal: 2100,
    deliveryFee: 50,
    discount: 200,
    total: 1950,
    status: 'processing',
    paymentMethod: 'card',
    paymentStatus: 'completed',
    address: {
      id: 'a3',
      type: 'home',
      name: 'Bob Johnson',
      phone: '+91 9876543212',
      addressLine1: '789 Residential Area',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      isDefault: true,
    },
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    userId: 'u4',
    items: [],
    subtotal: 450,
    deliveryFee: 50,
    discount: 0,
    total: 500,
    status: 'shipped',
    paymentMethod: 'upi',
    paymentStatus: 'completed',
    address: {
      id: 'a4',
      type: 'home',
      name: 'Alice Brown',
      phone: '+91 9876543213',
      addressLine1: '321 Street Name',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      isDefault: true,
    },
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    userId: 'u5',
    items: [],
    subtotal: 1800,
    deliveryFee: 50,
    discount: 150,
    total: 1700,
    status: 'delivered',
    paymentMethod: 'cod',
    paymentStatus: 'completed',
    address: {
      id: 'a5',
      type: 'home',
      name: 'Charlie Wilson',
      phone: '+91 9876543214',
      addressLine1: '654 Avenue Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      isDefault: true,
    },
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const statusColors: Record<OrderStatus, string> = {
  pending: Colors.warning,
  confirmed: Colors.info,
  processing: Colors.accent,
  packed: Colors.info,
  shipped: Colors.accent,
  out_for_delivery: Colors.primary,
  delivered: Colors.success,
  cancelled: Colors.error,
  refunded: Colors.textSecondary,
};

export default function OrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const statuses: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const filteredOrders = selectedStatus === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(order => order.status === selectedStatus);

  const stats = [
    { label: 'Total Orders', value: MOCK_ORDERS.length.toString(), icon: 'shopping-cart', color: Colors.primary },
    { label: 'Pending', value: MOCK_ORDERS.filter(o => o.status === 'pending').length.toString(), icon: 'schedule', color: Colors.warning },
    { label: 'Processing', value: MOCK_ORDERS.filter(o => o.status === 'processing' || o.status === 'confirmed').length.toString(), icon: 'sync', color: Colors.accent },
    { label: 'Delivered', value: MOCK_ORDERS.filter(o => o.status === 'delivered').length.toString(), icon: 'check-circle', color: Colors.success },
  ];

  const getStatusIcon = (status: OrderStatus) => {
    const icons: Record<OrderStatus, string> = {
      pending: 'schedule',
      confirmed: 'check-circle',
      processing: 'sync',
      packed: 'inventory',
      shipped: 'local-shipping',
      out_for_delivery: 'delivery-dining',
      delivered: 'check-circle',
      cancelled: 'cancel',
      refunded: 'refresh',
    };
    return icons[status];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Orders</Text>
            <Text style={styles.headerSubtitle}>Manage and track all orders</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}10` }]}>
                <Icon name={stat.icon} size={20} color={stat.color} library="material" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusContainer}
          contentContainerStyle={styles.statusContent}
        >
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusChip,
                selectedStatus === status ? styles.statusChipActive : null,
                selectedStatus === status && status !== 'all' ? { backgroundColor: `${statusColors[status]}15`, borderColor: statusColors[status] } : null,
              ]}
              onPress={() => setSelectedStatus(status)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.statusChipText,
                  selectedStatus === status ? styles.statusChipTextActive : null,
                  selectedStatus === status && status !== 'all' ? { color: statusColors[status] } : null,
                ]}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Orders List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.ordersContainer}>
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="shopping-cart" size={64} color={Colors.textTertiary} library="material" />
                <Text style={styles.emptyText}>No orders found</Text>
              </View>
            ) : (
              filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <View style={styles.orderDateContainer}>
                        <Icon name="calendar-today" size={12} color={Colors.textTertiary} library="material" />
                        <Text style={styles.orderDate}>
                          {new Date(order.placedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColors[order.status]}15` }]}>
                      <Icon name={getStatusIcon(order.status)} size={14} color={statusColors[order.status]} library="material" />
                      <Text style={[styles.statusText, { color: statusColors[order.status] }]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.orderDetails}>
                    <View style={styles.orderDetailRow}>
                      <Icon name="person" size={16} color={Colors.textSecondary} library="material" />
                      <Text style={styles.orderDetailText}>{order.address.name}</Text>
                    </View>
                    <View style={styles.orderDetailRow}>
                      <Icon name="phone" size={16} color={Colors.textSecondary} library="material" />
                      <Text style={styles.orderDetailText}>{order.address.phone}</Text>
                    </View>
                    <View style={styles.orderDetailRow}>
                      <Icon name="location-on" size={16} color={Colors.textSecondary} library="material" />
                      <Text style={styles.orderDetailText} numberOfLines={1}>
                        {order.address.addressLine1}, {order.address.city}, {order.address.pincode}
                      </Text>
                    </View>
                    <View style={styles.orderDetailRow}>
                      <Icon name="payment" size={16} color={Colors.textSecondary} library="material" />
                      <Text style={styles.orderDetailText}>
                        {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.orderTotalLabel}>Total Amount</Text>
                      <Text style={styles.orderTotal}>₹{order.total.toLocaleString()}</Text>
                    </View>
                    <View style={styles.orderActions}>
                      <TouchableOpacity style={styles.viewButton} activeOpacity={0.7}>
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                      {order.status === 'pending' && (
                        <TouchableOpacity style={styles.updateButton} activeOpacity={0.7}>
                          <Text style={styles.updateButtonText}>Update</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 70,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statusContainer: {
    marginBottom: 12,
    maxHeight: 50,
  },
  statusContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  statusChipActive: {
    borderWidth: 2,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusChipTextActive: {
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  ordersContainer: {
    padding: 20,
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  orderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  orderDetails: {
    gap: 10,
    marginBottom: 14,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  orderTotalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  updateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
});
