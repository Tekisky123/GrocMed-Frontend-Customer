import { Colors } from '@/constants/colors';
import React from 'react';
import { ActivityIndicator, Animated, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const variantStyles = {
    primary: {
      backgroundColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      // elevation: 10,
    },
    secondary: {
      backgroundColor: Colors.gray100,
      borderWidth: 1.5,
      borderColor: Colors.gray200,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      borderColor: Colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const sizeStyles = {
    sm: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 14 },
    md: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16 },
    lg: { paddingVertical: 20, paddingHorizontal: 36, fontSize: 18 },
  };

  const textColors = {
    primary: Colors.textWhite,
    secondary: Colors.textPrimary,
    outline: Colors.primary,
    ghost: Colors.primary,
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: fullWidth ? '100%' : undefined }}>
      <TouchableOpacity
        style={{
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          ...variantStyles[variant],
          ...sizeStyles[size],
          width: fullWidth ? '100%' : undefined,
          opacity: disabled || loading ? 0.6 : 1,
        }}
        disabled={disabled || loading}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={textColors[variant]} />
        ) : (
          <Text style={{
            color: textColors[variant],
            fontWeight: '800',
            fontSize: sizeStyles[size].fontSize,
            letterSpacing: 0.8,
          }}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
