import React from 'react';
import { View, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  className?: string;
  padding?: number;
  variant?: 'default' | 'elevated' | 'subtle';
}

export function GlassCard({
  children,
  intensity = 20,
  tint = 'light',
  className = '',
  padding = 20,
  variant = 'default',
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      shadowOpacity: 0.12,
      shadowRadius: 24,
      // elevation: 12,
    },
    elevated: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.6)',
      shadowOpacity: 0.15,
      shadowRadius: 32,
      // elevation: 16,
    },
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      // elevation: 8,
    },
  };

  const style = variantStyles[variant];

  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: 24,
        backgroundColor: style.backgroundColor,
        borderWidth: 1.5,
        borderColor: style.borderColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: style.shadowOpacity,
        shadowRadius: style.shadowRadius,
        // elevation: style.elevation,
        ...(props.style as object),
      }}
      {...props}
    >
      <View style={{ padding }}>{children}</View>
    </View>
  );
}
