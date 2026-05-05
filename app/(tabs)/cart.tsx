import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { router } from 'expo-router';
import React from 'react';
import { Animated, FlatList, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const totalGST = cart.items.reduce((sum, item) => {
    const gstRate = item.product?.gstRate || 0;
    if (gstRate > 0) {
      const taxable = item.total / (1 + gstRate / 100);
      return sum + (item.total - taxable);
    }
    return sum;
  }, 0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="My Cart"
        rightComponent={
          cart.items.length > 0 ? (
            <TouchableOpacity onPress={clearCart}>
              <Text className="text-red-500 font-bold text-[13px]">Clear Cart</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {cart.items.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <View className="w-32 h-32 bg-gray-50 rounded-full items-center justify-center mb-6">
            <Icon name="shopping-cart" size={48} color={Colors.gray400} library="material" />
          </View>
          <Text className="text-2xl font-extrabold text-gray-900 mb-3">Your Cart is Empty</Text>
          <Text className="text-center text-gray-500 mb-8 leading-6 text-[15px]">
            Looks like you haven&apos;t added anything to your cart yet. Discover fresh products now!
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="bg-orange-500 py-4 px-8 rounded-2xl shadow-sm shadow-orange-500/30"
          >
            <Text className="text-white font-extrabold text-base">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item.id.toString()}
            initialNumToRender={5}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            contentContainerStyle={{ padding: 20, paddingBottom: 160 + insets.bottom, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row bg-white rounded-2xl p-3 shadow-sm shadow-black/5 border border-black/5 mb-4">
                {/* Product Image */}
                <View className="w-20 h-20 rounded-xl bg-gray-50 items-center justify-center mr-4 overflow-hidden">
                  <Image 
                    source={{ uri: item.product.image || 'https://via.placeholder.com/150' }} 
                    className="w-full h-full"
                    resizeMode="cover" 
                  />
                </View>

                {/* Details */}
                <View className="flex-1 justify-between py-1">
                  <View>
                    <View className="flex-row justify-between items-start">
                      <Text className="text-base font-bold text-gray-900 flex-1 mr-2 leading-snug" numberOfLines={2}>
                        {item.product.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeFromCart(item.productId)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                        <Icon name="close" size={18} color={Colors.gray400} library="material" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-[13px] text-gray-500 mt-1 font-medium">
                      {item.packagingOptionLabel ? item.packagingOptionLabel : (item.product.unit || 'Unit')}
                      {item.product.perUnitWeightVolume && item.packagingOptionLabel?.toLowerCase() !== item.product.perUnitWeightVolume.toLowerCase() ? ` (${item.product.perUnitWeightVolume})` : ''} • ₹{item.price}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-[17px] font-extrabold text-gray-900">₹{item.total}</Text>

                    {/* Quantity Control */}
                    <View className="flex-row items-center bg-white rounded-xl border border-gray-200 p-1">
                      <TouchableOpacity
                        onPress={item.quantity <= (item.product.minQuantity || 1) ? undefined : () => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= (item.product.minQuantity || 1)}
                        activeOpacity={item.quantity <= (item.product.minQuantity || 1) ? 1 : 0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className={`w-7 h-7 items-center justify-center rounded-lg ${item.quantity <= (item.product.minQuantity || 1) ? 'opacity-30' : 'bg-white'}`}
                      >
                        <Icon name="remove" size={16} color={Colors.textPrimary} library="material" />
                      </TouchableOpacity>

                      <Text className="w-8 text-center font-bold text-gray-900 text-sm">{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="w-7 h-7 items-center justify-center bg-orange-500 rounded-lg"
                      >
                        <Icon name="add" size={16} color="#fff" library="material" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={() => (
              <Animated.View style={{ opacity: fadeAnim }}>
                <View className="mt-4">
                  <Text className="text-lg font-extrabold text-gray-900 mb-4 tracking-tight">Bill Details</Text>
                  <View className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm shadow-black/5">
                    <View className="flex-row justify-between mb-3.5">
                      <Text className="text-gray-500 text-[15px]">Item Total</Text>
                      <Text className="font-semibold text-gray-900 text-[15px]">₹{cart.subtotal}</Text>
                    </View>
                    <View className="flex-row justify-between mb-3.5">
                      <Text className="text-gray-500 text-[15px]">Delivery Fee</Text>
                      <Text className="font-bold text-green-600 text-[15px]">{cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}</Text>
                    </View>
                    {cart.discount > 0 && (
                      <View className="flex-row justify-between mb-3.5">
                        <Text className="text-gray-500 text-[15px]">Discount</Text>
                        <Text className="font-bold text-green-600 text-[15px]">-₹{cart.discount}</Text>
                      </View>
                    )}
                    {totalGST > 0 && (
                      <View className="flex-row justify-between mb-3.5">
                        <Text className="text-gray-500 text-[15px]">GST (Incl.)</Text>
                        <Text className="font-semibold text-gray-900 text-[13px]">₹{totalGST.toFixed(2)}</Text>
                      </View>
                    )}
                    <View className="h-[1px] border border-dashed border-gray-200 rounded-sm my-4" />
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-extrabold text-gray-900">To Pay</Text>
                      <Text className="text-[22px] font-extrabold text-orange-500">₹{cart.total}</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center justify-center mt-6 opacity-60">
                  <Icon name="verified-user" size={14} color={Colors.textSecondary} library="material" />
                  <Text className="ml-1.5 text-gray-500 text-xs font-medium">Safe and Secure Payments</Text>
                </View>
              </Animated.View>
            )}
          />

          {/* Bottom Checkout Bar - Sticky & Premium */}
          <View 
            className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-5 border-t border-gray-100 rounded-t-[32px] shadow-[0_-8px_20px_rgba(0,0,0,0.1)]"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <TouchableOpacity
              onPress={() => router.push('/checkout')}
              className="bg-orange-500 flex-row items-center justify-between py-[18px] px-6 rounded-[20px] shadow-sm shadow-orange-500/30"
              activeOpacity={0.85}
            >
              <View>
                <Text className="text-white/80 text-[11px] font-semibold tracking-wider uppercase">TOTAL</Text>
                <Text className="text-white text-lg font-extrabold">₹{cart.total}</Text>
              </View>
              <View className="flex-row items-center bg-black/10 px-4 py-2 rounded-xl">
                <Text className="text-white text-[15px] font-bold mr-2">Checkout</Text>
                <Icon name="arrow-forward" size={18} color="#fff" library="material" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
