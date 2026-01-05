import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SECTION_PADDING = 20;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auth Guard
  React.useEffect(() => {
    if (!user) { // Assuming user is null if not authenticated
      router.replace('/auth/login');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const menuItems = [
    { icon: Icons.profile, title: 'Edit Profile', route: '/profile/edit', color: Colors.primary },
    { icon: Icons.notification, title: 'Notifications', route: '/notifications', color: Colors.accent },
    { icon: Icons.support, title: 'Customer Support', route: '/support', color: Colors.accent },
    { icon: { name: 'description', library: 'material' as const }, title: 'Terms & Conditions', route: '/terms', color: Colors.primary },
    { icon: { name: 'lock', library: 'material' as const }, title: 'Privacy Policy', route: '/privacy', color: Colors.gray600 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={{
            backgroundColor: Colors.primary,
            paddingTop: 50,
            paddingBottom: 32,
            paddingHorizontal: SECTION_PADDING,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            // elevation: 4,
          }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: Colors.textWhite,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Icon name={Icons.profile.name} size={50} color={Colors.primary} library={Icons.profile.library} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.textWhite, marginBottom: 6 }}>
                {user?.name || 'Guest User'}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 15, marginBottom: 12, fontWeight: '400' }}>
                {user?.phone || user?.email || 'Not logged in'}
              </Text>
              {user?.isVerified && (
                <View style={{
                  backgroundColor: Colors.accent,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Icon name={Icons.checkCircle.name} size={14} color={Colors.textWhite} library={Icons.checkCircle.library} />
                  <Text style={{ color: Colors.textWhite, fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
                    Verified
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Modern Menu Items */}
        <Animated.View style={{ paddingTop: 20, paddingHorizontal: SECTION_PADDING, opacity: fadeAnim }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
              style={{ marginBottom: 12 }}
            >
              <View style={{
                backgroundColor: Colors.textWhite,
                borderRadius: 8,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.gray200,
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                // elevation: 1,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${item.color}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Icon name={item.icon.name} size={20} color={item.color} library={item.icon.library} />
                </View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: Colors.textPrimary,
                  flex: 1,
                }}>
                  {item.title}
                </Text>
                <Icon name={Icons.arrowForward.name} size={20} color={Colors.textTertiary} library={Icons.arrowForward.library} />
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Modern Logout */}
        <Animated.View style={{ padding: SECTION_PADDING, paddingTop: 24, opacity: fadeAnim }}>
          <TouchableOpacity
            onPress={() => {
              logout();
              router.replace('/auth/login');
            }}
            activeOpacity={0.8}
          >
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 8,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.error,
            }}>
              <Text style={{ color: Colors.error, fontWeight: '600', fontSize: 15, textAlign: 'center' }}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
