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

    // Kick off fly-to-cart animation immediately
    if (imageRef.current) {
      imageRef.current.measureInWindow((x, y, width, height) => {
        // Only run if we actually got valid measurements
        if (x !== undefined && y !== undefined && width > 0) {
          startAnimation({ x, y, width, height }, product.image || 'https://via.placeholder.com/150', () => {});
        }
      });
    }

    // Scale feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();

    // addToCart handles authentication internally and synchronous optimistic updates
    try {
      addToCart(product, product.minQuantity || 1);
    } catch (error) {
      console.warn('Failed to add to cart:', error);
    }

    // Reset adding flag after brief delay (for visual feedback)
    setTimeout(() => setIsAdding(false), 500);
  };

  const hasDiscount = product.discount && product.discount > 0;

  if (variant === 'horizontal') {
    return (
      <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          style={{
            backgroundColor: Colors.textWhite,
            borderRadius: 16,
            padding: 12,
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.04)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 3,
            marginBottom: 12,
          }}
        >
          {/* Image Section */}
          <View ref={imageRef} collapsable={false} style={{ position: 'relative', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 6 }}>
            {hasDiscount && (
              <View style={{
                position: 'absolute',
                top: 4,
                left: 4,
                backgroundColor: Colors.error,
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 6,
                zIndex: 1,
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{product.discount}%</Text>
              </View>
            )}
            {product.packagingOptions && product.packagingOptions.length > 0 && (
              <View style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: '#E3F2FD',
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 6,
                zIndex: 1,
                borderWidth: 1,
                borderColor: 'rgba(21, 101, 192, 0.1)',
              }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#1565C0' }}>{product.packagingOptions.length} OPTIONS</Text>
              </View>
            )}
            <Image
              source={{ uri: product.image || 'https://via.placeholder.com/150' }}
              style={{ width: 85, height: 85, borderRadius: 8 }}
              resizeMode="contain"
              resizeMethod="resize"
              fadeDuration={0}
            />
          </View>

          {/* Details Section */}
          <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.textTertiary, marginBottom: 6 }}>{product.unit}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary }}>₹{product.price}</Text>
                {hasDiscount && (
                  <Text style={{ fontSize: 11, color: Colors.textTertiary, textDecorationLine: 'line-through' }}>
                    ₹{product.originalPrice}
                  </Text>
                )}
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  onPress={product.packagingOptions && product.packagingOptions.length > 0 ? onPress : handleAddToCart}
                  disabled={!product.inStock && (!product.packagingOptions || product.packagingOptions.length === 0)}
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? Colors.primary : Colors.gray300,
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? 0.25 : 0,
                    shadowRadius: 4,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontWeight: '700', fontSize: 12, color: product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? Colors.textWhite : Colors.textSecondary }}>
                    {product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? 'ADD' : 'OUT'}
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
    <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          backgroundColor: Colors.textWhite,
          borderRadius: 18,
          padding: 10,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.04)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <View style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: Colors.error,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            zIndex: 1,
            shadowColor: Colors.error,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}>{product.discount}% OFF</Text>
          </View>
        )}

        {/* Image Section */}
        <View ref={imageRef} collapsable={false} style={{ alignItems: 'center', marginBottom: 10, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 8, position: 'relative' }}>
          {product.packagingOptions && product.packagingOptions.length > 0 && (
            <View style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: '#E3F2FD',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
              zIndex: 1,
              borderWidth: 1,
              borderColor: 'rgba(21, 101, 192, 0.1)',
            }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: '#1565C0' }}>{product.packagingOptions.length} OPTIONS</Text>
            </View>
          )}
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/150' }}
            style={{ width: '100%', height: 140, borderRadius: 8 }}
            resizeMode="contain"
            resizeMethod="resize"
            fadeDuration={0}
          />
        </View>

        {/* Product Details */}
        <View style={{ width: '100%' }}>
          {/* Product Name */}
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4, lineHeight: 18 }}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          {/* Unit */}
          <Text style={{ fontSize: 11, color: Colors.textTertiary, marginBottom: 6 }}>{product.unit}</Text>

          {/* Price and Add Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary }}>₹{product.price}</Text>
              {hasDiscount && (
                <Text style={{ fontSize: 11, color: Colors.textTertiary, textDecorationLine: 'line-through', marginTop: 2 }}>
                  ₹{product.originalPrice}
                </Text>
              )}
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={product.packagingOptions && product.packagingOptions.length > 0 ? onPress : handleAddToCart}
                disabled={!product.inStock && (!product.packagingOptions || product.packagingOptions.length === 0)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor: product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? Colors.primary : Colors.gray300,
                  minWidth: 70,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? 0.3 : 0,
                  shadowRadius: 5,
                }}
                activeOpacity={0.8}
              >
                {isAdding ? (
                  <Icon name="more-horiz" size={18} color={Colors.textWhite} library="material" />
                ) : (
                  <Text
                    style={{
                      fontWeight: '800',
                      fontSize: 13,
                      color: product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? Colors.textWhite : Colors.textSecondary,
                      letterSpacing: 0.5,
                    }}
                  >
                    {product.inStock || (product.packagingOptions && product.packagingOptions.length > 0) ? 'ADD' : 'OUT'}
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
