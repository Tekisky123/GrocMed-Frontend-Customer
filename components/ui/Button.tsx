import { Colors } from '@/constants/colors';
import React from 'react';
import { ActivityIndicator, Animated, Dimensions, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

const { width } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 375;

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
      bounciness: 12,
      speed: 20
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
      speed: 20
    }).start();
  };

  const variantStyles = {
    primary: {
      backgroundColor: Colors.primary,
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
    sm: { paddingVertical: IS_SMALL_DEVICE ? 10 : 12, paddingHorizontal: IS_SMALL_DEVICE ? 14 : 20, fontSize: IS_SMALL_DEVICE ? 13 : 14 },
    md: { paddingVertical: IS_SMALL_DEVICE ? 14 : 16, paddingHorizontal: IS_SMALL_DEVICE ? 20 : 28, fontSize: IS_SMALL_DEVICE ? 15 : 16 },
    lg: { paddingVertical: IS_SMALL_DEVICE ? 16 : 20, paddingHorizontal: IS_SMALL_DEVICE ? 24 : 36, fontSize: IS_SMALL_DEVICE ? 16 : 18 },
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
          borderRadius: 5,
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
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={textColors[variant]} />
        ) : (
          <Text 
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{
              color: textColors[variant],
              fontWeight: '800',
              fontSize: sizeStyles[size].fontSize,
              letterSpacing: 0.5,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
