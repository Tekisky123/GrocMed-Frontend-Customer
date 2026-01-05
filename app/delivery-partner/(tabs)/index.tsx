import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import React, { useRef } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliveryPartnerDashboard() {
  const { partner, logout } = useDeliveryPartner();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // Dashboard stats
  const stats = [
    {
      label: 'Deliveries',
      value: '124',
      change: '+12.5%',
      icon: 'local-shipping',
      color: Colors.primary,
      bgColor: `${Colors.primary}10`
    },
    {
      label: 'Earnings',
      value: '₹4,560',
      change: '+8.2%',
      icon: 'attach-money',
      color: Colors.success,
      bgColor: `${Colors.success}10`
    },
    {
      label: 'Rating',
      value: '4.8',
      change: '+0.3',
      icon: 'star',
      color: Colors.accent,
      bgColor: `${Colors.accent}10`
    },
    {
      label: 'Pending',
      value: '3',
      change: '-2',
      icon: 'schedule',
      color: Colors.warning,
      bgColor: `${Colors.warning}10`
    },
  ];

  const recentActivities = [
    { id: '1', title: 'Order #1234 Delivered', time: '2 mins ago', type: 'order', icon: 'check-circle', color: Colors.success },
    { id: '2', title: 'New Delivery Assigned', time: '15 mins ago', type: 'order', icon: 'local-shipping', color: Colors.primary },
    { id: '3', title: 'Cash Collected', time: '1 hour ago', type: 'payment', icon: 'payments', color: Colors.success },
    { id: '4', title: 'Route Updated', time: '2 hours ago', type: 'system', icon: 'map', color: Colors.accent },
  ];

  const quickActions = [
    { id: '1', label: 'Active Orders', icon: 'list-alt', color: Colors.primary },
    { id: '2', label: 'Earnings', icon: 'account-balance-wallet', color: Colors.success },
    { id: '3', label: 'Route Map', icon: 'map', color: Colors.accent },
    { id: '4', label: 'Support', icon: 'headset-mic', color: Colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Professional Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {partner?.name?.charAt(0).toUpperCase() || 'P'}
                  </Text>
                </View>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back</Text>
                <Text style={styles.name}>{partner?.name || 'Partner'}</Text>
                <View style={styles.roleContainer}>
                  <Icon name="verified" size={12} color={Colors.primary} library="material" />
                  <Text style={styles.role}>DELIVERY PARTNER</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Icon name="logout" size={20} color={Colors.error} library="material" />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                    <Icon name={stat.icon} size={22} color={stat.color} library="material" />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <View style={styles.statChange}>
                      <Icon name="trending-up" size={12} color={Colors.success} library="material" />
                      <Text style={styles.statChangeText}>{stat.change}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Activities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activitiesContainer}>
              {recentActivities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={[styles.activityIconContainer, { backgroundColor: `${activity.color}10` }]}>
                    <Icon name={activity.icon} size={18} color={activity.color} library="material" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <Icon name="chevron-right" size={18} color={Colors.textTertiary} library="material" />
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}10` }]}>
                    <Icon name={action.icon} size={24} color={action.color} library="material" />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  role: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.error}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statChangeText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
  },
  activitiesContainer: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 8,
  },
});
