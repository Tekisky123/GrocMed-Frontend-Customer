import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Animated, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, sendOTP } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    // Mock registration - send OTP first
    const otpSuccess = await sendOTP(email);
    if (otpSuccess) {
      // For demo, auto-verify with mock OTP
      const success = await register(email, name, '123456');
      setLoading(false);
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Registration failed. Please try again.');
      }
    } else {
      setLoading(false);
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header Section */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <View style={{
                backgroundColor: Colors.primary,
                borderRadius: 20,
                padding: 16,
                marginBottom: 20,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <Icon name="person-add" size={40} color={Colors.textWhite} library="material" />
              </View>
              <Text style={{ 
                fontSize: 32, 
                fontWeight: '800', 
                color: Colors.primary,
                marginBottom: 12,
                letterSpacing: 1,
              }}>
                GrocMed
              </Text>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: Colors.textPrimary,
                marginBottom: 8,
                letterSpacing: -0.5,
              }}>
                Create Account
              </Text>
              <Text style={{ 
                fontSize: 15, 
                color: Colors.textSecondary,
                fontWeight: '400',
              }}>
                Join us and start shopping today
              </Text>
            </View>

            {/* Register Form Card */}
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 28,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
              borderWidth: 1,
              borderColor: Colors.border,
            }}>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '700', 
                color: Colors.textPrimary, 
                marginBottom: 8,
                letterSpacing: -0.4,
              }}>
                Create your account
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: Colors.textSecondary, 
                marginBottom: 28,
                fontWeight: '400',
                lineHeight: 20,
              }}>
                Enter your details to get started
              </Text>

              {/* Full Name Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: Colors.textPrimary,
                  marginBottom: 8,
                }}>
                  Full Name
                </Text>
                <View style={{
                  backgroundColor: Colors.muted,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <View style={{ marginRight: 12 }}>
                    <Icon name="person" size={20} color={Colors.textSecondary} library="material" />
                  </View>
                  <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor={Colors.textTertiary}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setError('');
                    }}
                    autoCapitalize="words"
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: Colors.textPrimary,
                      fontWeight: '400',
                    }}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: Colors.textPrimary,
                  marginBottom: 8,
                }}>
                  E-mail
                </Text>
                <View style={{
                  backgroundColor: Colors.muted,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <View style={{ marginRight: 12 }}>
                    <Icon name="email" size={20} color={Colors.textSecondary} library="material" />
                  </View>
                  <TextInput
                    placeholder="example@email.com"
                    placeholderTextColor={Colors.textTertiary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: Colors.textPrimary,
                      fontWeight: '400',
                    }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: Colors.textPrimary,
                  marginBottom: 8,
                }}>
                  Password
                </Text>
                <View style={{
                  backgroundColor: Colors.muted,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <View style={{ marginRight: 12 }}>
                    <Icon name="lock" size={20} color={Colors.textSecondary} library="material" />
                  </View>
                  <TextInput
                    placeholder="Your Password"
                    placeholderTextColor={Colors.textTertiary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    secureTextEntry={!showPassword}
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: Colors.textPrimary,
                      fontWeight: '400',
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    style={{ padding: 4 }}
                  >
                    <Icon 
                      name={showPassword ? 'visibility' : 'visibility-off'} 
                      size={20} 
                      color={Colors.textSecondary} 
                      library="material" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: Colors.textPrimary,
                  marginBottom: 8,
                }}>
                  Confirm Password
                </Text>
                <View style={{
                  backgroundColor: Colors.muted,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <View style={{ marginRight: 12 }}>
                    <Icon name="lock" size={20} color={Colors.textSecondary} library="material" />
                  </View>
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor={Colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setError('');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: Colors.textPrimary,
                      fontWeight: '400',
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                    style={{ padding: 4 }}
                  >
                    <Icon 
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                      size={20} 
                      color={Colors.textSecondary} 
                      library="material" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={{
                  backgroundColor: Colors.errorLight,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: Colors.error,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Icon name="error" size={18} color={Colors.error} library="material" />
                  <Text style={{ color: Colors.error, fontSize: 13, fontWeight: '500', flex: 1 }}>{error}</Text>
                </View>
              ) : null}

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: Colors.primary,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity: loading ? 0.7 : 1,
                  marginBottom: 24,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <Text style={{ 
                    color: Colors.textWhite, 
                    fontWeight: '600', 
                    fontSize: 16,
                  }}>
                    Register
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '400' }}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7}>
                  <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14 }}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
