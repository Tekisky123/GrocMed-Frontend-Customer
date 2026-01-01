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
  const isPrimary = variant === 'primary';
  const statusBarHeight = Platform.OS === 'ios' ? 44 : 0;
  
  return (
    <View style={[{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: isPrimary ? Colors.primary : Colors.textWhite,
      paddingTop: statusBarHeight + 16,
      paddingBottom: 22,
      paddingHorizontal: 20,
      borderBottomLeftRadius: isPrimary ? 28 : 0,
      borderBottomRightRadius: isPrimary ? 28 : 0,
      borderBottomWidth: isPrimary ? 0 : 1,
      borderBottomColor: Colors.gray200,
      shadowColor: isPrimary ? Colors.primary : Colors.shadow,
      shadowOffset: { width: 0, height: isPrimary ? 6 : 2 },
      shadowOpacity: isPrimary ? 0.3 : 0.1,
      shadowRadius: isPrimary ? 16 : 6,
      elevation: isPrimary ? 12 : 4,
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
              backgroundColor: isPrimary ? 'rgba(255, 255, 255, 0.25)' : Colors.gray100,
              borderRadius: 12,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: isPrimary ? 1.5 : 0,
              borderColor: isPrimary ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
              shadowColor: isPrimary ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isPrimary ? 0.2 : 0,
              shadowRadius: 6,
              elevation: isPrimary ? 3 : 0,
            }}
          >
            <Icon 
              name={Icons.back.name} 
              size={24} 
              color={isPrimary ? Colors.textWhite : Colors.textPrimary} 
              library={Icons.back.library} 
            />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ 
            fontSize: 26, 
            fontWeight: '800', 
            color: isPrimary ? Colors.textWhite : Colors.textPrimary,
            letterSpacing: -0.5,
            lineHeight: 32,
          }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: isPrimary ? 'rgba(255, 255, 255, 0.9)' : Colors.textSecondary,
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
