import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { Icon, Icons } from '@/components/ui/Icon';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors } from '@/constants/colors';

export default function OrderConfirmationScreen() {
  const { orderId, total } = useLocalSearchParams<{ orderId: string; total: string }>();
  const { clearCart } = useCart();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    clearCart();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Colors.success }}>
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          width: '100%',
          maxWidth: 420,
        }}
      >
        <GlassCard
          variant="elevated"
          style={{
            alignItems: 'center',
            backgroundColor: Colors.glassHeavy,
            padding: 0,
          }}
          padding={40}
        >
          <Animated.View style={{
            width: 120,
            height: 120,
            backgroundColor: Colors.success,
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            shadowColor: Colors.success,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
            transform: [{ scale: scaleAnim }],
          }}>
            <Icon name={Icons.checkCircle.name} size={64} color={Colors.textWhite} library={Icons.checkCircle.library} />
          </Animated.View>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: '800', 
            color: Colors.textPrimary, 
            marginBottom: 16, 
            textAlign: 'center',
            letterSpacing: -1,
          }}>
            Order Placed Successfully!
          </Text>
          <Text style={{ 
            fontSize: 17, 
            color: Colors.textSecondary, 
            marginBottom: 32, 
            textAlign: 'center',
            lineHeight: 26,
            fontWeight: '500',
          }}>
            Your order has been confirmed and will be delivered soon
          </Text>
          <GlassCard
            variant="elevated"
            style={{
              backgroundColor: Colors.gray50,
              borderColor: Colors.gray200,
              width: '100%',
              marginBottom: 28,
              padding: 0,
            }}
            padding={24}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 16, fontWeight: '600' }}>Order ID</Text>
              <Text style={{ color: Colors.textPrimary, fontWeight: '800', fontSize: 16, letterSpacing: -0.2 }}>
                {orderId}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 16, fontWeight: '600' }}>Total Amount</Text>
              <Text style={{ color: Colors.textPrimary, fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>
                ₹{total}
              </Text>
            </View>
          </GlassCard>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/orders')}
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 20,
              borderRadius: 18,
              width: '100%',
              alignItems: 'center',
              marginBottom: 14,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 10,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: Colors.textWhite, fontWeight: '800', fontSize: 18, letterSpacing: 1 }}>
              VIEW ORDERS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{
              backgroundColor: Colors.glassHeavy,
              paddingVertical: 20,
              borderRadius: 18,
              width: '100%',
              alignItems: 'center',
              borderWidth: 2.5,
              borderColor: Colors.primary,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: Colors.primary, fontWeight: '800', fontSize: 18, letterSpacing: 1 }}>
              CONTINUE SHOPPING
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>
    </View>
  );
}
