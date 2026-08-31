import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import React from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  variant?: 'vertical' | 'horizontal';
}

export const ProductCard = React.memo(
  function ProductCardInner({ product, onPress, variant = 'vertical' }: ProductCardProps) {
    const { addToCart, getItemQuantity, updateQuantity, settings } = useCart();
    const isStoreClosed = settings?.storeStatus && !settings.storeStatus.isOpen;
    const startAnimation = useCartAnimation()?.startAnimation || (() => {});
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const imageRef = React.useRef<View>(null);

    const [isAdding, setIsAdding] = React.useState(false);

    const handleAddToCart = React.useCallback(() => {
      if (!product || !product.inStock || isAdding || isStoreClosed) return;

      setIsAdding(true);

      if (imageRef.current) {
        imageRef.current.measureInWindow((x, y, width, height) => {
          if (x !== undefined && y !== undefined && width > 0) {
            startAnimation({ x, y, width, height }, product.image || 'https://via.placeholder.com/150', () => {});
          }
        });
      }

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      ]).start();

      try {
        addToCart(product, product.minQuantity || 1);
      } catch (error) {
        console.warn('Failed to add to cart:', error);
      }

      setTimeout(() => setIsAdding(false), 500);
    }, [product, isAdding, isStoreClosed, startAnimation, addToCart, scaleAnim]);

    const hasDiscount = product.discount && product.discount > 0;
    const hasOptions = product.packagingOptions && product.packagingOptions.length > 0;
    const canAdd = (product.inStock || hasOptions) && !isStoreClosed;
    const cartQty = getItemQuantity(product.id);

    if (variant === 'horizontal') {
      return (
        <View className="w-full">
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="bg-white rounded-[5px] p-3 flex-row border border-black/5 mb-3"
          >
            {/* Image Section */}
            <View ref={imageRef} collapsable={false} className="relative bg-gray-50 rounded-[5px] p-1.5">
              <View className="absolute top-1 left-1 right-1 flex-row justify-between items-center z-10">
                {hasDiscount ? (
                  <View className="bg-red-500 px-1 py-0.5 rounded-[5px]">
                    <Text className="text-white text-[8px] font-extrabold">{product.discount}%</Text>
                  </View>
                ) : <View />}
                {hasOptions ? (
                  <View className="bg-blue-50 px-1 py-0.5 rounded-[5px] border border-blue-600/10 ml-auto">
                    <Text className="text-[8px] font-extrabold text-blue-700">{product.packagingOptions!.length} OPT</Text>
                  </View>
                ) : null}
              </View>
              <Image
                source={{ uri: product.image || 'https://via.placeholder.com/150' }}
                className="w-[85px] h-[85px] rounded-[5px]"
                resizeMode="contain"
                resizeMethod="resize"
                fadeDuration={0}
              />
            </View>

            {/* Details Section */}
            <View className="flex-1 ml-3 justify-between">
              <View>
                <Text className="text-[15px] font-bold text-gray-900 mb-1 leading-tight" numberOfLines={2}>
                  {product.name}
                </Text>
                <Text className="text-[11px] text-gray-500 mb-1.5">{product.unit}</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[17px] font-extrabold text-gray-900">₹{product.price}</Text>
                  {hasDiscount && (
                    <Text className="text-[11px] text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </Text>
                  )}
                </View>

                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  {cartQty > 0 && !hasOptions ? (
                    <View className="flex-row items-center bg-gray-100 rounded-[5px] p-0.5 border border-gray-200">
                      <TouchableOpacity
                        onPress={() => updateQuantity(product.id, cartQty - 1)}
                        className="w-7 h-7 bg-white rounded-[5px] items-center justify-center"
                      >
                        <Icon name="remove" size={14} color={Colors.textPrimary} library="material" />
                      </TouchableOpacity>
                      <Text className="w-6 text-center text-xs font-extrabold text-gray-900">{cartQty}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(product.id, cartQty + 1)}
                        className="w-7 h-7 bg-orange-500 rounded-[5px] items-center justify-center"
                      >
                        <Icon name="add" size={14} color="#fff" library="material" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={hasOptions ? onPress : handleAddToCart}
                      disabled={!canAdd}
                      className={`py-1.5 px-3.5 rounded-[5px] ${canAdd ? 'bg-orange-500' : 'bg-gray-300'}`}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-bold text-xs ${canAdd ? 'text-white' : 'text-gray-500'}`}>
                        {isStoreClosed ? 'CLOSED' : canAdd ? 'ADD' : 'OUT'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // Vertical variant (default)
    return (
      <View className="w-full flex-1">
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          className="bg-white rounded-[5px] p-2.5 border border-slate-200/60 flex-1 justify-between"
        >
          <View>
            {/* Image Section */}
            <View ref={imageRef} collapsable={false} className="items-center mb-2 bg-slate-50 rounded-[5px] p-2 relative">
              {/* Badges Bar */}
              <View className="absolute top-1 left-1 right-1 flex-row justify-between items-center z-10">
                {hasDiscount ? (
                  <View className="bg-red-50 border border-red-200/80 px-1.5 py-0.5 rounded-[5px]">
                    <Text className="text-red-600 text-[9px] font-black">{product.discount}% OFF</Text>
                  </View>
                ) : <View />}

                {hasOptions ? (
                  <View className="bg-blue-50 px-1.5 py-0.5 rounded-[5px] border border-blue-600/10 ml-auto">
                    <Text className="text-[9px] font-extrabold text-blue-700">{product.packagingOptions!.length} OPTIONS</Text>
                  </View>
                ) : null}
              </View>

              <Image
                source={{ uri: product.image || 'https://via.placeholder.com/150' }}
                className="w-full h-[115px] rounded-[5px]"
                resizeMode="contain"
                resizeMethod="resize"
                fadeDuration={0}
              />
            </View>

            {/* Product Details */}
            <View className="w-full">
              <Text
                className="text-[13px] font-bold text-slate-900 mb-1 leading-snug min-h-[34px]"
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <Text className="text-[11px] text-slate-500 font-medium mb-1">{product.unit}</Text>
            </View>
          </View>

          {/* Price and Add Button (Pushed to bottom) */}
          <View className="flex-row items-center justify-between mt-1 pt-1 border-t border-transparent">
            <View>
              <Text className="text-[15px] font-black text-slate-900 leading-none">₹{product.price}</Text>
              {hasDiscount && product.originalPrice && product.originalPrice > product.price ? (
                <Text className="text-[10px] text-slate-400 font-semibold line-through mt-0.5">
                  ₹{product.originalPrice}
                </Text>
              ) : null}
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              {cartQty > 0 && !hasOptions ? (
                <View className="flex-row items-center bg-slate-100 rounded-[5px] p-0.5 border border-slate-200">
                  <TouchableOpacity
                    onPress={() => updateQuantity(product.id, cartQty - 1)}
                    className="w-7 h-7 bg-white rounded-[5px] items-center justify-center"
                  >
                    <Icon name="remove" size={14} color={Colors.textPrimary} library="material" />
                  </TouchableOpacity>
                  <Text className="w-6 text-center text-[13px] font-black text-slate-900">{cartQty}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(product.id, cartQty + 1)}
                    className="w-7 h-7 bg-orange-500 rounded-[5px] items-center justify-center"
                  >
                    <Icon name="add" size={14} color="#fff" library="material" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={hasOptions ? onPress : handleAddToCart}
                  disabled={!canAdd}
                  className={`py-1.5 px-3 rounded-[5px] min-w-[60px] items-center justify-center ${canAdd ? 'bg-orange-500' : 'bg-slate-300'}`}
                  activeOpacity={0.8}
                >
                  {isAdding ? (
                    <Icon name="more-horiz" size={18} color="#ffffff" library="material" />
                  ) : (
                    <Text className={`font-extrabold text-[12px] tracking-wide ${canAdd ? 'text-white' : 'text-slate-500'}`}>
                      {isStoreClosed ? 'CLOSED' : canAdd ? 'ADD' : 'OUT'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.variant === nextProps.variant &&
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.originalPrice === nextProps.product.originalPrice &&
      prevProps.product.inStock === nextProps.product.inStock &&
      prevProps.product.discount === nextProps.product.discount &&
      prevProps.product.image === nextProps.product.image &&
      prevProps.product.name === nextProps.product.name
    );
  }
);
