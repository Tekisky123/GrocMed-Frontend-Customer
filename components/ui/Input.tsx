import { Colors } from '@/constants/colors';
import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  return (
    <View style={{ width: '100%', marginBottom: 20 }}>
      {label && (
        <Text style={{
          fontSize: 15,
          fontWeight: '700',
          color: Colors.textPrimary,
          marginBottom: 10,
          letterSpacing: -0.2,
        }}>
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 10,
          }}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={{
            backgroundColor: Colors.gray50,
            borderWidth: error ? 1.5 : 1,
            borderColor: error ? Colors.error : Colors.gray200,
            borderRadius: 16,
            paddingHorizontal: leftIcon ? 52 : 18,
            paddingRight: rightIcon ? 52 : 18,
            paddingVertical: 16,
            fontSize: 16,
            color: Colors.textPrimary,
            fontWeight: '500',
            letterSpacing: 0.2,
            // elevation: 0, // Ensure no native shadow
          }}
          placeholderTextColor={Colors.textTertiary}
          {...props}
        />
        {rightIcon && (
          <View style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 10,
          }}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={{ color: Colors.error, fontSize: 13, marginTop: 8, fontWeight: '600' }}>
          {error}
        </Text>
      )}
    </View>
  );
}
