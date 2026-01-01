import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Animated, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { useCart } from '@/contexts/CartContext';
import { Icon, Icons } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Product } from '@/types';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 120 : 100;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'details' | 'nutrition' | 'reviews'>('details');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <PageHeader title="Product Not Found" variant="primary" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: HEADER_HEIGHT, paddingHorizontal: 24 }}>
          <Animated.View style={{ opacity: fadeAnim, width: '100%', maxWidth: 400 }}>
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 40,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 24, letterSpacing: -0.5 }}>
                Product not found
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  backgroundColor: Colors.primary,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderRadius: 14,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: Colors.textWhite, fontWeight: '700', fontSize: 16, letterSpacing: 0.5 }}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (product.inStock) {
      addToCart(product, quantity);
    }
  };

  const alternativeProducts = MOCK_PRODUCTS
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.inStock)
    .slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="Product Details" variant="primary" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
      >
        {/* Modern Product Image */}
        <Animated.View style={{ position: 'relative', opacity: fadeAnim }}>
          <View style={{
            backgroundColor: Colors.gray100,
            width,
            height: width * 0.9,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            <Image
              source={{ uri: product.image }}
              style={{ width: width * 0.75, height: width * 0.75 }}
              resizeMode="contain"
            />
            {product.discount && (
              <View style={{
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: Colors.error,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                shadowColor: Colors.error,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}>
                <Text style={{ color: Colors.textWhite, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                  {product.discount}% OFF
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
          {/* Enhanced Product Info */}
          <Animated.View style={{ marginBottom: 28, opacity: fadeAnim }}>
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: Colors.textSecondary, 
                marginBottom: 8, 
                fontWeight: '700', 
                letterSpacing: 1, 
                textTransform: 'uppercase' 
              }}>
                {product.brand}
              </Text>
              <Text style={{ 
                fontSize: 26, 
                fontWeight: '800', 
                color: Colors.textPrimary, 
                marginBottom: 16, 
                lineHeight: 34, 
                letterSpacing: -0.6 
              }}>
                {product.name}
              </Text>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 20, 
                gap: 12, 
                flexWrap: 'wrap' 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={{ 
                    fontSize: 30, 
                    fontWeight: '800', 
                    color: Colors.textPrimary, 
                    letterSpacing: -0.8 
                  }}>
                    ₹{product.price}
                  </Text>
                  {product.originalPrice && (
                    <Text style={{ 
                      fontSize: 18, 
                      color: Colors.textTertiary, 
                      textDecorationLine: 'line-through', 
                      fontWeight: '600' 
                    }}>
                      ₹{product.originalPrice}
                    </Text>
                  )}
                </View>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: `${Colors.success}15`,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  gap: 5,
                  borderWidth: 1,
                  borderColor: `${Colors.success}30`,
                }}>
                  <Icon name={Icons.star.name} size={14} color={Colors.success} library={Icons.star.library} />
                  <Text style={{ color: Colors.success, fontSize: 13, fontWeight: '800' }}>
                    {product.rating}
                  </Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                    ({product.reviewCount})
                  </Text>
                </View>
              </View>
              
              {!product.inStock && (
                <View style={{
                  backgroundColor: Colors.errorLight,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: Colors.error,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Icon name="error" size={20} color={Colors.error} library="material" />
                  <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 15, flex: 1 }}>
                    Out of Stock
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Enhanced Quantity Selector */}
          {product.inStock && (
            <Animated.View style={{ marginBottom: 28, opacity: fadeAnim }}>
              <View style={{
                backgroundColor: Colors.surface,
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: Colors.border,
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '700', 
                  color: Colors.textPrimary, 
                  marginBottom: 18, 
                  letterSpacing: -0.2 
                }}>
                  Quantity ({product.unit})
                </Text>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: Colors.gray100,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: Colors.border,
                  }}>
                    <TouchableOpacity
                      onPress={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                      style={{ paddingHorizontal: 20, paddingVertical: 14 }}
                      activeOpacity={0.7}
                    >
                      <Icon name={Icons.remove.name} size={22} color={Colors.textPrimary} library={Icons.remove.library} />
                    </TouchableOpacity>
                    <Text style={{ 
                      paddingHorizontal: 28, 
                      paddingVertical: 14, 
                      color: Colors.textPrimary, 
                      fontWeight: '800', 
                      fontSize: 18,
                      borderLeftWidth: 2,
                      borderRightWidth: 2,
                      borderColor: Colors.border,
                    }}>
                      {quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                      style={{ paddingHorizontal: 20, paddingVertical: 14 }}
                      activeOpacity={0.7}
                    >
                      <Icon name={Icons.add.name} size={22} color={Colors.textPrimary} library={Icons.add.library} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
                      Total
                    </Text>
                    <Text style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 }}>
                      ₹{product.price * quantity}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Enhanced Tabs */}
          <Animated.View style={{ marginBottom: 24, opacity: fadeAnim }}>
            <View style={{ 
              flexDirection: 'row', 
              backgroundColor: Colors.gray100, 
              borderRadius: 16, 
              padding: 6,
              borderWidth: 1,
              borderColor: Colors.border,
            }}>
              {(['details', 'nutrition', 'reviews'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: selectedTab === tab ? Colors.surface : 'transparent',
                    shadowColor: selectedTab === tab ? Colors.shadow : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selectedTab === tab ? 0.1 : 0,
                    shadowRadius: 4,
                    elevation: selectedTab === tab ? 2 : 0,
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 14,
                      letterSpacing: 0.2,
                      color: selectedTab === tab ? Colors.textPrimary : Colors.textSecondary,
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Enhanced Tab Content */}
          <Animated.View style={{ opacity: fadeAnim, marginBottom: 24 }}>
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}>
              {selectedTab === 'details' && (
                <>
                  <Text style={{ 
                    fontSize: 16, 
                    color: Colors.textPrimary, 
                    marginBottom: 24, 
                    lineHeight: 24, 
                    fontWeight: '500' 
                  }}>
                    {product.description}
                  </Text>
                  {product.ingredients && (
                    <View style={{ marginBottom: 24 }}>
                      <Text style={{ 
                        fontSize: 18, 
                        fontWeight: '800', 
                        color: Colors.textPrimary, 
                        marginBottom: 12, 
                        letterSpacing: -0.3 
                      }}>
                        Ingredients
                      </Text>
                      <View style={{
                        backgroundColor: Colors.gray100,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: Colors.border,
                      }}>
                        <Text style={{ 
                          fontSize: 15, 
                          color: Colors.textSecondary, 
                          lineHeight: 24, 
                          fontWeight: '500' 
                        }}>
                          {product.ingredients.join(', ')}
                        </Text>
                      </View>
                    </View>
                  )}
                  {product.manufacturer && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: Colors.border,
                    }}>
                      <View style={{ marginRight: 10 }}>
                        <Icon name="business" size={18} color={Colors.textSecondary} library="material" />
                      </View>
                      <Text style={{ fontSize: 14, color: Colors.textTertiary, fontWeight: '600' }}>
                        Manufacturer: <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{product.manufacturer}</Text>
                      </Text>
                    </View>
                  )}
                </>
              )}

              {selectedTab === 'nutrition' && product.nutrition && (
                <View>
                  <Text style={{ 
                    fontSize: 20, 
                    fontWeight: '800', 
                    color: Colors.textPrimary, 
                    marginBottom: 24, 
                    letterSpacing: -0.5 
                  }}>
                    Nutrition Facts
                  </Text>
                  <View style={{ gap: 16 }}>
                    {[
                      { label: 'Calories', value: `${product.nutrition.calories} kcal`, icon: 'local-fire-department' },
                      { label: 'Protein', value: `${product.nutrition.protein}g`, icon: 'fitness-center' },
                      { label: 'Carbs', value: `${product.nutrition.carbs}g`, icon: 'grain' },
                      { label: 'Fat', value: `${product.nutrition.fat}g`, icon: 'opacity' },
                      ...(product.nutrition.fiber ? [{ label: 'Fiber', value: `${product.nutrition.fiber}g`, icon: 'eco' }] : []),
                    ].map((item, index) => (
                      <View 
                        key={index} 
                        style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          justifyContent: 'space-between', 
                          paddingVertical: 14, 
                          paddingHorizontal: 16,
                          backgroundColor: Colors.gray100,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: Colors.border,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={{
                            backgroundColor: Colors.primary,
                            borderRadius: 8,
                            padding: 8,
                          }}>
                            <Icon name={item.icon} size={18} color={Colors.textWhite} library="material" />
                          </View>
                          <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
                            {item.label}
                          </Text>
                        </View>
                        <Text style={{ color: Colors.textPrimary, fontWeight: '800', fontSize: 16 }}>
                          {item.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedTab === 'reviews' && (
                <View>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 24,
                  }}>
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: '800', 
                      color: Colors.textPrimary, 
                      letterSpacing: -0.5 
                    }}>
                      Reviews ({product.reviewCount})
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: `${Colors.success}15`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      gap: 6,
                      borderWidth: 1,
                      borderColor: `${Colors.success}30`,
                    }}>
                      <Icon name={Icons.star.name} size={16} color={Colors.success} library={Icons.star.library} />
                      <Text style={{ color: Colors.success, fontSize: 16, fontWeight: '800' }}>
                        {product.rating}
                      </Text>
                    </View>
                  </View>
                  <View style={{ 
                    alignItems: 'center', 
                    paddingVertical: 60,
                    backgroundColor: Colors.gray100,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}>
                    <View style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 50,
                      padding: 20,
                      marginBottom: 16,
                    }}>
                      <Icon name="rate-review" size={40} color={Colors.textSecondary} library="material" />
                    </View>
                    <Text style={{ color: Colors.textSecondary, fontSize: 16, fontWeight: '600', marginBottom: 6 }}>
                      No reviews yet
                    </Text>
                    <Text style={{ color: Colors.textTertiary, fontSize: 14, fontWeight: '400' }}>
                      Be the first to review this product!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Enhanced Alternative Products */}
          {!product.inStock && alternativeProducts.length > 0 && (
            <Animated.View style={{ marginTop: 8, opacity: fadeAnim }}>
              <Text style={{ 
                fontSize: 22, 
                fontWeight: '800', 
                color: Colors.textPrimary, 
                marginBottom: 20, 
                letterSpacing: -0.5 
              }}>
                Similar Products Available
              </Text>
              {alternativeProducts.map((altProduct) => (
                <TouchableOpacity
                  key={altProduct.id}
                  onPress={() => router.replace(`/products/${altProduct.id}`)}
                  activeOpacity={0.8}
                  style={{ marginBottom: 16 }}
                >
                  <View style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    shadowColor: Colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{
                        backgroundColor: Colors.gray100,
                        borderRadius: 12,
                        overflow: 'hidden',
                        marginRight: 16,
                        width: 100,
                        height: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Image
                          source={{ uri: altProduct.image }}
                          style={{ width: '90%', height: '90%' }}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ 
                          fontSize: 16, 
                          fontWeight: '700', 
                          color: Colors.textPrimary, 
                          marginBottom: 6, 
                          letterSpacing: -0.3 
                        }}>
                          {altProduct.name}
                        </Text>
                        <Text style={{ 
                          fontSize: 13, 
                          color: Colors.textSecondary, 
                          marginBottom: 10, 
                          fontWeight: '600' 
                        }}>
                          {altProduct.brand}
                        </Text>
                        <Text style={{ 
                          fontSize: 20, 
                          fontWeight: '800', 
                          color: Colors.textPrimary, 
                          letterSpacing: -0.5 
                        }}>
                          ₹{altProduct.price}
                        </Text>
                      </View>
                      <View style={{ justifyContent: 'center' }}>
                        <Icon name="chevron-right" size={24} color={Colors.textTertiary} library="material" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Enhanced Bottom Actions */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.surface,
        borderTopWidth: 1.5,
        borderTopColor: Colors.border,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
      }}>
        {product.inStock ? (
          <TouchableOpacity
            onPress={handleAddToCart}
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 18,
              borderRadius: 14,
              alignItems: 'center',
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: Colors.textWhite, fontWeight: '800', fontSize: 17, letterSpacing: 0.5 }}>
              Add to Cart - ₹{product.price * quantity}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: Colors.gray200,
              paddingVertical: 18,
              borderRadius: 14,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: Colors.gray300,
            }}
            activeOpacity={0.8}
            onPress={() => {
              // Handle notify me
            }}
          >
            <Text style={{ color: Colors.textSecondary, fontWeight: '800', fontSize: 17, letterSpacing: 0.5 }}>
              Notify Me When Available
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
