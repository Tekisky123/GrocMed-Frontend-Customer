import { Icon, Icons } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SECTION_PADDING = 20;

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const headerHeight = Platform.OS === 'ios' ? 120 : 100;

  if (cart.items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <PageHeader title="Shopping Cart" variant="primary" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: headerHeight, paddingHorizontal: 24 }}>
          <Animated.View style={{ opacity: fadeAnim, width: '100%', maxWidth: 400 }}>
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 12,
              padding: 40,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.gray200,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View style={{
                backgroundColor: Colors.gray100,
                borderRadius: 60,
                padding: 24,
                marginBottom: 20,
              }}>
                <Icon name={Icons.cart.name} size={60} color={Colors.textSecondary} library={Icons.cart.library} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center' }}>
                Your cart is empty
              </Text>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, fontSize: 15, lineHeight: 22, fontWeight: '400' }}>
                Looks like you haven't added anything to your cart yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)')}
                style={{
                  backgroundColor: Colors.primary,
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 8,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: Colors.textWhite, fontWeight: '600', fontSize: 15 }}>
                  Start Shopping
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader
        title="Shopping Cart"
        variant="primary"
        rightComponent={
          cart.items.length > 0 ? (
            <TouchableOpacity
              onPress={clearCart}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              activeOpacity={0.7}
            >
              <Icon name={Icons.delete.name} size={16} color={Colors.textWhite} library={Icons.delete.library} />
              <Text style={{ color: Colors.textWhite, fontWeight: '700', marginLeft: 6, fontSize: 13 }}>
                Clear
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: SECTION_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '500' }}>
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
          </Text>
        </Animated.View>
        {cart.items.map((item) => (
          <Animated.View
            key={item.id}
            style={{
              opacity: fadeAnim,
              marginBottom: 12,
            }}
          >
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: Colors.gray200,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{
                  backgroundColor: Colors.gray50,
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginRight: 12,
                  width: 100,
                  height: 100,
                }}>
                  <Image
                    source={{ uri: item.product.image }}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: Colors.textPrimary,
                    marginBottom: 6,
                    lineHeight: 20,
                  }} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 8, fontWeight: '400' }}>
                    {item.product.brand}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
                      ₹{item.total}
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: Colors.gray100,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: Colors.gray200,
                    }}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                        activeOpacity={0.7}
                      >
                        <Icon name={Icons.remove.name} size={18} color={Colors.textPrimary} library={Icons.remove.library} />
                      </TouchableOpacity>
                      <Text style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        color: Colors.textPrimary,
                        fontWeight: '600',
                        fontSize: 14,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderColor: Colors.gray200,
                      }}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                        activeOpacity={0.7}
                      >
                        <Icon name={Icons.add.name} size={18} color={Colors.textPrimary} library={Icons.add.library} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.productId)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      paddingVertical: 6,
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name={Icons.delete.name} size={14} color={Colors.error} library={Icons.delete.library} />
                    <Text style={{ color: Colors.error, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Modern Summary */}
      <Animated.View style={{
        opacity: fadeAnim,
        paddingHorizontal: SECTION_PADDING,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <View style={{
          backgroundColor: Colors.textWhite,
          borderRadius: 8,
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.gray200,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '400' }}>Subtotal</Text>
              <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                ₹{cart.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '400' }}>Discount</Text>
                <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14 }}>
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
          <TouchableOpacity
            onPress={() => router.push('/checkout')}
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: Colors.textWhite, fontWeight: '600', fontSize: 15 }}>
              Proceed to Checkout
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
