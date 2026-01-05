import { orderApi } from '@/api/orderApi';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Address, PaymentMethod } from '@/types';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SECTION_PADDING = 20;

export default function CheckoutScreen() {
  const { cart, clearCart } = useCart();
  const { user, updateProfile } = useAuth(); // Assuming updateProfile exists or we need to implement address adding via API
  const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses?.[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    street: '',
    city: '',
    state: '',
    zip: '',
    type: 'Home',
    isDefault: false
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true, // Opacity needs true
    }).start();
  }, []);

  // Auto-select default address or first address when user data loads
  React.useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      // Find default address
      const defaultAddress = user.addresses.find(addr => addr.isDefault);

      // Select default address if exists, otherwise select first address
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (!selectedAddressId) {
        setSelectedAddressId(user.addresses[0].id);
      }
    }
  }, [user?.addresses]);

  const handleSaveAddress = async () => {
    // Basic validation
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      alert('Please fill all address fields');
      return;
    }

    // Prepare full address object
    // Prepare full address object
    const addressToSave: Address = {
      id: Math.random().toString(36).substr(2, 9), // Temp ID till server response
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      zip: newAddress.zip,
      type: newAddress.type as 'Home' | 'Work' | 'Other',
      isDefault: newAddress.isDefault || false,
    };

    if (user) {
      // 1. Optimistically update local list for immediate feedback
      const updatedAddresses = [...user.addresses, addressToSave];

      // 2. Call API to persist
      try {
        const res = await updateProfile({ addresses: updatedAddresses });
        if (res.success) {
          // Profile updated via context, user object should be fresh now
          // If backend overwrites IDs, we might want to select the last one from the updated user
          // For simplicity, we select the ID we just generated or rely on refresh
          setSelectedAddressId(addressToSave.id);
        } else {
          alert('Failed to save address to profile, but selected for this order.');
          // Still select it locally
          user.addresses.push(addressToSave); // Fallback local mutation
          setSelectedAddressId(addressToSave.id);
        }
      } catch (e) {
        console.error("Save address invalid", e);
      }
    }

    setIsAddingAddress(false);
  };

  const handlePlaceOrder = async () => {
    // Find the full address object
    const addressObject = user?.addresses.find(a => a.id === selectedAddressId);

    if (!addressObject) {
      alert('Please select or add a delivery address');
      return;
    }

    // Validate minimum quantities before placing order
    const invalidItems = cart.items.filter(item => {
      const minQty = item.product.minQuantity || 1;
      return item.quantity < minQty;
    });

    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item =>
        `${item.product.name} (min: ${item.product.minQuantity || 1}, current: ${item.quantity})`
      ).join('\n');

      alert(`Cannot place order. The following items are below minimum quantity:\n\n${itemNames}\n\nPlease update your cart.`);
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        // Backend expects 'shippingAddress' as a string based on "Cast to string failed" error.
        // We will format the address object into a single string.
        shippingAddress: JSON.stringify({
          streetAddress: addressObject.street,
          city: addressObject.city,
          state: addressObject.state,
          postalCode: addressObject.zip,
          fullName: user?.name || 'Guest',
          phoneNumber: user?.phone || '',
        }),
        // Also try passing simplified string if JSON fails? 
        // But JSON is safer.
        // paymentMethod: UPPERCASE
        paymentMethod: paymentMethod.toUpperCase(),
        items: cart.items,
        totalAmount: cart.total
      };

      const res = await orderApi.placeOrder(orderData);

      if (res.success) {
        clearCart();
        router.replace({
          pathname: '/orders/confirmation',
          params: {
            orderId: res.data?.orderId || res.data?._id || `ORD-${Date.now()}`,
            total: cart.total.toString(),
          },
        });
      } else {
        alert(res.message || 'Failed to place order');
      }
    } catch (error) {
      alert('An error occurred while placing order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const headerHeight = Platform.OS === 'ios' ? 120 : 100;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="Checkout" variant="primary" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 100 }}
      >
        {/* Address Section */}
        <Animated.View style={{ padding: SECTION_PADDING, opacity: fadeAnim }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>
            Delivery Address
          </Text>

          {/* List Existing Addresses */}
          {!isAddingAddress && user?.addresses && user.addresses.length > 0 && user.addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              onPress={() => setSelectedAddressId(address.id)}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.textWhite,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: selectedAddressId === address.id ? 2 : 1,
                borderColor: selectedAddressId === address.id ? Colors.primary : Colors.gray200,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ backgroundColor: Colors.gray100, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' }}>{address.type}</Text>
                  </View>
                  <Text style={{ fontWeight: '600', color: Colors.textPrimary, fontSize: 15 }}>
                    {address.city}, {address.state}
                  </Text>
                </View>
                <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
                  {address.street}, {address.zip}
                </Text>
              </View>

              {selectedAddressId === address.id && (
                <View style={{ backgroundColor: Colors.primary, borderRadius: 12, padding: 4 }}>
                  <Icon name="check" size={16} color="#fff" library="material" />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Add New Address Button */}
          {!isAddingAddress && (
            <TouchableOpacity
              onPress={() => setIsAddingAddress(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.primary,
                borderStyle: 'dashed',
                borderRadius: 12,
                backgroundColor: 'rgba(248, 128, 14, 0.05)'
              }}
            >
              <Icon name="add" size={20} color={Colors.primary} library="material" />
              <Text style={{ color: Colors.primary, fontWeight: '600', marginLeft: 8 }}>Add New Address</Text>
            </TouchableOpacity>
          )}

          {/* Add Address Form */}
          {isAddingAddress && (
            <View style={{ backgroundColor: Colors.textWhite, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray200 }}>
              <Text style={{ fontWeight: '700', marginBottom: 12, fontSize: 16 }}>New Address Details</Text>

              <TextInput
                placeholder="Street Address / Building"
                value={newAddress.street}
                onChangeText={(t) => setNewAddress(prev => ({ ...prev, street: t }))}
                style={{ borderWidth: 1, borderColor: Colors.gray200, borderRadius: 8, padding: 12, marginBottom: 12 }}
              />
              <View style={{ marginBottom: 12 }}>
                <TextInput
                  placeholder="City"
                  value={newAddress.city}
                  onChangeText={(t) => setNewAddress(prev => ({ ...prev, city: t }))}
                  style={{ borderWidth: 1, borderColor: Colors.gray200, borderRadius: 8, padding: 12, width: '100%', marginBottom: 12 }}
                />
                <TextInput
                  placeholder="State"
                  value={newAddress.state}
                  onChangeText={(t) => setNewAddress(prev => ({ ...prev, state: t }))}
                  style={{ borderWidth: 1, borderColor: Colors.gray200, borderRadius: 8, padding: 12, width: '100%' }}
                />
              </View>
              <View style={{ marginBottom: 12 }}>
                <TextInput
                  placeholder="Zip / Pincode"
                  value={newAddress.zip}
                  onChangeText={(t) => setNewAddress(prev => ({ ...prev, zip: t }))}
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderColor: Colors.gray200, borderRadius: 8, padding: 12, width: '100%' }}
                />
              </View>

              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>Address Type</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {(['Home', 'Work', 'Other'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setNewAddress(prev => ({ ...prev, type }))}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        backgroundColor: newAddress.type === type ? Colors.primary : Colors.gray100,
                        borderWidth: 1,
                        borderColor: newAddress.type === type ? Colors.primary : Colors.gray200
                      }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: newAddress.type === type ? '#fff' : Colors.textSecondary }}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => setIsAddingAddress(false)}
                  style={{ flex: 1, padding: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveAddress}
                  style={{ flex: 1, backgroundColor: Colors.primary, borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Save & Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </Animated.View>

        {/* Order Summary (No Coupons) */}
        <Animated.View style={{ padding: SECTION_PADDING, paddingTop: 0, opacity: fadeAnim }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 }}>
            Order Summary
          </Text>
          <View style={{ backgroundColor: Colors.textWhite, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.gray200 }}>
            {/* Simple list of totals */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: Colors.textSecondary }}>Subtotal</Text>
              <Text style={{ fontWeight: '600' }}>₹{cart.subtotal}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: Colors.textSecondary }}>Delivery Fee</Text>
              <Text style={{ fontWeight: '600', color: Colors.success }}>{cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}</Text>
            </View>
            {cart.discount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: Colors.textSecondary }}>Discount</Text>
                <Text style={{ fontWeight: '600', color: Colors.success }}>-₹{cart.discount}</Text>
              </View>
            )}
            <View style={{ height: 1, backgroundColor: Colors.gray200, marginVertical: 12 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '800' }}>Total Amount</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>₹{cart.total}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Payment Method */}
        <Animated.View style={{ padding: SECTION_PADDING, paddingTop: 0, opacity: fadeAnim }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 }}>
            Payment Method
          </Text>
          {(['cod', 'upi', 'card'] as PaymentMethod[]).map((method) => (
            <TouchableOpacity
              key={method}
              onPress={() => setPaymentMethod(method)}
              style={{ marginBottom: 10 }}
              activeOpacity={0.8}
            >
              <View style={{
                backgroundColor: Colors.textWhite,
                borderRadius: 8,
                padding: 16,
                borderWidth: paymentMethod === method ? 2 : 1,
                borderColor: paymentMethod === method ? Colors.primary : Colors.gray200,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>{method === 'cod' ? 'Cash on Delivery' : method.toUpperCase()}</Text>
                {paymentMethod === method && <Icon name="check-circle" size={20} color={Colors.primary} library="material" />}
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={{ padding: 20, backgroundColor: Colors.textWhite, borderTopWidth: 1, borderColor: Colors.gray200 }}>
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading}
          style={{
            backgroundColor: loading ? Colors.gray400 : Colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            {loading ? 'Processing...' : `Place Order • ₹${cart.total}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
