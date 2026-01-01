import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Icon, Icons } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { MOCK_USER, MOCK_COUPONS } from '@/constants/mockData';
import { PaymentMethod } from '@/types';
import { Colors } from '@/constants/colors';

const SECTION_PADDING = 20;

export default function CheckoutScreen() {
  const { cart, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleApplyCoupon = () => {
    if (couponCode) {
      const success = applyCoupon(couponCode);
      if (success) {
        setShowCouponInput(false);
        setCouponCode('');
      }
    }
  };

  const handlePlaceOrder = () => {
    router.replace({
      pathname: '/orders/confirmation',
      params: {
        orderId: `ORD-${Date.now()}`,
        total: cart.total.toString(),
      },
    });
  };

  const headerHeight = Platform.OS === 'ios' ? 120 : 100;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="Checkout" variant="primary" />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        {/* Modern Delivery Address */}
        <Animated.View style={{ padding: SECTION_PADDING, opacity: fadeAnim }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }}>
              Delivery Address
            </Text>
          </View>
          {user?.addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              onPress={() => setSelectedAddress(address.id)}
              style={{ marginBottom: 12 }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  backgroundColor: Colors.textWhite,
                  borderRadius: 8,
                  padding: 16,
                  borderWidth: selectedAddress === address.id ? 2 : 1,
                  borderColor: selectedAddress === address.id ? Colors.primary : Colors.gray200,
                  shadowColor: Colors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginRight: 8 }}>
                        {address.name}
                      </Text>
                      {selectedAddress === address.id && (
                        <View style={{
                          backgroundColor: Colors.primary,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                        }}>
                          <Text style={{ color: Colors.textWhite, fontSize: 10, fontWeight: '700' }}>
                            Selected
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 4, lineHeight: 20, fontWeight: '400' }}>
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </Text>
                    <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 4, fontWeight: '400' }}>
                      {address.city}, {address.state} - {address.pincode}
                    </Text>
                    <Text style={{ fontSize: 13, color: Colors.textTertiary, fontWeight: '400' }}>
                      Phone: {address.phone}
                    </Text>
                  </View>
                  {selectedAddress === address.id && (
                    <View style={{
                      backgroundColor: Colors.primary,
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 12,
                    }}>
                      <Icon name={Icons.check.name} size={16} color={Colors.textWhite} library={Icons.check.library} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => router.push('/profile/addresses')}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 8,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.primary,
              borderStyle: 'dashed',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={Icons.add.name} size={18} color={Colors.primary} library={Icons.add.library} />
              <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                Add New Address
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Modern Order Summary */}
        <Animated.View style={{ padding: SECTION_PADDING, paddingTop: 0, opacity: fadeAnim }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
              Order Summary
            </Text>
          </View>
          <View style={{
            backgroundColor: Colors.textWhite,
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.gray200,
            shadowColor: Colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {cart.items.map((item) => (
              <View key={item.id} style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                marginBottom: 12,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.gray200,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>
                    {item.product.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '400' }}>
                    {item.quantity} x ₹{item.price}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>
                  ₹{item.total}
                </Text>
              </View>
            ))}
            <View style={{ marginTop: 8, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '400' }}>Subtotal</Text>
                <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                  ₹{cart.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '400' }}>Delivery Fee</Text>
                <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                  {cart.deliveryFee === 0 ? (
                    <Text style={{ color: Colors.success, fontWeight: '600' }}>FREE</Text>
                  ) : (
                    `₹${cart.deliveryFee.toFixed(2)}`
                  )}
                </Text>
              </View>
              {cart.discount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: Colors.success, fontSize: 14, fontWeight: '400' }}>Discount</Text>
                  <Text style={{ color: Colors.success, fontWeight: '600', fontSize: 14 }}>
                    -₹{cart.discount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={{ 
                borderTopWidth: 1, 
                borderTopColor: Colors.gray200, 
                paddingTop: 12, 
                marginTop: 8,
                flexDirection: 'row', 
                justifyContent: 'space-between' 
              }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>Total</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary }}>
                  ₹{cart.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Modern Coupon */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, paddingBottom: SECTION_PADDING, opacity: fadeAnim }}>
          {!showCouponInput && !cart.couponCode ? (
            <TouchableOpacity
              onPress={() => setShowCouponInput(true)}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.textWhite,
                borderRadius: 8,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.primary,
                borderStyle: 'dashed',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="local-offer" size={18} color={Colors.primary} library="material" />
                <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                  Apply Coupon Code
                </Text>
              </View>
            </TouchableOpacity>
          ) : cart.couponCode ? (
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 8,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.success,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 12, color: Colors.success, marginBottom: 4, fontWeight: '600' }}>
                    Coupon Applied
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.success }}>
                    {cart.couponCode}
                  </Text>
                </View>
                <TouchableOpacity onPress={removeCoupon} activeOpacity={0.7}>
                  <Text style={{ color: Colors.error, fontWeight: '600', fontSize: 14 }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 8,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.gray200,
            }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.gray50,
                    borderWidth: 1,
                    borderColor: Colors.gray200,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 14,
                    color: Colors.textPrimary,
                    fontWeight: '400',
                  }}
                  placeholderTextColor={Colors.textTertiary}
                />
                <TouchableOpacity
                  onPress={handleApplyCoupon}
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 6,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: Colors.textWhite, fontWeight: '600', fontSize: 14 }}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Modern Payment Method */}
        <Animated.View style={{ padding: SECTION_PADDING, paddingTop: 0, opacity: fadeAnim }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
              Payment Method
            </Text>
          </View>
          {(['cod', 'upi', 'card', 'wallet'] as PaymentMethod[]).map((method) => (
            <TouchableOpacity
              key={method}
              onPress={() => setPaymentMethod(method)}
              style={{ marginBottom: 12 }}
              activeOpacity={0.8}
            >
              <View style={{
                backgroundColor: Colors.textWhite,
                borderRadius: 8,
                padding: 16,
                borderWidth: paymentMethod === method ? 2 : 1,
                borderColor: paymentMethod === method ? Colors.primary : Colors.gray200,
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>
                    {method === 'cod' ? 'Cash on Delivery' : method.toUpperCase()}
                  </Text>
                  {paymentMethod === method && (
                    <View style={{
                      backgroundColor: Colors.primary,
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon name={Icons.check.name} size={16} color={Colors.textWhite} library={Icons.check.library} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Modern Place Order Button */}
      <Animated.View style={{ opacity: fadeAnim, padding: SECTION_PADDING }}>
        <TouchableOpacity
          onPress={handlePlaceOrder}
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: Colors.textWhite, fontWeight: '600', fontSize: 16 }}>
            Place Order - ₹{cart.total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
