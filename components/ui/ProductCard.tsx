import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import React from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  className?: string;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const { addToCart } = useCart();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAddToCart = () => {
    if (product.inStock) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      addToCart(product, 1);
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{ width: '100%' }}
      >
        <View style={{
          width: '100%',
          backgroundColor: Colors.textWhite,
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: Colors.gray200,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          opacity: !product.inStock ? 0.6 : 1,
        }}>
          <View style={{ position: 'relative', backgroundColor: Colors.surface, height: 180, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={{ uri: product.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />

            {product.discount && (
              <View style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: Colors.primary,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}>
                <Text style={{ color: Colors.textWhite, fontSize: 11, fontWeight: '700' }}>
                  {product.discount}% OFF
                </Text>
              </View>
            )}

            {!product.inStock && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <View style={{
                  backgroundColor: Colors.textWhite,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 4,
                }}>
                  <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 12 }}>
                    Out of Stock
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={{ padding: 12 }}>
            <Text
              style={{
                color: Colors.textPrimary,
                fontWeight: '500',
                fontSize: 14,
                marginBottom: 6,
                lineHeight: 18,
                minHeight: 36,
              }}
              numberOfLines={2}
            >
              {product.name}
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.accent,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                marginRight: 6,
              }}>
                <Icon name={Icons.star.name} size={10} color={Colors.textWhite} library={Icons.star.library} />
                <Text style={{ color: Colors.textWhite, fontSize: 10, fontWeight: '700', marginLeft: 2 }}>
                  {product.rating}
                </Text>
              </View>
              <Text style={{ color: Colors.textSecondary, fontSize: 11 }}>
                ({product.reviewCount})
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              marginBottom: 12,
            }}>
              <Text style={{ color: Colors.textPrimary, fontWeight: '700', fontSize: 18 }}>
                ₹{product.price}
              </Text>
              {product.originalPrice && (
                <Text style={{
                  color: Colors.textTertiary,
                  textDecorationLine: 'line-through',
                  fontSize: 12,
                  marginLeft: 8,
                  fontWeight: '400'
                }}>
                  ₹{product.originalPrice}
                </Text>
              )}
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={!product.inStock}
                style={{
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: product.inStock ? Colors.primary : Colors.gray300,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: 13,
                    color: product.inStock ? Colors.textWhite : Colors.textSecondary,
                  }}
                >
                  {product.inStock ? 'Add to Cart' : 'Notify Me'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
