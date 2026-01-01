import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/ui/Icon';
import { useAdmin } from '@/contexts/AdminContext';

export default function SettingsScreen() {
  const { admin, logout } = useAdmin();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Account information</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{admin?.name || 'Admin'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{admin?.role?.toUpperCase() || 'ADMIN'}</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              <View style={[styles.settingItem, styles.settingItemLast]}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Icon name="person" size={20} color={Colors.primary} library="material" />
                  </View>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Name</Text>
                    <Text style={styles.settingValue}>{admin?.name || 'Admin'}</Text>
                  </View>
                </View>
                <Icon name="lock" size={18} color={Colors.textTertiary} library="material" />
              </View>
              <View style={[styles.settingItem, styles.settingItemLast]}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Icon name="email" size={20} color={Colors.primary} library="material" />
                  </View>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Email</Text>
                    <Text style={styles.settingValue}>{admin?.email || 'admin@example.com'}</Text>
                  </View>
                </View>
                <Icon name="lock" size={18} color={Colors.textTertiary} library="material" />
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.sectionContent}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => Alert.alert('App Version', 'GrocMed Admin v1.0.0')}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Icon name="info" size={20} color={Colors.primary} library="material" />
                  </View>
                  <Text style={styles.settingLabel}>App Version</Text>
                </View>
                <View style={styles.settingItemRight}>
                  <Text style={styles.settingValue}>1.0.0</Text>
                  <Icon name="chevron-right" size={20} color={Colors.textTertiary} library="material" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => Alert.alert('Help & Support', 'Contact support@grocmed.com')}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Icon name="help" size={20} color={Colors.primary} library="material" />
                  </View>
                  <Text style={styles.settingLabel}>Help & Support</Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.textTertiary} library="material" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon')}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Icon name="privacy-tip" size={20} color={Colors.primary} library="material" />
                  </View>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.textTertiary} library="material" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.settingItem, styles.settingItemLast]}
                onPress={() => Alert.alert('Terms of Service', 'Terms of service coming soon')}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Icon name="description" size={20} color={Colors.primary} library="material" />
                  </View>
                  <Text style={styles.settingLabel}>Terms of Service</Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.textTertiary} library="material" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Icon name="logout" size={20} color={Colors.error} library="material" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

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
  profileCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  bottomSpacing: {
    height: 20,
  },
});
