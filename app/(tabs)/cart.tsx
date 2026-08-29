import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreStatusBanner } from '@/components/StoreStatusBanner';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { FlatList, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { cart, settings, updateQuantity, removeFromCart, clearCart, refreshSettings } = useCart();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      refreshSettings();
    }, [refreshSettings])
  );

  const isStoreClosed = !!(settings?.storeStatus && !settings.storeStatus.isOpen);
  const minOrderValue = cart.minOrderValue ?? settings?.minOrderValue ?? 1000;
  const isBelowMinOrder = cart.subtotal < minOrderValue;
  const minOrderShortfall = Math.max(0, minOrderValue - cart.subtotal);

  const totalGST = cart.items.reduce((sum, item) => {
    const gstRate = item.product?.gstRate || 0;
    if (gstRate > 0) {
      const taxable = item.total / (1 + gstRate / 100);
      return sum + (item.total - taxable);
    }
    return sum;
  }, 0);

  const handleCheckoutPress = () => {
    if (isStoreClosed) {
      showToast(settings?.storeStatus?.statusMessage || 'Store is currently closed for orders', 'error');
      return;
    }
    if (isBelowMinOrder) {
      showToast(
        `Minimum order amount is ₹${minOrderValue}. Please add ₹${minOrderShortfall} more to proceed.`,
        'info'
      );
      return;
    }
    router.push('/checkout');
  };

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="My Cart"
        rightComponent={
          cart.items.length > 0 ? (
            <TouchableOpacity onPress={clearCart}>
              <Text className="text-red-600 font-extrabold text-[13px]">Clear Cart</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <StoreStatusBanner storeStatus={settings?.storeStatus} />

      {cart.items.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <View className="w-32 h-32 bg-gray-100 rounded-[5px] items-center justify-center mb-6 border border-gray-200">
            <Icon name="shopping-bag" size={64} color={Colors.primary} library="material" />
          </View>
          <Text className="text-xl font-black text-gray-900 mb-2">Your Cart is Empty</Text>
          <Text className="text-gray-600 text-center mb-8 px-8 font-medium">
            Looks like you haven't added any items to your cart yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="bg-orange-500 py-4 px-8 rounded-[5px]"
          >
            <Text className="text-white font-extrabold text-base">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item.id.toString()}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 160 + insets.bottom, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row bg-white rounded-[5px] p-3.5 border border-gray-200 mb-4">
                {/* Product Image */}
                <View className="w-20 h-20 rounded-[5px] bg-gray-50 items-center justify-center mr-4 overflow-hidden border border-gray-100">
                  <Image 
                    source={{ uri: item.product.image || 'https://via.placeholder.com/150' }} 
                    className="w-full h-full"
                    resizeMode="contain" 
                  />
                </View>

                {/* Details */}
                <View className="flex-1 justify-between py-0.5">
                  <View>
                    <View className="flex-row justify-between items-start">
                      <Text className="text-base font-extrabold text-gray-900 flex-1 mr-2 leading-snug" numberOfLines={2}>
                        {item.product.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeFromCart(item.productId)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                        <Icon name="close" size={18} color={Colors.textPrimary} library="material" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-[13px] text-gray-700 mt-1 font-semibold">
                      {item.packagingOptionLabel ? item.packagingOptionLabel : (item.product.unit || 'Unit')}
                      {item.product.perUnitWeightVolume && item.packagingOptionLabel?.toLowerCase() !== item.product.perUnitWeightVolume.toLowerCase() ? ` (${item.product.perUnitWeightVolume})` : ''} • ₹{item.price}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-[18px] font-black text-gray-900">₹{item.total}</Text>

                    {/* Quantity Control */}
                    <View className="flex-row items-center bg-white rounded-[5px] border border-gray-300 p-1">
                      <TouchableOpacity
                        onPress={item.quantity <= (item.product.minQuantity || 1) ? undefined : () => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= (item.product.minQuantity || 1)}
                        activeOpacity={item.quantity <= (item.product.minQuantity || 1) ? 1 : 0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className={`w-7 h-7 items-center justify-center rounded-[5px] ${item.quantity <= (item.product.minQuantity || 1) ? 'bg-gray-100' : 'bg-white'}`}
                      >
                        <Icon name="remove" size={16} color={item.quantity <= (item.product.minQuantity || 1) ? Colors.gray400 : Colors.textPrimary} library="material" />
                      </TouchableOpacity>

                      <Text className="w-8 text-center font-black text-gray-900 text-sm">{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="w-7 h-7 items-center justify-center bg-orange-500 rounded-[5px]"
                      >
                        <Icon name="add" size={16} color="#fff" library="material" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={() => (
              <View>
                <View className="mt-4">
                  <Text className="text-lg font-black text-gray-900 mb-4 tracking-tight">Bill Details</Text>
                  <View className="bg-white rounded-[5px] p-6 border border-gray-200">
                    <View className="flex-row justify-between mb-3.5">
                      <Text className="text-gray-700 font-medium text-[15px]">Item Total</Text>
                      <Text className="font-extrabold text-gray-900 text-[15px]">₹{cart.subtotal}</Text>
                    </View>
                    <View className="flex-row justify-between mb-3.5">
                      <Text className="text-gray-700 font-medium text-[15px]">Delivery Fee</Text>
                      <Text className="font-extrabold text-green-700 text-[15px]">{cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}</Text>
                    </View>
                    {cart.discount > 0 && (
                      <View className="flex-row justify-between mb-3.5">
                        <Text className="text-gray-700 font-medium text-[15px]">Discount</Text>
                        <Text className="font-extrabold text-green-700 text-[15px]">-₹{cart.discount}</Text>
                      </View>
                    )}
                    {totalGST > 0 && (
                      <View className="flex-row justify-between mb-3.5">
                        <Text className="text-gray-700 font-medium text-[15px]">GST (Incl.)</Text>
                        <Text className="font-bold text-gray-900 text-[14px]">₹{totalGST.toFixed(2)}</Text>
                      </View>
                    )}
                    <View className="h-[1px] bg-gray-200 my-4" />
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-black text-gray-900">To Pay</Text>
                      <Text className="text-[22px] font-black text-orange-500">₹{cart.total}</Text>
                    </View>
                  </View>

                  {/* Minimum Order Warning Banner */}
                  {isBelowMinOrder && (
                    <View className="mt-4 bg-amber-50 border border-amber-300 rounded-[5px] p-4 flex-row items-center">
                      <View className="w-10 h-10 rounded-[5px] bg-amber-100 items-center justify-center mr-3">
                        <Icon name="error-outline" size={22} color="#D97706" library="material" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-amber-950 font-black text-[14px]">Minimum Order Requirement</Text>
                        <Text className="text-amber-900 text-[13px] mt-0.5 font-semibold leading-snug">
                          Minimum order is ₹{minOrderValue}. Add items worth <Text className="font-black text-amber-950">₹{minOrderShortfall}</Text> more to checkout.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center justify-center mt-6">
                  <Icon name="verified-user" size={16} color={Colors.success} library="material" />
                  <Text className="ml-1.5 text-gray-800 text-xs font-bold">Safe and Secure Payments</Text>
                </View>
              </View>
            )}
          />

          {/* Bottom Checkout Bar - Sticky & High Contrast */}
          <View 
            className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 border-t border-gray-200 rounded-t-[5px]"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <TouchableOpacity
              onPress={handleCheckoutPress}
              className={`${isStoreClosed ? 'bg-amber-800' : isBelowMinOrder ? 'bg-amber-700' : 'bg-orange-500'} flex-row items-center justify-between py-[18px] px-6 rounded-[5px]`}
              activeOpacity={0.85}
            >
              <View>
                <Text className="text-white text-[11px] font-bold tracking-wider uppercase">TOTAL</Text>
                <Text className="text-white text-lg font-black">₹{cart.total}</Text>
              </View>
              <View className="flex-row items-center bg-black/25 px-4 py-2.5 rounded-[5px]">
                <Text className="text-white text-[14px] font-extrabold mr-2">
                  {isStoreClosed ? 'Store Closed' : isBelowMinOrder ? `Add ₹${minOrderShortfall} More` : 'Checkout'}
                </Text>
                <Icon name={isStoreClosed ? 'time-outline' : isBelowMinOrder ? 'add-shopping-cart' : 'arrow-forward'} size={18} color="#fff" library="material" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
