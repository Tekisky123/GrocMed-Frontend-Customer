import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Icon, Icons } from './Icon';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary';
  subtitle?: string;
}

export function PageHeader({
  title,
  showBackButton = true,
  rightComponent,
  style,
  variant = 'primary',
  subtitle,
}: PageHeaderProps) {
  // Modern Clean Style (regardless of variant for now, to unify app)
  const isPrimary = variant === 'primary';
  // In this new "Modern" look, "Primary" means the main page header, but it's CLEAN, not colored.

  const statusBarHeight = Platform.OS === 'ios' ? 44 : 0;

  return (
    <View style={[{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: Colors.background, // Clean background
      paddingTop: statusBarHeight + 16,
      paddingBottom: 22,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 4,
    }, style]}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 48,
      }}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 12,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Icon
              name={Icons.back.name}
              size={24}
              color={Colors.textPrimary}
              library={Icons.back.library}
            />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{
            fontSize: 28, // Slightly larger for modern feel
            fontWeight: '800',
            color: Colors.textPrimary, // Dark text
            letterSpacing: -0.5,
            lineHeight: 34,
          }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: Colors.textSecondary,
              marginTop: 4,
              lineHeight: 20,
            }}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent && (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
          }}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
}
