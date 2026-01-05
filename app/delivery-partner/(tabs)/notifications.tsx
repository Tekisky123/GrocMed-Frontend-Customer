import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/ui/Icon';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'user';
  sentAt: string;
  recipients: number;
  status: 'sent' | 'scheduled' | 'draft';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Order Received',
    message: 'You have received a new order #ORD-2024-001',
    type: 'order',
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    recipients: 1,
    status: 'sent',
  },
  {
    id: '2',
    title: 'Flash Sale Alert',
    message: '50% off on all groceries! Limited time offer.',
    type: 'promotion',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    recipients: 5000,
    status: 'sent',
  },
  {
    id: '3',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday 2 AM - 4 AM',
    type: 'system',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    recipients: 10000,
    status: 'sent',
  },
  {
    id: '4',
    title: 'Welcome New Users',
    message: 'Welcome to GrocMed! Get 20% off on your first order.',
    type: 'user',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    recipients: 250,
    status: 'sent',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'promotion' as Notification['type'],
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const stats = [
    { label: 'Total Sent', value: notifications.filter(n => n.status === 'sent').length.toString(), icon: 'send', color: Colors.primary },
    { label: 'Scheduled', value: notifications.filter(n => n.status === 'scheduled').length.toString(), icon: 'schedule', color: Colors.warning },
    { label: 'Drafts', value: notifications.filter(n => n.status === 'draft').length.toString(), icon: 'drafts', color: Colors.textSecondary },
    { label: 'Recipients', value: notifications.reduce((sum, n) => sum + n.recipients, 0).toLocaleString(), icon: 'people', color: Colors.accent },
  ];

  const getTypeIcon = (type: Notification['type']) => {
    const icons = {
      order: 'shopping-cart',
      promotion: 'local-offer',
      system: 'settings',
      user: 'person',
    };
    return icons[type];
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      order: Colors.primary,
      promotion: Colors.warning,
      system: Colors.accent,
      user: Colors.success,
    };
    return colors[type];
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      sentAt: new Date().toISOString(),
      recipients: 1000,
      status: 'sent',
    };

    setNotifications([notification, ...notifications]);
    setNewNotification({ title: '', message: '', type: 'promotion' });
    setShowCreateForm(false);
    Alert.alert('Success', 'Notification sent successfully');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Push Notifications</Text>
            <Text style={styles.headerSubtitle}>Manage notifications</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateForm(!showCreateForm)}
            activeOpacity={0.8}
          >
            <Icon name={showCreateForm ? "close" : "add"} size={22} color={Colors.textWhite} library="material" />
          </TouchableOpacity>
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

        {/* Create Notification Form */}
        {showCreateForm && (
          <View style={styles.createForm}>
            <Text style={styles.formTitle}>Create New Notification</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter notification title"
                placeholderTextColor={Colors.textTertiary}
                value={newNotification.title}
                onChangeText={(text) => setNewNotification({ ...newNotification, title: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter notification message"
                placeholderTextColor={Colors.textTertiary}
                value={newNotification.message}
                onChangeText={(text) => setNewNotification({ ...newNotification, message: text })}
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeSelector}>
                {(['promotion', 'order', 'system', 'user'] as Notification['type'][]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      newNotification.type === type && styles.typeOptionActive,
                      newNotification.type === type && { borderColor: getTypeColor(type) },
                    ]}
                    onPress={() => setNewNotification({ ...newNotification, type })}
                    activeOpacity={0.7}
                  >
                    <Icon name={getTypeIcon(type)} size={16} color={newNotification.type === type ? getTypeColor(type) : Colors.textSecondary} library="material" />
                    <Text style={[
                      styles.typeOptionText,
                      newNotification.type === type && { color: getTypeColor(type) },
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendNotification}
              activeOpacity={0.8}
            >
              <Icon name="send" size={18} color={Colors.textWhite} library="material" />
              <Text style={styles.sendButtonText}>Send Notification</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <View style={[styles.typeIconContainer, { backgroundColor: `${getTypeColor(notification.type)}10` }]}>
                    <Icon name={getTypeIcon(notification.type)} size={20} color={getTypeColor(notification.type)} library="material" />
                  </View>
                  <View style={styles.notificationHeaderText}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.sentAt).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${Colors.success}15` }]}>
                    <Text style={[styles.statusText, { color: Colors.success }]}>
                      {notification.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <View style={styles.notificationFooter}>
                  <View style={styles.recipientsContainer}>
                    <Icon name="people" size={14} color={Colors.textSecondary} library="material" />
                    <Text style={styles.recipientsText}>{notification.recipients.toLocaleString()} recipients</Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton} activeOpacity={0.7}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  createForm: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
  },
  typeOptionActive: {
    backgroundColor: Colors.surface,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  scrollView: {
    flex: 1,
  },
  notificationsContainer: {
    padding: 20,
    gap: 12,
  },
  notificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationHeaderText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  recipientsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipientsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
