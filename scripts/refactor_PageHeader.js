const fs = require('fs');

const code = `import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  showCart = false, 
}: PageHeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className="bg-white px-5 pb-4 border-b border-gray-100"
      style={[{ paddingTop: Math.max(insets.top + 10, Platform.OS === 'ios' ? 54 : 34) }, style]}
    >
      <View className="flex-row items-center min-h-[60px] gap-3">
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
          >
            <Icon
              name={Icons.back.name}
              size={24}
              color={Colors.textPrimary}
              library={Icons.back.library}
            />
          </TouchableOpacity>
        )}
        <View className="flex-1 justify-center">
          <Text className="text-2xl font-bold text-gray-900 tracking-tight leading-7">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm font-medium text-gray-500 mt-0.5 leading-tight">
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent ? (
          <View className="items-center justify-center min-h-[40px]">
            {rightComponent}
          </View>
        ) : showCart ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            className="w-12 h-12 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200"
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
`;

fs.writeFileSync('/Users/umairuddin/Desktop/GrocMed/GrocMed-Frontend-Customer/components/ui/PageHeader.tsx', code);
