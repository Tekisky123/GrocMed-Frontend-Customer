import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { login: adminLogin } = useAdmin();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (userType === 'admin') {
        // Admin login using API
        await adminLogin(email, password);
        router.replace('/admin/dashboard');
      } else {
        // User login (existing mock logic)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        if (password === '123456' || password.length >= 6) {
          const success = await login(email, '123456'); // Mock OTP for compatibility
          if (success) {
            router.replace('/(tabs)');
          } else {
            setError('Invalid credentials. Please try again.');
          }
        } else {
          setError('Invalid credentials. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
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
                <Icon name="shopping-cart" size={40} color={Colors.textWhite} library="material" />
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
                Welcome Back
              </Text>
              <Text style={{ 
                fontSize: 15, 
                color: Colors.textSecondary,
                fontWeight: '400',
              }}>
                Sign in to continue shopping
              </Text>
            </View>

            {/* User Type Toggle */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: Colors.surface,
              borderRadius: 12,
              padding: 4,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <TouchableOpacity
                onPress={() => setUserType('user')}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: userType === 'user' ? Colors.primary : 'transparent',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: userType === 'user' ? Colors.textWhite : Colors.textSecondary,
                }}>
                  User Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUserType('admin')}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: userType === 'admin' ? Colors.accent : 'transparent',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: userType === 'admin' ? Colors.textWhite : Colors.textSecondary,
                }}>
                  Admin Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Form Card */}
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
                Login to your account
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: Colors.textSecondary, 
                marginBottom: 28,
                fontWeight: '400',
                lineHeight: 20,
              }}>
                Hello, welcome back to your account
              </Text>

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
                  backgroundColor: Colors.gray100,
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
                  backgroundColor: Colors.gray100,
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

              {/* Remember Me & Forgot Password */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: rememberMe ? Colors.primary : Colors.border,
                    backgroundColor: rememberMe ? Colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}>
                    {rememberMe && (
                      <Icon name="check" size={14} color={Colors.textWhite} library="material" />
                    )}
                  </View>
                  <Text style={{ 
                    fontSize: 14, 
                    color: Colors.textSecondary,
                    fontWeight: '400',
                  }}>
                    Remember me
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: Colors.primary,
                    fontWeight: '600',
                  }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
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
                    Login
                  </Text>
                )}
              </TouchableOpacity>

              {/* Register Link - Only show for user login */}
              {userType === 'user' && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '400' }}>
                    Don&apos;t have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/auth/register')} activeOpacity={0.7}>
                    <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14 }}>
                      Register
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
