import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [cart.items.length]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader
        title="My Cart"
        rightComponent={
          cart.items.length > 0 ? (
            <TouchableOpacity onPress={clearCart}>
              <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 13 }}>Clear Cart</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {cart.items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View style={{
            width: 120, height: 120, backgroundColor: Colors.gray100, borderRadius: 60,
            alignItems: 'center', justifyContent: 'center', marginBottom: 24
          }}>
            <Icon name="shopping-cart" size={48} color={Colors.gray400} library="material" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 }}>Your Cart is Empty</Text>
          <Text style={{ textAlign: 'center', color: Colors.textSecondary, marginBottom: 32, lineHeight: 24, fontSize: 15 }}>
            Looks like you haven't added anything to your cart yet. Discover fresh products now!
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 16,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 160, paddingTop: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Cart Items */}
            <View style={{ gap: 16 }}>
              {cart.items.map((item) => (
                <Animated.View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: Colors.textWhite,
                    borderRadius: 20,
                    padding: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    opacity: fadeAnim,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Product Image */}
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    backgroundColor: Colors.gray50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16
                  }}>
                    <Image source={{ uri: item.product.image }} style={{ width: 60, height: 60 }} resizeMode="contain" />
                  </View>

                  {/* Details */}
                  <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 4 }}>
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8, lineHeight: 22 }} numberOfLines={2}>
                          {item.product.name}
                        </Text>
                        <TouchableOpacity onPress={() => removeFromCart(item.productId)} hitSlop={10}>
                          <Icon name="close" size={18} color={Colors.gray400} library="material" />
                        </TouchableOpacity>
                      </View>
                      <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' }}>
                        {item.product.unit || 'Unit'} • ₹{item.price}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary }}>
                        ₹{item.total}
                      </Text>

                      {/* Quantity Control - Modern Pill */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: Colors.background,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        padding: 4
                      }}>
                        <TouchableOpacity
                          onPress={
                            item.quantity <= (item.product.minQuantity || 1)
                              ? undefined  // No handler when at minimum - completely disable
                              : () => {
                                const minQty = item.product.minQuantity || 1;
                                if (item.quantity > minQty) {
                                  updateQuantity(item.productId, item.quantity - 1);
                                }
                              }
                          }
                          disabled={item.quantity <= (item.product.minQuantity || 1)}
                          activeOpacity={item.quantity <= (item.product.minQuantity || 1) ? 1 : 0.7}
                          style={{
                            width: 28,
                            height: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: Colors.white,
                            borderRadius: 8,
                            shadowColor: "#000",
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            opacity: item.quantity <= (item.product.minQuantity || 1) ? 0.3 : 1
                          }}
                        >
                          <Icon name="remove" size={16} color={Colors.textPrimary} library="material" />
                        </TouchableOpacity>

                        <Text style={{ width: 32, textAlign: 'center', fontWeight: '700', color: Colors.textPrimary, fontSize: 14 }}>{item.quantity}</Text>

                        <TouchableOpacity
                          onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                          style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 8 }}
                        >
                          <Icon name="add" size={16} color="#fff" library="material" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Bill Details - Receipt Style */}
            <View style={{ marginTop: 32 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16, letterSpacing: -0.5 }}>Bill Details</Text>
              <View style={{
                backgroundColor: Colors.textWhite,
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: Colors.gray200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 12
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>Item Total</Text>
                  <Text style={{ fontWeight: '600', color: Colors.textPrimary, fontSize: 15 }}>₹{cart.subtotal}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>Delivery Fee</Text>
                  <Text style={{ fontWeight: '700', color: Colors.success, fontSize: 15 }}>{cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}</Text>
                </View>
                {cart.discount > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                    <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>Discount</Text>
                    <Text style={{ fontWeight: '700', color: Colors.success, fontSize: 15 }}>-₹{cart.discount}</Text>
                  </View>
                )}

                {/* Dashed Line */}
                <View style={{ height: 1, borderColor: Colors.gray200, borderWidth: 1, borderStyle: 'dashed', borderRadius: 1, marginVertical: 16 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>To Pay</Text>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.primary }}>₹{cart.total}</Text>
                </View>
              </View>
            </View>

            {/* Secure Payment Note */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, opacity: 0.6 }}>
              <Icon name="verified-user" size={14} color={Colors.textSecondary} library="material" />
              <Text style={{ marginLeft: 6, color: Colors.textSecondary, fontSize: 12, fontWeight: '500' }}>Safe and Secure Payments</Text>
            </View>

          </ScrollView>

          {/* Bottom Checkout Bar - Sticky & Premium */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.textWhite,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: Platform.OS === 'ios' ? 34 : 24,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            // elevation: 24,
            borderWidth: 1,
            borderColor: Colors.gray100
          }}>
            <TouchableOpacity
              onPress={() => router.push('/checkout')}
              style={{
                backgroundColor: Colors.primary,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 18,
                paddingHorizontal: 24,
                borderRadius: 20,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              }}
              activeOpacity={0.85}
            >
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>TOTAL</Text>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>₹{cart.total}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginRight: 8 }}>Checkout</Text>
                <Icon name="arrow-forward" size={18} color="#fff" library="material" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

