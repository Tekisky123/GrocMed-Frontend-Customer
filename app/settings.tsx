import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Animated } from 'react-native';
import { router } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';

const CARD_PADDING = 20;
const SECTION_PADDING = 20;

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
      <PageHeader title="Settings" variant="primary" />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Modern Notifications Section */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 24, opacity: fadeAnim }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
              Notifications
            </Text>
          </View>
          <View style={{
            backgroundColor: Colors.textWhite,
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.gray200,
            shadowColor: Colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>
                  Push Notifications
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '400' }}>
                  Receive push notifications
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.textWhite}
              />
            </View>
          </View>

          <View style={{
            backgroundColor: Colors.textWhite,
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.gray200,
            shadowColor: Colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>
                  Email Updates
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '400' }}>
                  Receive email updates
                </Text>
              </View>
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.textWhite}
              />
            </View>
          </View>
        </Animated.View>

        {/* Appearance Section - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 24, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Appearance
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.accent,
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
            padding={20}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6, letterSpacing: -0.2 }}>
                  Dark Mode
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '500' }}>
                  Enable dark mode
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.gray300, true: Colors.accent }}
                thumbColor={Colors.textWhite}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Account Section - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 24, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Account
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.warning,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </View>
          <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: 14 }}>
            <GlassCard
              variant="elevated"
              style={{
                backgroundColor: Colors.glassHeavy,
                padding: 0,
              }}
              padding={20}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 }}>
                  Change Password
                </Text>
                <Icon name={Icons.arrowForward.name} size={24} color={Colors.textTertiary} library={Icons.arrowForward.library} />
              </View>
            </GlassCard>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}>
            <GlassCard
              variant="elevated"
              style={{
                backgroundColor: Colors.glassHeavy,
                borderColor: `${Colors.error}30`,
                borderWidth: 2,
                padding: 0,
              }}
              padding={20}
            >
              <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.error, letterSpacing: -0.2, textAlign: 'center' }}>
                Delete Account
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </Animated.View>

        {/* About Section - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 32, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              About
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.textSecondary,
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
            padding={20}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.2 }}>
              App Version
            </Text>
            <Text style={{ fontSize: 15, color: Colors.textSecondary, fontWeight: '600' }}>1.0.0</Text>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
