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
  showCart?: boolean;
}

export function PageHeader({
  title,
  showBackButton = true,
  rightComponent,
  style,
  variant = 'primary',
  subtitle,
  showCart = false, // Default to false (only explicitly show if needed or rely on home header)
}: PageHeaderProps) {
  // Modern Clean Style (regardless of variant for now, to unify app)
  const isPrimary = variant === 'primary';
  // In this new "Modern" look, "Primary" means the main page header, but it's CLEAN, not colored.

  const statusBarHeight = Platform.OS === 'ios' ? 44 : 0;

  return (
    <View style={[{
      backgroundColor: '#FFFFFF', // Clean White
      paddingTop: statusBarHeight + 10, // Tighter top padding
      paddingBottom: 16, // Sleek bottom padding
      paddingHorizontal: 20, // Standard padding
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      // No elevation
    }, style]}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // Tighter gap
        minHeight: 80, // Standard height
      }}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 40, // Smaller button
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20, // Circular
              backgroundColor: Colors.gray100, // Subtle background
              // No border for cleaner look
            }}
          >
            <Icon
              name={Icons.back.name}
              size={24} // Standard icon size
              color={Colors.textPrimary}
              library={Icons.back.library}
            />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{
            fontSize: 22, // Professional Size (was 34)
            fontWeight: '700', // Bold but not heavy
            color: Colors.textPrimary,
            letterSpacing: -0.5,
            lineHeight: 28,
          }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: Colors.textSecondary,
              marginTop: 2,
              lineHeight: 18,
            }}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent ? (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 56,
          }}>
            {rightComponent}
          </View>
        ) : showCart ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              width: 52,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              // elevation removed
            }}
          >
            <Icon
              name="shopping-cart"
              size={26}
              color={Colors.textPrimary}
              library="material"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
