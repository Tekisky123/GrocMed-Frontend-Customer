const fs = require('fs');

const code = `import { Icon } from '@/components/ui/Icon';
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
  const { addToCart } = useCart();
  const { startAnimation } = useCartAnimation();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const imageRef = React.useRef<View>(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = () => {
    if (!product || !product.inStock || isAdding) return;
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
  };

  const hasDiscount = product.discount && product.discount > 0;
  const hasOptions = product.packagingOptions && product.packagingOptions.length > 0;
  const isAvailable = product.inStock || hasOptions;

  if (variant === 'horizontal') {
    return (
      <Animated.View style={{ opacity: fadeAnim }} className="w-full">
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          className="bg-white rounded-2xl p-3 flex-row border border-black/5 shadow-sm mb-3"
        >
          {/* Image Section */}
          <View ref={imageRef} collapsable={false} className="relative bg-gray-50 rounded-xl p-1.5 justify-center items-center">
            {hasDiscount && (
              <View className="absolute top-1 left-1 bg-red-500 px-1.5 py-0.5 rounded z-10">
                <Text className="text-white text-[9px] font-extrabold">{product.discount}%</Text>
              </View>
            )}
            {hasOptions && (
              <View className="absolute top-1 right-1 bg-blue-50 px-1.5 py-0.5 rounded z-10 border border-blue-200">
                <Text className="text-[9px] font-extrabold text-blue-700">{product.packagingOptions?.length} OPTIONS</Text>
              </View>
            )}
            <Image
              source={{ uri: product.image || 'https://via.placeholder.com/150' }}
              className="w-20 h-20 rounded-lg"
              resizeMode="contain"
              resizeMethod="resize"
              fadeDuration={0}
            />
          </View>

          {/* Details Section */}
          <View className="flex-1 ml-3 justify-between py-1">
            <View>
              <Text className="text-sm font-bold text-gray-900 mb-1 leading-tight" numberOfLines={2}>
                {product.name}
              </Text>
              <Text className="text-[11px] text-gray-500">{product.unit}</Text>
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <View>
                <Text className="text-base font-extrabold text-gray-900">₹{product.price}</Text>
                {hasDiscount && (
                  <Text className="text-[10px] text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </Text>
                )}
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  onPress={hasOptions ? onPress : handleAddToCart}
                  disabled={!isAvailable}
                  className={\`py-1.5 px-3.5 rounded-lg shadow-sm \${isAvailable ? 'bg-orange-500' : 'bg-gray-300'}\`}
                  activeOpacity={0.8}
                >
                  <Text className={\`font-bold text-xs \${isAvailable ? 'text-white' : 'text-gray-500'}\`}>
                    {isAvailable ? 'ADD' : 'OUT'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Vertical variant (default)
  return (
    <Animated.View style={{ opacity: fadeAnim }} className="w-full">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className="bg-white rounded-2xl p-2.5 border border-black/5 shadow-sm flex-1"
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg z-10 shadow-sm">
            <Text className="text-white text-[10px] font-extrabold tracking-wider">{product.discount}% OFF</Text>
          </View>
        )}

        {/* Image Section */}
        <View ref={imageRef} collapsable={false} className="items-center mb-2.5 bg-gray-50 rounded-xl p-2 relative w-full aspect-square justify-center">
          {hasOptions && (
            <View className="absolute top-1 right-1 bg-blue-50 px-1.5 py-0.5 rounded-md z-10 border border-blue-200">
              <Text className="text-[9px] font-extrabold text-blue-700">{product.packagingOptions?.length} OPTIONS</Text>
            </View>
          )}
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/150' }}
            className="w-full h-full rounded-lg"
            resizeMode="contain"
            resizeMethod="resize"
            fadeDuration={0}
          />
        </View>

        {/* Product Details */}
        <View className="w-full flex-1 justify-between">
          <View>
            <Text
              className="text-sm font-bold text-gray-900 mb-1 leading-snug"
              numberOfLines={2}
            >
              {product.name}
            </Text>
            <Text className="text-[11px] text-gray-500 mb-1.5">{product.unit}</Text>
          </View>

          {/* Price and Add Button */}
          <View className="flex-row items-end justify-between mt-1">
            <View className="flex-1">
              <Text className="text-base font-extrabold text-gray-900">₹{product.price}</Text>
              {hasDiscount && (
                <Text className="text-[10px] text-gray-400 line-through mt-0.5">
                  ₹{product.originalPrice}
                </Text>
              )}
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={hasOptions ? onPress : handleAddToCart}
                disabled={!isAvailable}
                className={\`py-2 px-4 rounded-xl min-w-[70px] items-center justify-center shadow-sm \${isAvailable ? 'bg-orange-500' : 'bg-gray-300'}\`}
                activeOpacity={0.8}
              >
                {isAdding ? (
                  <Icon name="more-horiz" size={18} color="#fff" library="material" />
                ) : (
                  <Text className={\`font-extrabold text-sm tracking-wide \${isAvailable ? 'text-white' : 'text-gray-500'}\`}>
                    {isAvailable ? 'ADD' : 'OUT'}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
  },
  (prevProps, nextProps) => {
    return prevProps.product.id === nextProps.product.id && prevProps.variant === nextProps.variant;
  }
);
\`;

fs.writeFileSync('/Users/umairuddin/Desktop/GrocMed/GrocMed-Frontend-Customer/components/ui/ProductCard.tsx', code);
`;

